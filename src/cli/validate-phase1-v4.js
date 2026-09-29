#!/usr/bin/env node
import path from 'node:path';
import { arg, isMain, projectPaths, readJson } from '../lib/pipeline.js';
import { validatePhase1 as validateBasePhase1 } from './validate-phase1.js';

function filled(value,min=3){
  return typeof value==='string'&&value.trim().length>=min&&!value.trim().startsWith('[');
}

export async function validatePhase1V4(projectDirectory){
  const base=await validateBasePhase1(projectDirectory);
  if(!base.passed)return base;

  const p=projectPaths(projectDirectory);
  const [meta,contentPlan,research,contentPolicy,pipeline,mapping]=await Promise.all([
    readJson(p.meta),
    readJson(p.contentPlan),
    readJson(p.research),
    readJson(path.resolve('config/content-policy.json')),
    readJson(path.resolve('config/pipeline.json')),
    readJson(p.mapping)
  ]);

  const errors=[];
  const experience=contentPolicy.experiencePolicy??{};
  if(experience.required&&!experience.allowedFormats?.includes(contentPlan.formatMode)){
    errors.push('CONTENT_PLAN: formatMode muss eine gültige immersive Erzählform sein.');
  }
  if(!filled(contentPlan.viewerRole,3)){
    errors.push('CONTENT_PLAN: viewerRole fehlt. Definiere, welche Rolle/Perspektive der Zuschauer erlebt.');
  }
  if(!filled(contentPlan.experiencePremise,12)){
    errors.push('CONTENT_PLAN: experiencePremise fehlt oder ist zu knapp.');
  }

  const claims=new Set((research.claims??[]).map((x)=>x?.id).filter(Boolean));
  const infoPolicy=contentPolicy.informationDensityPolicy??{};
  const targetSeconds=Number(infoPolicy.targetSecondsPerInformationBeat??20);
  const duration=Number(meta.targetDurationSeconds);
  const minimumInfo=Math.max(Number(infoPolicy.minimumInformationBeats??3),Math.ceil(duration/Math.max(25,targetSeconds)));
  const informationBeats=Array.isArray(contentPlan.informationBeats)?contentPlan.informationBeats:[];
  if(informationBeats.length<minimumInfo){
    errors.push(`CONTENT_PLAN: mindestens ${minimumInfo} konkrete informationBeats für ${duration}s planen.`);
  }
  informationBeats.forEach((beat,index)=>{
    if(!filled(beat?.claimId,2)||!claims.has(beat.claimId)){
      errors.push(`CONTENT_PLAN: informationBeat ${index+1} braucht eine gültige claimId aus RESEARCH.json.`);
    }
    if(!filled(beat?.placement,4)||!filled(beat?.use,8)){
      errors.push(`CONTENT_PLAN: informationBeat ${index+1} braucht placement und use.`);
    }
  });

  const imagePolicy=pipeline.imagePolicy??{};
  const imageCount=Number(meta.plannedImageCount);
  const per100=Array.isArray(imagePolicy.targetImagesPer100Seconds)?imagePolicy.targetImagesPer100Seconds:[26,34];
  const minImages=Math.max(1,Math.floor((duration/100)*Number(per100[0]??26)));
  if(imageCount<minImages){
    errors.push(`Bilddichte zu niedrig: ${imageCount} Bilder für ${duration}s. Für dieses Format mindestens ca. ${minImages} planen.`);
  }
  const averagePlanned=imageCount>0?duration/imageCount:Infinity;
  const maxAverage=Number(imagePolicy.targetAverageHoldSeconds?.[1]??4.2);
  if(averagePlanned>maxAverage){
    errors.push(`Geplante Ø-Bilddauer ${averagePlanned.toFixed(2)}s ist zu lang; Ziel höchstens etwa ${maxAverage}s.`);
  }

  const hardMax=Number(imagePolicy.hardMaximumSeconds??8);
  for(const image of mapping.images??[]){
    const planned=Number(image.plannedHoldSeconds);
    if(Number.isFinite(planned)&&planned>hardMax){
      errors.push(`Bild ${image.imageNumber}: geplante Dauer ${planned}s überschreitet Hard-Max ${hardMax}s.`);
    }
  }

  return {passed:errors.length===0,errors};
}

async function main(){
  const dir=arg('--dir');
  if(!dir)throw new Error('Nutzung: npm run validate:phase1 -- --dir "youtube/..."');
  const result=await validatePhase1V4(dir);
  if(!result.passed){
    result.errors.forEach((error)=>console.error(`- ${error}`));
    throw new Error(`${result.errors.length} Phase-1-V4-Regel(n) verletzt.`);
  }
  console.log('Phase 1 V4: BESTANDEN — immersive Perspektive, Faktenbeats und Bilddichte sind produktionsbereit.');
}

if(isMain(import.meta.url)){
  main().catch((error)=>{
    console.error(`Phase 1 V4: FEHLER — ${error.message}`);
    process.exitCode=1;
  });
}
