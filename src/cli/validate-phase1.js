#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { arg, exists, isMain, normalizeText, projectPaths, readJson, tokens } from '../lib/pipeline.js';
import { compileFlowPrompt } from './compile-flow-prompt.js';

function filled(value,min=3){return typeof value==='string'&&value.trim().length>=min&&!value.trim().startsWith('[');}
function meaningful(value){if(typeof value==='string')return filled(value,4);if(value&&typeof value==='object')return Object.values(value).some((v)=>filled(v,4));return false;}

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
  if(!filled(hook.text,12))errors.push('CONTENT_PLAN: Hook-Text fehlt oder ist zu knapp.');
  if(!filled(hook.reason,8))errors.push('CONTENT_PLAN: Hook-Begründung fehlt.');
  if(!contentPolicy.storyPolicy?.narrativeModes?.includes(contentPlan.narrativeMode))errors.push('CONTENT_PLAN: Erzählmodus ist nicht gültig.');
  const beats=Array.isArray(contentPlan.beats)?contentPlan.beats:[];
  if(beats.length<3)errors.push('CONTENT_PLAN: mindestens 3 individuelle Story-Beats erforderlich.');
  for(let i=0;i<beats.length;i+=1)if(!filled(beats[i]?.purpose,4)||!filled(beats[i]?.content,6))errors.push(`CONTENT_PLAN: Story-Beat ${i+1} braucht purpose und content.`);
  const retention=contentPlan.retention??{},retentionSignals=[...(retention.openLoops??[]),...(retention.escalationPoints??[]),...(retention.patternInterrupts??[])].filter(meaningful);
  if(retentionSignals.length<Number(contentPolicy.retentionPolicy?.minimumPlannedSignals??2))errors.push('CONTENT_PLAN: Retention-Plan ist zu leer; mindestens zwei konkrete Signale/Punkte planen.');
  const ending=contentPlan.ending??{};if(!filled(ending.type,3)||!filled(ending.finalLine,8))errors.push('CONTENT_PLAN: Ending-Typ und finale Zeile müssen geplant sein.');
  const tc=contentPlan.titleCoverSystem??{},cover=tc.coverConcept??{};
  if(!filled(tc.finalTitle,6))errors.push('CONTENT_PLAN: finaler Titel fehlt.');
  if(!filled(tc.titlePromise,8))errors.push('CONTENT_PLAN: titlePromise fehlt.');
  if(!filled(cover.visualConflict,8))errors.push('CONTENT_PLAN: Cover braucht einen klaren visuellen Konflikt / Kernmoment.');
  const subjects=Array.isArray(cover.mainSubjects)?cover.mainSubjects.filter((x)=>filled(x,2)):[];
  if(subjects.length<1||subjects.length>3)errors.push('CONTENT_PLAN: Cover braucht 1 bis 3 große Hauptmotive.');
  if(cover.visibleText&&tokens(cover.visibleText).length>4)errors.push('CONTENT_PLAN: Cover-Text soll höchstens 4 Wörter haben.');
  if(cover.visibleText&&normalizeText(cover.visibleText)===normalizeText(tc.finalTitle))errors.push('CONTENT_PLAN: Cover-Text darf den Titel nicht einfach wiederholen.');
  if(!filled(cover.emotion,3)||!filled(cover.whyClickable,8))errors.push('CONTENT_PLAN: Cover-Emotion oder Klickgrund fehlt.');
  if(!filled(tc.complementarity,12))errors.push('CONTENT_PLAN: Zusammenspiel von Titel und Cover muss begründet werden.');

  const rp=contentPolicy.researchPolicy??{},sources=Array.isArray(research.sources)?research.sources:[],claims=Array.isArray(research.claims)?research.claims:[];
  if(research.status!=='READY')errors.push('RESEARCH.status muss READY sein.');
  if(normalizeText(research.topic)!==normalizeText(meta.topic))errors.push('RESEARCH.topic entspricht nicht dem Video-Thema.');
  if(!filled(research.summary,20))errors.push('RESEARCH.summary fehlt oder ist zu knapp.');
  const validSources=sources.filter((s)=>filled(s?.id,2)&&filled(s?.title,4)&&(filled(s?.url,6)||filled(s?.publisher,3)));
  if(validSources.length<Number(rp.minimumSources??2))errors.push(`RESEARCH: mindestens ${rp.minimumSources??2} belastbare Quellen erforderlich.`);
  const sourceIds=new Set(validSources.map((s)=>s.id));let validClaims=0;
  for(const claim of claims){const refs=Array.isArray(claim?.sourceIds)?claim.sourceIds:[];if(filled(claim?.statement,12)&&rp.allowedConfidence?.includes(claim?.confidence)&&refs.length&&refs.every((id)=>sourceIds.has(id)))validClaims+=1;else errors.push(`RESEARCH: Claim ${claim?.id??'?'} ist unvollständig oder verweist auf unbekannte Quellen.`);}
  if(validClaims<Number(rp.minimumClaims??2))errors.push(`RESEARCH: mindestens ${rp.minimumClaims??2} belegte Claims erforderlich.`);

  const cleanScript=script.trim();
  if(tokens(cleanScript).length<20||/VOICE-OVER-SKRIPT HIER EINFÜGEN/i.test(cleanScript))errors.push('Voice-over-Skript fehlt oder ist zu kurz.');
  if(filled(hook.text)&&!cleanScript.startsWith(hook.text.trim()))errors.push('Der geplante Hook muss der erste gesprochene Inhalt des Skripts sein.');
  if(/^(hallo( und)? willkommen|willkommen zu einem neuen video|in diesem video schauen wir uns an|heute reden wir über|wusstest du schon)/i.test(cleanScript))errors.push('Skript beginnt mit einer verbotenen generischen Hook-Formel.');
  if(filled(ending.finalLine)&&!cleanScript.slice(-800).includes(ending.finalLine.trim()))errors.push('Die geplante finale Zeile muss am Ende des Skripts vorkommen.');

  if(!prompt.includes(`STIL-ID: ${visual.styleId}`)||!prompt.includes(`"styleId": "${visual.styleId}"`))errors.push('Visual Policy wurde nicht vollständig in den Bildprompt injiziert.');
  if(!prompt.includes(`"contentPolicyVersion": ${contentPolicy.contentPolicyVersion}`))errors.push('Content Policy wurde nicht vollständig in den Bildprompt injiziert.');
  const planPlaceholders=['[PLANZEIT]','[EXAKTER STARTANKER]','[ZWECK]','[KONKRETES ELEMENT]','[DARSTELLUNGSFORM]','[BEWEGUNG]','[SEKUNDEN]','[VOLLSTÄNDIGER DEUTSCHER PROMPT]','[WEITER BIS BILD NN]'];
  for(const marker of planPlaceholders)if(prompt.includes(marker))errors.push(`Bildplan enthält noch Platzhalter: ${marker}`);
  const promptLines=[...prompt.matchAll(/^Bildprompt:\s*(.+)$/gmi)].map((m)=>m[1].trim()).filter(Boolean);
  if(Number.isInteger(meta.plannedImageCount)&&promptLines.length!==meta.plannedImageCount)errors.push(`Bildplan enthält ${promptLines.length} ausgefüllte Bildprompts, erwartet ${meta.plannedImageCount}.`);
  promptLines.forEach((line,i)=>{if(line.length<80)errors.push(`Bild ${i+1}: Bildprompt ist zu knapp.`);});

  const images=Array.isArray(mapping.images)?mapping.images:[];
  if(Number.isInteger(meta.plannedImageCount)&&images.length!==meta.plannedImageCount)errors.push(`Mapping enthält ${images.length} Bilder, erwartet ${meta.plannedImageCount}.`);
  let last=-1;
  for(let i=0;i<images.length;i+=1){const image=images[i],n=i+1,expected=`Bild ${String(n).padStart(2,'0')}.png`;if(Number(image.imageNumber)!==n||image.imageFile!==expected)errors.push(`Bild ${n}: Nummer/Dateiname nicht lückenlos.`);for(const key of['startAnchor','visualPurpose','topicAnchor','visualForm'])if(!filled(image[key],3))errors.push(`Bild ${n}: ${key} fehlt.`);if(!Number.isFinite(Number(image.plannedHoldSeconds))||Number(image.plannedHoldSeconds)<=0)errors.push(`Bild ${n}: plannedHoldSeconds fehlt.`);if(filled(image.startAnchor)){const at=cleanScript.indexOf(image.startAnchor);if(at<0)errors.push(`Bild ${n}: Startanker kommt nicht exakt im Skript vor.`);else if(at<=last)errors.push(`Bild ${n}: Startanker ist nicht monoton.`);else last=at;}if(!prompt.includes(`Bild ${String(n).padStart(2,'0')}`))errors.push(`Bild ${String(n).padStart(2,'0')} fehlt im Bildplan.`);}

  if(!errors.length){await compileFlowPrompt(projectDirectory);const master=await readFile(p.flowMasterPrompt,'utf8');if(/\{\{[A-Z0-9_]+\}\}/.test(master))errors.push('FLOW_MASTER_PROMPT enthält noch Platzhalter.');if(!master.includes(hook.text)||!master.includes(research.summary)||!master.includes(cleanScript.slice(0,Math.min(200,cleanScript.length))))errors.push('FLOW_MASTER_PROMPT enthält Content-Plan, Recherche oder Skript nicht vollständig.');}
  return{passed:errors.length===0,errors};
}

async function main(){const dir=arg('--dir');if(!dir)throw new Error('Nutzung: npm run validate:phase1 -- --dir "youtube/..."');const r=await validatePhase1(dir);if(!r.passed){r.errors.forEach((e)=>console.error(`- ${e}`));throw new Error(`${r.errors.length} Phase-1-Regel(n) verletzt.`);}console.log('Phase 1: BESTANDEN — Kanalfit, Recherche, Hook, Story, Retention, Ending, Titel/Cover und Bildplan sind konsistent.');}
if(isMain(import.meta.url))main().catch((e)=>{console.error(`Phase 1: FEHLER — ${e.message}`);process.exitCode=1;});
