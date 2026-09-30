#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { arg, isMain, normalizeText, projectPaths, readJson } from '../lib/pipeline.js';
import { validatePhase1 as validateBasePhase1 } from './validate-phase1.js';

function filled(value,min=3){
  return typeof value==='string'&&value.trim().length>=min&&!value.trim().startsWith('[');
}

export async function validatePhase1V8(projectDirectory){
  const base=await validateBasePhase1(projectDirectory);
  if(!base.passed)return base;

  const p=projectPaths(projectDirectory);
  const [meta,plan,policy,pipeline,mapping,script]=await Promise.all([
    readJson(p.meta),
    readJson(p.contentPlan),
    readJson(path.resolve('config/content-policy.json')),
    readJson(path.resolve('config/pipeline.json')),
    readJson(p.mapping),
    readFile(p.script,'utf8')
  ]);

  const errors=[];
  const introPolicy=policy.introPolicy??{};
  const intro=plan.introPlan??{};

  for(const [key,label] of [['situation','Situation'],['ruleOrAnomaly','Regel/Anomalie'],['stakesOrGoal','Gefahr/Ziel']]){
    if(!filled(intro[key],8))errors.push(`CONTENT_PLAN.introPlan: ${label} fehlt oder ist zu knapp.`);
  }
  if(!filled(intro.clarityLine,8))errors.push('CONTENT_PLAN.introPlan.clarityLine fehlt.');
  const plannedIntroVisuals=Number(intro.first10SecondsVisualCount);
  const minimumIntroVisuals=Number(introPolicy.minimumVisualMoments??4);
  if(!Number.isInteger(plannedIntroVisuals)||plannedIntroVisuals<minimumIntroVisuals){
    errors.push(`CONTENT_PLAN.introPlan: mindestens ${minimumIntroVisuals} Bildmomente in den ersten ~10 Sekunden planen.`);
  }

  const upload=plan.youtubeUpload??{};
  const finalTitle=String(plan.titleCoverSystem?.finalTitle??'').trim();
  if(!filled(upload.title,6))errors.push('CONTENT_PLAN.youtubeUpload.title fehlt.');
  if(upload.title&&finalTitle&&normalizeText(upload.title)!==normalizeText(finalTitle))errors.push('CONTENT_PLAN.youtubeUpload.title muss dem finalen YouTube-Titel entsprechen.');
  const minDescription=Number(policy.youtubeUploadPolicy?.descriptionMinimumCharacters??80);
  if(!filled(upload.description,minDescription))errors.push(`CONTENT_PLAN.youtubeUpload.description braucht mindestens ${minDescription} Zeichen.`);

  const imagePolicy=pipeline.imagePolicy??{};
  const duration=Number(meta.targetDurationSeconds);
  const imageCount=Number(meta.plannedImageCount);
  const per100=Array.isArray(imagePolicy.targetImagesPer100Seconds)?imagePolicy.targetImagesPer100Seconds:[30,42];
  const minImages=Math.max(1,Math.floor((duration/100)*Number(per100[0]??30)));
  if(Number.isFinite(duration)&&Number.isInteger(imageCount)&&imageCount<minImages)errors.push(`Bilddichte zu niedrig: ${imageCount} Bilder für ${duration}s. Mindestens etwa ${minImages} einplanen.`);

  const mappingImages=Array.isArray(mapping.images)?mapping.images:[];
  const coverMax=Number(pipeline.introVisualPolicy?.maximumCoverHoldSeconds??2.2);
  const firstPlanned=Number(mappingImages[0]?.plannedHoldSeconds);
  if(Number.isFinite(firstPlanned)&&firstPlanned>coverMax)errors.push(`Bild 01/Cover ist mit ${firstPlanned}s zu lang geplant; maximal ${coverMax}s.`);

  const scriptWindow=Number(pipeline.introVisualPolicy?.phase1ScriptCharacterWindow??520);
  const introScript=normalizeText(script.slice(0,scriptWindow));
  let earlyAnchors=0;
  for(const image of mappingImages){
    const anchor=normalizeText(image?.startAnchor);
    if(anchor&&introScript.includes(anchor))earlyAnchors+=1;
  }
  const requiredEarlyAnchors=Number(pipeline.introVisualPolicy?.minimumImageStartsInWindow??4);
  if(earlyAnchors<requiredEarlyAnchors)errors.push(`Intro-Bildplanung zu dünn: nur ${earlyAnchors} Anker liegen im frühen Skript. Mindestens ${requiredEarlyAnchors} frühe visuelle Anker planen.`);

  return {passed:errors.length===0,errors};
}

async function main(){
  const dir=arg('--dir');
  if(!dir)throw new Error('Nutzung: npm run validate:phase1 -- --dir "youtube/..."');
  const result=await validatePhase1V8(dir);
  if(!result.passed){
    result.errors.forEach((error)=>console.error(`- ${error}`));
    throw new Error(`${result.errors.length} Phase-1-V8-Regel(n) verletzt.`);
  }
  console.log('Phase 1 V8: BESTANDEN — Story, Intro-Klarheit, Upload-Metadaten und Bilddichte sind produktionsbereit.');
}

if(isMain(import.meta.url)){
  main().catch((error)=>{
    console.error(`Phase 1 V8: FEHLER — ${error.message}`);
    process.exitCode=1;
  });
}
