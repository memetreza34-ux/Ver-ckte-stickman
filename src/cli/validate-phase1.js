#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { arg, exists, isMain, normalizeText, projectPaths, readJson, tokens } from '../lib/pipeline.js';
import { compileFlowPrompt } from './compile-flow-prompt.js';

function filled(value,min=3){return typeof value==='string'&&value.trim().length>=min&&!value.trim().startsWith('[');}
function meaningful(value){if(typeof value==='string')return filled(value,4);if(value&&typeof value==='object')return Object.values(value).some((v)=>filled(v,4));return false;}
function imageBlocks(prompt){return prompt.split(/\n(?=## Bild \d{2,3}\b)/i).filter((x)=>/^## Bild \d{2,3}\b/i.test(x.trim()));}

export async function validatePhase1(projectDirectory){
  const p=projectPaths(projectDirectory),errors=[];
  for(const required of[p.meta,p.contentPlan,p.research,p.mapping,p.renderPlan,p.prompt,p.script])if(!(await exists(required)))errors.push(`Pflichtdatei fehlt: ${path.relative(p.projectDir,required)}`);
  if(errors.length)return{passed:false,errors};
  const [meta,contentPlan,research,mapping,visual,contentPolicy,pipeline,prompt,script]=await Promise.all([
    readJson(p.meta),readJson(p.contentPlan),readJson(p.research),readJson(p.mapping),readJson(path.resolve('config/visual-policy.json')),readJson(path.resolve('config/content-policy.json')),readJson(path.resolve('config/pipeline.json')),readFile(p.prompt,'utf8'),readFile(p.script,'utf8')
  ]);
  if(visual.status!=='READY'||!visual.styleId||(visual.rules?.length??0)<4)errors.push('Visual Policy ist nicht READY oder zu leer.');
  if(contentPolicy.status!=='READY'||!contentPolicy.contentPolicyVersion)errors.push('Content Policy ist nicht READY.');
  if(meta.visualStyleId!==visual.styleId)errors.push('video.json nutzt nicht die aktive styleId.');
  if(Number(meta.contentPolicyVersion)!==Number(contentPolicy.contentPolicyVersion))errors.push('video.json nutzt nicht die aktive Content-Policy-Version.');
  if(!meta.title||!meta.topic||!meta.topicSlug)errors.push('Titel, Thema oder Slug fehlen.');
  if(!Number.isInteger(meta.plannedImageCount)||meta.plannedImageCount<1)errors.push('plannedImageCount muss gesetzt sein.');
  if(!Number.isFinite(Number(meta.targetDurationSeconds))||Number(meta.targetDurationSeconds)<=0)errors.push('targetDurationSeconds muss gesetzt sein.');
  const hold=Number(meta.endHoldSeconds);if(hold<pipeline.endHoldPolicy.minimumSeconds||hold>pipeline.endHoldPolicy.maximumSeconds)errors.push('endHoldSeconds liegt außerhalb der erlaubten Range.');

  if(contentPlan.language!=='de')errors.push('CONTENT_PLAN.language muss de sein.');
  if(normalizeText(contentPlan.topic)!==normalizeText(meta.topic))errors.push('CONTENT_PLAN.topic entspricht nicht video.json.topic.');
  const fit=contentPlan.topicFit??{},minimumFit=Number(contentPolicy.nicheFitPolicy?.minimumPlanScore??7);
  if(!Number.isFinite(Number(fit.score))||Number(fit.score)<minimumFit)errors.push(`CONTENT_PLAN: Kanalfit muss mindestens ${minimumFit}/10 sein.`);
  if(String(fit.verdict).toUpperCase()!=='APPROVED')errors.push('CONTENT_PLAN: topicFit.verdict muss APPROVED sein.');
  if(!(Array.isArray(fit.pillars)&&fit.pillars.some((x)=>filled(x,4)))||!filled(fit.reason,12))errors.push('CONTENT_PLAN: Kanalfit braucht mindestens einen Kanalpfeiler und eine Begründung.');
  for(const [key,label,min] of [['viewerPromise','Zuschauer-Versprechen',12],['coreQuestion','Kernfrage',8],['angle','individueller Blickwinkel',8],['individualityReason','Begründung der Individualität',12],['payoff','Payoff',8]])if(!filled(contentPlan[key],min))errors.push(`CONTENT_PLAN: ${label} fehlt oder ist zu knapp.`);
  const hook=contentPlan.hook??{};
  if(!contentPolicy.hookPolicy?.allowedTypes?.includes(hook.type))errors.push('CONTENT_PLAN: Hook-Typ ist nicht gültig.');
  if(!filled(hook.text,12)||!filled(hook.reason,8))errors.push('CONTENT_PLAN: Hook oder Hook-Begründung fehlt.');
  if(!contentPolicy.storyPolicy?.narrativeModes?.includes(contentPlan.narrativeMode))errors.push('CONTENT_PLAN: Erzählmodus ist nicht gültig.');
  const beats=Array.isArray(contentPlan.beats)?contentPlan.beats:[];if(beats.length<3)errors.push('CONTENT_PLAN: mindestens 3 individuelle Story-Beats erforderlich.');
  for(let i=0;i<beats.length;i+=1)if(!filled(beats[i]?.purpose,4)||!filled(beats[i]?.content,6))errors.push(`CONTENT_PLAN: Story-Beat ${i+1} braucht purpose und content.`);
  const retention=contentPlan.retention??{},retentionSignals=[...(retention.openLoops??[]),...(retention.escalationPoints??[]),...(retention.patternInterrupts??[])].filter(meaningful);
  if(retentionSignals.length<Number(contentPolicy.retentionPolicy?.minimumPlannedSignals??2))errors.push('CONTENT_PLAN: mindestens zwei konkrete Retention-Punkte planen.');
  const ending=contentPlan.ending??{};if(!filled(ending.type,3)||!filled(ending.finalLine,8))errors.push('CONTENT_PLAN: Ending-Typ und finale Zeile müssen geplant sein.');

  const tc=contentPlan.titleCoverSystem??{},cover=tc.coverConcept??{},coverText=String(cover.visibleText??'').trim();
  if(!filled(tc.finalTitle,6)||!filled(tc.titlePromise,8))errors.push('CONTENT_PLAN: finaler Titel oder titlePromise fehlt.');
  if(!filled(cover.visualConflict,8))errors.push('CONTENT_PLAN: Cover braucht einen klaren visuellen Konflikt.');
  const subjects=Array.isArray(cover.mainSubjects)?cover.mainSubjects.filter((x)=>filled(x,2)):[];if(subjects.length<1||subjects.length>3)errors.push('CONTENT_PLAN: Cover braucht 1 bis 3 große Hauptmotive.');
  const minHeadline=Number(contentPolicy.titleCoverPolicy?.coverHeadlineMinWords??1),maxHeadline=Number(contentPolicy.titleCoverPolicy?.coverHeadlineMaxWords??4),headlineWords=tokens(coverText).length;
  if(contentPolicy.titleCoverPolicy?.coverHeadlineRequired&&(!coverText||headlineWords<minHeadline||headlineWords>maxHeadline))errors.push(`CONTENT_PLAN: Cover braucht immer eine deutsche Überschrift mit ${minHeadline} bis ${maxHeadline} Wörtern.`);
  if(coverText&&normalizeText(coverText)===normalizeText(tc.finalTitle))errors.push('CONTENT_PLAN: Cover-Überschrift darf den Videotitel nicht einfach vollständig wiederholen.');
  if(!filled(cover.emotion,3)||!filled(cover.whyClickable,8)||!filled(tc.complementarity,12))errors.push('CONTENT_PLAN: Cover-Emotion, Klickgrund oder Titel-Cover-Zusammenspiel fehlt.');

  const rp=contentPolicy.researchPolicy??{},sources=Array.isArray(research.sources)?research.sources:[],claims=Array.isArray(research.claims)?research.claims:[];
  if(research.status!=='READY')errors.push('RESEARCH.status muss READY sein.');
  if(normalizeText(research.topic)!==normalizeText(meta.topic))errors.push('RESEARCH.topic entspricht nicht dem Video-Thema.');
  if(!filled(research.summary,20))errors.push('RESEARCH.summary fehlt oder ist zu knapp.');
  const validSources=sources.filter((s)=>filled(s?.id,2)&&filled(s?.title,4)&&(filled(s?.url,6)||filled(s?.publisher,3)));if(validSources.length<Number(rp.minimumSources??2))errors.push(`RESEARCH: mindestens ${rp.minimumSources??2} belastbare Quellen erforderlich.`);
  const sourceIds=new Set(validSources.map((s)=>s.id));let validClaims=0;for(const claim of claims){const refs=Array.isArray(claim?.sourceIds)?claim.sourceIds:[];if(filled(claim?.statement,12)&&rp.allowedConfidence?.includes(claim?.confidence)&&refs.length&&refs.every((id)=>sourceIds.has(id)))validClaims+=1;else errors.push(`RESEARCH: Claim ${claim?.id??'?'} ist unvollständig oder verweist auf unbekannte Quellen.`);}if(validClaims<Number(rp.minimumClaims??2))errors.push(`RESEARCH: mindestens ${rp.minimumClaims??2} belegte Claims erforderlich.`);

  const cleanScript=script.trim();if(tokens(cleanScript).length<20||/VOICE-OVER-SKRIPT HIER EINFÜGEN/i.test(cleanScript))errors.push('Voice-over-Skript fehlt oder ist zu kurz.');
  if(filled(hook.text)&&!cleanScript.startsWith(hook.text.trim()))errors.push('Der geplante Hook muss der erste gesprochene Inhalt sein.');
  if(/^(hallo( und)? willkommen|willkommen zu einem neuen video|in diesem video schauen wir uns an|heute reden wir über|wusstest du schon)/i.test(cleanScript))errors.push('Skript beginnt mit einer verbotenen generischen Hook-Formel.');
  if(filled(ending.finalLine)&&!cleanScript.slice(-800).includes(ending.finalLine.trim()))errors.push('Die geplante finale Zeile muss am Ende des Skripts vorkommen.');

  if(/\{\{[^}]+\}\}/.test(prompt)||/\[[A-ZÄÖÜ0-9 _,-]{3,}\]/.test(prompt))errors.push('00-bildprompts/99-alle-bildprompts.txt enthält noch Platzhalter.');
  if(!/VERBINDLICHER STYLE-LOCK/i.test(prompt))errors.push('Bildprompt-Datei: verbindlicher Style-Lock fehlt.');
  if(/CONTENT_POLICY_JSON|VISUAL_POLICY_JSON|CONTENT_PLAN_JSON|RESEARCH_JSON|VOICE_SCRIPT|AKTIVE CONTENT-POLICY|AUSGEFÜLLTER CONTENT-PLAN|RECHERCHE-GRUNDLAGE|FINALER VOICE-OVER-TEXT/i.test(prompt))errors.push('Bildprompt-Datei enthält interne Planungsdaten; Google Flow soll nur Style-Lock und finale Einzelprompts erhalten.');
  const blocks=imageBlocks(prompt);if(Number.isInteger(meta.plannedImageCount)&&blocks.length!==meta.plannedImageCount)errors.push(`Bildprompt-Datei enthält ${blocks.length} Bilder, erwartet ${meta.plannedImageCount}.`);
  blocks.forEach((block,i)=>{const n=i+1,head=block.match(/^## Bild (\d{2,3})\b/i),body=block.match(/\nPROMPT:\s*\n([\s\S]+)$/i)?.[1]?.trim()??'';if(Number(head?.[1])!==n)errors.push(`Bildprompt ${n}: Nummerierung ist nicht lückenlos.`);if(body.length<250)errors.push(`Bild ${n}: Einzelprompt ist zu knapp (${body.length} Zeichen).`);if(!/16:9/.test(body))errors.push(`Bild ${n}: 16:9 fehlt im Einzelprompt.`);});
  const first=blocks[0]??'',headlineMatch=first.match(/ÜBERSCHRIFT:\s*"([^"]+)"/i);if(!headlineMatch)errors.push('Bild 01: Pflichtzeile ÜBERSCHRIFT fehlt.');else if(normalizeText(headlineMatch[1])!==normalizeText(coverText))errors.push('Bild 01: Überschrift entspricht nicht CONTENT_PLAN.coverConcept.visibleText.');if(coverText&&!first.includes(coverText))errors.push('Bild 01: Cover-Überschrift muss wortgenau im Coverblock stehen.');

  const images=Array.isArray(mapping.images)?mapping.images:[];if(Number.isInteger(meta.plannedImageCount)&&images.length!==meta.plannedImageCount)errors.push(`Mapping enthält ${images.length} Bilder, erwartet ${meta.plannedImageCount}.`);let last=-1;
  for(let i=0;i<images.length;i+=1){const image=images[i],n=i+1,expected=`Bild ${String(n).padStart(2,'0')}.png`;if(Number(image.imageNumber)!==n||image.imageFile!==expected)errors.push(`Bild ${n}: Nummer/Dateiname nicht lückenlos.`);for(const key of['startAnchor','visualPurpose','topicAnchor','visualForm'])if(!filled(image[key],3))errors.push(`Bild ${n}: ${key} fehlt.`);if(!Number.isFinite(Number(image.plannedHoldSeconds))||Number(image.plannedHoldSeconds)<=0)errors.push(`Bild ${n}: plannedHoldSeconds fehlt.`);if(filled(image.startAnchor)){const at=cleanScript.indexOf(image.startAnchor);if(at<0)errors.push(`Bild ${n}: Startanker kommt nicht exakt im Skript vor.`);else if(at<=last)errors.push(`Bild ${n}: Startanker ist nicht monoton.`);else last=at;}}

  if(!errors.length)await compileFlowPrompt(projectDirectory);
  return{passed:errors.length===0,errors};
}

async function main(){const dir=arg('--dir');if(!dir)throw new Error('Nutzung: npm run validate:phase1 -- --dir "youtube/..."');const r=await validatePhase1(dir);if(!r.passed){r.errors.forEach((e)=>console.error(`- ${e}`));throw new Error(`${r.errors.length} Phase-1-Regel(n) verletzt.`);}console.log('Phase 1: BESTANDEN — Inhalt, Recherche, Cover-Überschrift, Bildprompts und Audio-Mapping sind konsistent.');}
if(isMain(import.meta.url))main().catch((e)=>{console.error(`Phase 1: FEHLER — ${e.message}`);process.exitCode=1;});
