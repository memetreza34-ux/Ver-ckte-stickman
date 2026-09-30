#!/usr/bin/env node
import path from 'node:path';
import { arg, isMain, projectPaths, readJson } from '../lib/pipeline.js';

export async function validateTimeline(projectDirectory){
  const p=projectPaths(projectDirectory);
  const [timeline,pipeline]=await Promise.all([
    readJson(p.timeline),
    readJson(path.resolve('config/pipeline.json'))
  ]);

  const errors=[];
  const warnings=[];
  const images=timeline.images??[];
  if(!images.length)errors.push('Timeline enthält keine Bilder.');

  for(let i=0;i<images.length;i+=1){
    const x=images[i];
    const duration=Number(x.durationSeconds);
    if(!(x.endFrame>x.startFrame))errors.push(`Bild ${x.imageNumber}: ungültige Frames.`);
    if(duration>pipeline.imagePolicy.hardMaximumSeconds)errors.push(`Bild ${x.imageNumber}: ${duration}s überschreitet Hard-Max ${pipeline.imagePolicy.hardMaximumSeconds}s.`);
    else if(duration>pipeline.imagePolicy.preferSplitAboveSeconds)warnings.push(`Bild ${x.imageNumber}: ${duration}s — Split stark empfohlen.`);
    else if(duration>pipeline.imagePolicy.reviewAboveSeconds)warnings.push(`Bild ${x.imageNumber}: ${duration}s — Split prüfen.`);
    if(duration<pipeline.imagePolicy.minimumUsefulHoldSeconds)warnings.push(`Bild ${x.imageNumber}: sehr kurzer Hold ${duration}s.`);
    const planned=Number(x.plannedHoldSeconds);
    if(Number.isFinite(planned)&&Math.abs(duration-planned)>Math.max(4,planned*0.8))warnings.push(`Bild ${x.imageNumber}: Planung ${planned}s vs. tatsächlich ${duration}s.`);
    if(i>0&&images[i-1].endFrame!==x.startFrame)errors.push(`Frame-Lücke/Überlappung vor Bild ${x.imageNumber}.`);
  }

  if(images.at(-1)?.endFrame!==timeline.durationInFrames)errors.push('Letztes Bild endet nicht mit der Komposition.');

  const avg=images.length?images.reduce((s,x)=>s+Number(x.durationSeconds),0)/images.length:0;
  const [min,max]=pipeline.imagePolicy.targetAverageHoldSeconds;
  if(avg<min-1||avg>max+1)warnings.push(`Ø Hold ${avg.toFixed(2)}s außerhalb bevorzugt ${min}–${max}s.`);

  const intro=pipeline.introVisualPolicy??{};
  const windowSeconds=Number(intro.windowSeconds??10);
  const fps=Number(pipeline.fps??30);
  const introImages=images.filter((x)=>(Number(x.startFrame)/fps)<windowSeconds);
  const requiredStarts=Number(intro.minimumImageStartsInWindow??4);
  if(introImages.length<requiredStarts)errors.push(`Intro zu statisch: In den ersten ${windowSeconds}s starten nur ${introImages.length} Bilder; mindestens ${requiredStarts} erforderlich.`);

  const coverDuration=Number(images[0]?.durationSeconds);
  const maxCover=Number(intro.maximumCoverHoldSeconds??2.2);
  if(Number.isFinite(coverDuration)&&coverDuration>maxCover)errors.push(`Cover/Bild 01 steht ${coverDuration}s; maximal ${maxCover}s im Einstieg.`);

  const maxIntroHold=Number(intro.maximumAnyHoldSecondsInWindow??3.2);
  for(const image of introImages){
    const duration=Number(image.durationSeconds);
    if(Number.isFinite(duration)&&duration>maxIntroHold)errors.push(`Bild ${image.imageNumber} steht im Intro ${duration}s; maximal ${maxIntroHold}s in den ersten ${windowSeconds}s.`);
  }

  return {passed:errors.length===0,errors,warnings,averageHoldSeconds:Number(avg.toFixed(3)),introImageStarts:introImages.length};
}

async function main(){
  const dir=arg('--dir');
  if(!dir)throw new Error('Nutzung: npm run validate:timeline -- --dir "youtube/..."');
  const r=await validateTimeline(dir);
  r.warnings.forEach((w)=>console.warn(`WARNUNG: ${w}`));
  if(!r.passed){
    r.errors.forEach((e)=>console.error(`- ${e}`));
    throw new Error(`${r.errors.length} Timeline-Regel(n) verletzt.`);
  }
  console.log(`Timeline-QC: BESTANDEN — Ø ${r.averageHoldSeconds}s/Bild, ${r.introImageStarts} Bildstarts in den ersten 10s.`);
}

if(isMain(import.meta.url))main().catch((e)=>{
  console.error(`Timeline-QC: FEHLER — ${e.message}`);
  process.exitCode=1;
});
