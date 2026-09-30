#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { arg, exists, isMain, normalizeText, projectPaths, readJson, tokens } from '../lib/pipeline.js';
import { compileFlowPrompt } from './compile-flow-prompt.js';

function filled(value,min=3){return typeof value==='string'&&value.trim().length>=min&&!value.trim().startsWith('[');}
function meaningful(value){if(typeof value==='string')return filled(value,4);if(value&&typeof value==='object')return Object.values(value).some((v)=>filled(v,4));return false;}
function imageBlocks(prompt){return prompt.split(/\n(?=## Bild \d{2,3}\b)/i).filter((x)=>/^## Bild \d{2,3}\b/i.test(x.trim()));}

function validateScoreBlock(block,policy,label,errors){
  const dims=policy.dimensions??[],minDim=Number(policy.minimumDimensionScore??7),minScore=Number(policy.minimumScore??8),values=[];
  for(const key of dims){
    const v=Number(block?.[key]);
    if(!Number.isFinite(v)||v<1||v>10)errors.push(`${label}.${key} muss 1–10 sein.`);
    else{values.push(v);if(v<minDim)errors.push(`${label}.${key} muss mindestens ${minDim}/10 erreichen.`);}
  }
  const avg=values.length===dims.length&&values.length?values.reduce((a,b)=>a+b,0)/values.length:0;
  const declared=Number(block?.score);
  if(!Number.isFinite(declared)||declared<minScore)errors.push(`${label}.score muss mindestens ${minScore}/10 sein.`);
  if(avg&&Math.abs(avg-declared)>0.75)errors.push(`${label}.score passt nicht zu den Einzeldimensionen (Ø ${avg.toFixed(1)}).`);
  if(String(block?.verdict).toUpperCase()!=='APPROVED')errors.push(`${label}.verdict muss APPROVED sein.`);
}

function validateResearch(research,policy,minSources,minClaims,errors){
  const sources=Array.isArray(research.sources)?research.sources:[],claims=Array.isArray(research.claims)?research.claims:[];
  if(research.status!=='READY')errors.push('RESEARCH.status muss für reale Aussagen READY sein.');
  if(!filled(research.summary,20))errors.push('RESEARCH.summary fehlt oder ist zu knapp.');
  const validSources=sources.filter((s)=>filled(s?.id,2)&&filled(s?.title,4)&&(filled(s?.url,6)||filled(s?.publisher,3)));
  if(validSources.length<minSources)errors.push(`RESEARCH: mindestens ${minSources} belastbare Quelle(n) erforderlich.`);
  const ids=new Set(validSources.map((s)=>s.id));
  let validClaims=0;
  for(const claim of claims){
    const refs=Array.isArray(claim?.sourceIds)?claim.sourceIds:[];
    if(filled(claim?.statement,12)&&policy.allowedConfidence?.includes(claim?.confidence)&&refs.length&&refs.every((id)=>ids.has(id)))validClaims+=1;
    else errors.push(`RESEARCH: Claim ${claim?.id??'?'} ist unvollständig oder verweist auf unbekannte Quellen.`);
  }
  if(validClaims<minClaims)errors.push(`RESEARCH: mindestens ${minClaims} belegte Claim(s) erforderlich.`);
}

function validateScriptFormat(plan,policy,errors){
  const type=plan.scriptFormat?.type;
  const formatPolicy=policy.scriptFormatPolicy??{};
  const allowed=formatPolicy.allowedFormats??[];
  if(!allowed.includes(type)){
    errors.push(`CONTENT_PLAN.scriptFormat.type muss einer von ${allowed.join(', ')} sein.`);
    return;
  }
  if(!filled(plan.scriptFormat?.reason,12)||!filled(plan.scriptFormat?.whyThisFormat,12))errors.push('CONTENT_PLAN.scriptFormat braucht reason und whyThisFormat.');

  const fp=plan.formatPlan??{},quality=policy.formatQualityPolicy?.[type]??{};
  if(type==='mini-stories'){
    const mini=fp.miniStories??{},sections=Array.isArray(mini.sections)?mini.sections:[];
    if(!filled(mini.orderingLogic,8))errors.push('CONTENT_PLAN.formatPlan.miniStories.orderingLogic fehlt.');
    const min=Number(quality.minimumSections??4);
    if(sections.length<min)errors.push(`Mini-Stories brauchen mindestens ${min} starke Abschnitte.`);
    const fields=quality.requiredSectionFields??['label','coreIdea','concreteMoment','weirdDetail','consequence'];
    sections.forEach((section,i)=>fields.forEach((key)=>{if(!filled(section?.[key],4))errors.push(`Mini-Story ${i+1}: ${key} fehlt.`);}));
  }
  if(type==='progression'){
    const prog=fp.progression??{},stages=Array.isArray(prog.stages)?prog.stages:[];
    for(const key of['axis','startState','endState'])if(!filled(prog[key],6))errors.push(`CONTENT_PLAN.formatPlan.progression.${key} fehlt.`);
    const min=Number(quality.minimumStages??4);
    if(stages.length<min)errors.push(`Progression braucht mindestens ${min} echte Stufen.`);
    const fields=quality.requiredStageFields??['label','change','consequence','visualIdea'];
    stages.forEach((stage,i)=>fields.forEach((key)=>{if(!filled(stage?.[key],4))errors.push(`Progression Stufe ${i+1}: ${key} fehlt.`);}));
  }
  if(type==='story'){
    const story=fp.story??{},storyPolicy=formatPolicy.formats?.story??{};
    for(const key of storyPolicy.requiredFields??['immediateGoal','centralProblem','midpointTurn','finalEscalation','endingCallback'])if(!filled(story[key],8))errors.push(`CONTENT_PLAN.formatPlan.story.${key} fehlt oder ist zu knapp.`);
    if(!filled(story.protagonistOrFocus,3))errors.push('CONTENT_PLAN.formatPlan.story.protagonistOrFocus fehlt.');
    if(!filled(story.incitingIncident,8))errors.push('CONTENT_PLAN.formatPlan.story.incitingIncident fehlt.');
    if(!filled(story.setupPayoff?.setup,6)||!filled(story.setupPayoff?.payoff,6))errors.push('CONTENT_PLAN.formatPlan.story.setupPayoff braucht Setup und Payoff.');
    const turns=Array.isArray(story.causalTurns)?story.causalTurns.filter(meaningful):[];
    const minTurns=Number(quality.minimumCausalTurns??storyPolicy.minimumCausalTurns??4);
    if(turns.length<minTurns)errors.push(`Story braucht mindestens ${minTurns} kausale Wendungen.`);
    const beats=Array.isArray(story.beats)?story.beats:[];
    const minBeats=Number(quality.minimumStoryBeats??storyPolicy.minimumStoryBeats??6);
    if(beats.length<minBeats)errors.push(`Story braucht mindestens ${minBeats} Story-Beats.`);
    beats.forEach((beat,i)=>{if(!filled(beat?.purpose,4)||!filled(beat?.content,6))errors.push(`Story-Beat ${i+1} braucht purpose und content.`);});
  }
}

export async function validatePhase1(projectDirectory){
  const p=projectPaths(projectDirectory),errors=[];
  for(const required of[p.meta,p.contentPlan,p.research,p.mapping,p.renderPlan,p.prompt,p.script])if(!(await exists(required)))errors.push(`Pflichtdatei fehlt: ${path.relative(p.projectDir,required)}`);
  if(errors.length)return{passed:false,errors};

  const [meta,plan,research,mapping,visual,policy,pipeline,prompt,script]=await Promise.all([
    readJson(p.meta),readJson(p.contentPlan),readJson(p.research),readJson(p.mapping),readJson(path.resolve('config/visual-policy.json')),readJson(path.resolve('config/content-policy.json')),readJson(path.resolve('config/pipeline.json')),readFile(p.prompt,'utf8'),readFile(p.script,'utf8')
  ]);

  if(visual.status!=='READY'||!visual.styleId)errors.push('Visual Policy ist nicht READY.');
  if(policy.status!=='READY'||Number(policy.contentPolicyVersion)!==9)errors.push('Content Policy V9 ist nicht READY.');
  if(meta.visualStyleId!==visual.styleId)errors.push('video.json nutzt nicht die aktive styleId.');
  if(Number(meta.contentPolicyVersion)!==9||Number(plan.contentPolicyVersion)!==9||Number(plan.schemaVersion)!==9)errors.push('Projekt nutzt nicht Content-/Schema-Version 9.');
  if(!meta.title||!meta.topic||!meta.topicSlug)errors.push('Titel, Thema oder Slug fehlen.');
  if(!Number.isInteger(meta.plannedImageCount)||meta.plannedImageCount<1)errors.push('plannedImageCount muss gesetzt sein.');
  if(!Number.isFinite(Number(meta.targetDurationSeconds))||Number(meta.targetDurationSeconds)<=0)errors.push('targetDurationSeconds muss gesetzt sein.');
  const hold=Number(meta.endHoldSeconds);if(hold<pipeline.endHoldPolicy.minimumSeconds||hold>pipeline.endHoldPolicy.maximumSeconds)errors.push('endHoldSeconds liegt außerhalb der erlaubten Range.');

  if(plan.language!=='de')errors.push('CONTENT_PLAN.language muss de sein.');
  if(normalizeText(plan.topic)!==normalizeText(meta.topic))errors.push('CONTENT_PLAN.topic entspricht nicht video.json.topic.');
  const modes=policy.contentModePolicy?.allowedModes??[];if(!modes.includes(plan.contentMode))errors.push(`CONTENT_PLAN.contentMode muss einer von ${modes.join(', ')} sein.`);

  const fit=plan.topicFit??{},minFit=Number(policy.nicheFitPolicy?.minimumPlanScore??7);
  if(!Number.isFinite(Number(fit.score))||Number(fit.score)<minFit)errors.push(`CONTENT_PLAN: Kanalfit muss mindestens ${minFit}/10 sein.`);
  if(String(fit.verdict).toUpperCase()!=='APPROVED')errors.push('CONTENT_PLAN: topicFit.verdict muss APPROVED sein.');
  if(!(Array.isArray(fit.pillars)&&fit.pillars.some((x)=>filled(x,4)))||!filled(fit.reason,12))errors.push('CONTENT_PLAN: Kanalfit braucht Pfeiler und Begründung.');

  validateScoreBlock(plan.topicQuality??{},policy.topicQualityPolicy??{},'CONTENT_PLAN.topicQuality',errors);
  validateScoreBlock(plan.scriptQuality??{},policy.scriptQualityPolicy??{},'CONTENT_PLAN.scriptQuality',errors);
  if(!filled(plan.topicQuality?.reason,12)||!filled(plan.topicQuality?.whyNotBoring,12))errors.push('CONTENT_PLAN.topicQuality braucht reason und whyNotBoring.');
  if(!filled(plan.scriptQuality?.reason,12))errors.push('CONTENT_PLAN.scriptQuality braucht eine Begründung.');

  for(const [key,label,min] of [['viewerPromise','Zuschauer-Versprechen',12],['coreQuestion','Kernfrage',8],['angle','individueller Blickwinkel',8],['individualityReason','Begründung der Individualität',12],['payoff','Payoff',8]])if(!filled(plan[key],min))errors.push(`CONTENT_PLAN: ${label} fehlt oder ist zu knapp.`);

  validateScriptFormat(plan,policy,errors);

  const hook=plan.hook??{};
  if(!policy.hookPolicy?.allowedTypes?.includes(hook.type))errors.push('CONTENT_PLAN: Hook-Typ ist nicht gültig.');
  if(!filled(hook.text,10)||!filled(hook.reason,8))errors.push('CONTENT_PLAN: Hook oder Hook-Begründung fehlt.');

  const entertainment=Array.isArray(plan.entertainmentBeats)?plan.entertainmentBeats:[];
  if(entertainment.filter(meaningful).length<Number(policy.entertainmentDensityPolicy?.minimumBeats??6))errors.push(`CONTENT_PLAN: mindestens ${policy.entertainmentDensityPolicy?.minimumBeats??6} Unterhaltungsbeats erforderlich.`);
  const retention=plan.retention??{},signals=[...(retention.openLoops??[]),...(retention.escalationPoints??[]),...(retention.patternInterrupts??[])].filter(meaningful);
  if(signals.length<Number(policy.retentionPolicy?.minimumPlannedSignals??4))errors.push(`CONTENT_PLAN: mindestens ${policy.retentionPolicy?.minimumPlannedSignals??4} echte Retention-/Struktursignale planen.`);

  const ending=plan.ending??{};
  if(!filled(ending.type,3)||!filled(ending.finalLine,8))errors.push('CONTENT_PLAN: Ending-Typ und finale Zeile müssen geplant sein.');
  const tc=plan.titleCoverSystem??{},cover=tc.coverConcept??{},coverText=String(cover.visibleText??'').trim();
  if(!filled(tc.finalTitle,6)||!filled(tc.titlePromise,8))errors.push('CONTENT_PLAN: finaler Titel oder titlePromise fehlt.');
  if(!filled(cover.visualConflict,8))errors.push('CONTENT_PLAN: Cover braucht einen klaren visuellen Konflikt.');
  const subjects=Array.isArray(cover.mainSubjects)?cover.mainSubjects.filter((x)=>filled(x,2)):[];
  if(subjects.length<1||subjects.length>3)errors.push('CONTENT_PLAN: Cover braucht 1 bis 3 große Hauptmotive.');
  const minHeadline=Number(policy.titleCoverPolicy?.coverHeadlineMinWords??1),maxHeadline=Number(policy.titleCoverPolicy?.coverHeadlineMaxWords??4),headlineWords=tokens(coverText).length;
  if(!coverText||headlineWords<minHeadline||headlineWords>maxHeadline)errors.push(`CONTENT_PLAN: Cover braucht ${minHeadline} bis ${maxHeadline} Wörter.`);
  if(coverText&&normalizeText(coverText)===normalizeText(tc.finalTitle))errors.push('CONTENT_PLAN: Covertext darf den Titel nicht vollständig wiederholen.');
  if(!filled(cover.emotion,3)||!filled(cover.whyClickable,8)||!filled(tc.complementarity,12))errors.push('CONTENT_PLAN: Cover-Emotion, Klickgrund oder Titel-Cover-Zusammenspiel fehlt.');

  const mode=plan.contentMode,rp=policy.researchPolicy??{};
  if(mode==='real')validateResearch(research,rp,Number(rp.minimumSourcesReal??2),Number(rp.minimumClaimsReal??4),errors);
  if(mode==='hybrid'){
    validateResearch(research,rp,Number(rp.minimumSourcesHybrid??1),Number(rp.minimumClaimsHybrid??1),errors);
    const b=plan.truthBoundary??{};if(!(Array.isArray(b.realElements)&&b.realElements.length)||!(Array.isArray(b.inventedElements)&&b.inventedElements.length))errors.push('Hybrid-Modus braucht realElements und inventedElements in truthBoundary.');
  }

  const cleanScript=script.trim(),wordCount=tokens(cleanScript).length;
  if(wordCount<80||/VOICE-OVER-SKRIPT HIER EINFÜGEN/i.test(cleanScript))errors.push('Voice-over-Skript fehlt oder ist zu kurz.');
  if(filled(hook.text)&&!cleanScript.startsWith(hook.text.trim()))errors.push('Der geplante Hook muss der erste gesprochene Inhalt sein.');
  if(/^(hallo( und)? willkommen|willkommen zu einem neuen video|in diesem video schauen wir uns an|heute reden wir über|wusstest du schon|ein reales beispiel ist)/i.test(cleanScript))errors.push('Skript beginnt mit einer verbotenen generischen Formel.');
  if(/unsere hauptfigur ist erfunden|diese geschichte ist erfunden|dies ist nur eine fiktive geschichte|laut unseren quellen/i.test(cleanScript))errors.push('Voice-over enthält Produktions-, Fiktions- oder Quellen-Meta.');
  const fakeDrama=(cleanScript.match(/\b(jetzt wird es interessant|schlechte idee|zu spät|aber warte|und jetzt wird es verrückt)\b/gi)??[]).length;
  if(fakeDrama>=3)errors.push('Skript nutzt zu viele künstliche Spannungsmarker statt echten Inhalt.');
  if(filled(ending.finalLine)&&!cleanScript.slice(-1200).includes(ending.finalLine.trim()))errors.push('Die geplante finale Zeile muss am Ende des Skripts vorkommen.');

  if(/\{\{[^}]+\}\}/.test(prompt)||/\[[A-ZÄÖÜ0-9 _,-]{3,}\]/.test(prompt))errors.push('Bildprompt-Datei enthält noch Platzhalter.');
  if(!/VERBINDLICHE BILDWELT/i.test(prompt))errors.push('Bildprompt-Datei: verbindliche Bildwelt fehlt.');
  const blocks=imageBlocks(prompt);
  if(Number.isInteger(meta.plannedImageCount)&&blocks.length!==meta.plannedImageCount)errors.push(`Bildprompt-Datei enthält ${blocks.length} Bilder, erwartet ${meta.plannedImageCount}.`);
  blocks.forEach((block,i)=>{const n=i+1,head=block.match(/^## Bild (\d{2,3})\b/i),body=block.match(/\nBILDPROMPT:\s*\n([\s\S]+)$/i)?.[1]?.trim()??'';if(Number(head?.[1])!==n)errors.push(`Bildprompt ${n}: Nummerierung ist nicht lückenlos.`);if(body.length<220)errors.push(`Bild ${n}: Einzelprompt ist zu knapp (${body.length} Zeichen).`);if(!/16:9/.test(body))errors.push(`Bild ${n}: 16:9 fehlt.`);});
  const first=blocks[0]??'',headlineMatch=first.match(/ÜBERSCHRIFT:\s*"([^"]+)"/i);
  if(!headlineMatch)errors.push('Bild 01: Pflichtzeile ÜBERSCHRIFT fehlt.');else if(normalizeText(headlineMatch[1])!==normalizeText(coverText))errors.push('Bild 01: Überschrift entspricht nicht CONTENT_PLAN.');

  const images=Array.isArray(mapping.images)?mapping.images:[];
  if(Number.isInteger(meta.plannedImageCount)&&images.length!==meta.plannedImageCount)errors.push(`Mapping enthält ${images.length} Bilder, erwartet ${meta.plannedImageCount}.`);
  for(let i=0;i<images.length;i+=1){
    const image=images[i],n=i+1,expected=`Bild ${String(n).padStart(2,'0')}.png`;
    if(Number(image.imageNumber)!==n||image.imageFile!==expected)errors.push(`Bild ${n}: Nummer/Dateiname nicht lückenlos.`);
    for(const key of['startAnchor','visualPurpose','topicAnchor','visualForm'])if(!filled(image[key],3))errors.push(`Bild ${n}: ${key} fehlt.`);
    if(!Number.isFinite(Number(image.plannedHoldSeconds))||Number(image.plannedHoldSeconds)<=0)errors.push(`Bild ${n}: plannedHoldSeconds fehlt.`);
  }

  if(!errors.length){try{await compileFlowPrompt(projectDirectory);}catch(error){errors.push(`Flow-Compiler: ${error.message}`);}}
  return{passed:errors.length===0,errors};
}

async function main(){const dir=arg('--dir');if(!dir)throw new Error('Nutzung: node src/cli/validate-phase1.js --dir "youtube/..."');const r=await validatePhase1(dir);if(!r.passed){r.errors.forEach((e)=>console.error(`- ${e}`));throw new Error(`${r.errors.length} Phase-1-Regel(n) verletzt.`);}console.log('Phase 1 Basis V9: BESTANDEN.');}
if(isMain(import.meta.url))main().catch((e)=>{console.error(`Phase-1-QC: FEHLER — ${e.message}`);process.exitCode=1;});
