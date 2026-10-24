#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { arg, isMain, normalizeText, projectPaths, readJson } from '../lib/pipeline.js';
import { materializeScenePlan } from '../lib/materialize-scene-plan.js';
import { validateYouTubeDescription } from '../lib/youtube-description.js';
import { CONTENT_POLICY_V10, auditChapters, auditStoryCraft, auditTitle } from '../lib/story-craft.js';
import { validatePhase1 as validateBasePhase1 } from './validate-phase1.js';

function filled(value,min=3){return typeof value==='string'&&value.trim().length>=min&&!value.trim().startsWith('[');}

export async function validatePhase1V9(projectDirectory){
  await materializeScenePlan(projectDirectory);
  const base=await validateBasePhase1(projectDirectory);
  if(!base.passed)return base;

  const p=projectPaths(projectDirectory);
  const [meta,plan,policy,pipeline,mapping,script]=await Promise.all([
    readJson(p.meta),readJson(p.contentPlan),readJson(path.resolve('config/content-policy.json')),readJson(path.resolve('config/pipeline.json')),readJson(p.mapping),readFile(p.script,'utf8')
  ]);
  const errors=[];

  // Erst nach Einführung der Lernpflicht erzeugte Projekte müssen alte Lektionen übernehmen.
  if(Number(meta.learningPolicyVersion)===1){
    const learning=plan.learningFromPreviousVideos??{};
    if(!Array.isArray(learning.plannedImprovements)||!learning.plannedImprovements.some(x=>filled(x?.action,20)))
      errors.push('Lernpflicht: CONTENT_PLAN.learningFromPreviousVideos.plannedImprovements enthält keine konkrete Verbesserung.');
    const brief=await readFile(path.join(p.techDir,'LEARNING_BRIEF.md'),'utf8').catch(()=>null);
    if(!brief||brief.trim().length<60)errors.push('Lernpflicht: 99-tech/LEARNING_BRIEF.md fehlt oder ist zu knapp.');
  }
  const intro=plan.introPlan??{},introPolicy=policy.introPolicy??{};
  for(const [key,label] of [['openingMove','Opening Move'],['formatPromise','Format-Versprechen'],['firstPayoff','erster Payoff'],['clarityLine','Klarheitssatz']])if(!filled(intro[key],8))errors.push(`CONTENT_PLAN.introPlan: ${label} fehlt oder ist zu knapp.`);
  const minVisuals=Number(introPolicy.minimumVisualMoments??4),plannedVisuals=Number(intro.first10SecondsVisualCount);
  if(!Number.isInteger(plannedVisuals)||plannedVisuals<minVisuals)errors.push(`CONTENT_PLAN.introPlan: mindestens ${minVisuals} Bildmomente in den ersten ~10 Sekunden planen.`);

  const upload=plan.youtubeUpload??{},finalTitle=String(plan.titleCoverSystem?.finalTitle??'').trim();
  if(!filled(upload.title,6))errors.push('CONTENT_PLAN.youtubeUpload.title fehlt.');
  if(upload.title&&finalTitle&&normalizeText(upload.title)!==normalizeText(finalTitle))errors.push('CONTENT_PLAN.youtubeUpload.title muss dem finalen YouTube-Titel entsprechen.');
  const descPolicy=policy.youtubeUploadPolicy??{};
  const descCheck=validateYouTubeDescription(upload.description,{minimumBodyCharacters:Number(descPolicy.descriptionMinimumBodyCharacters??450),minimumParagraphs:Number(descPolicy.descriptionMinimumParagraphs??2),requiredHashtags:Number(descPolicy.hashtagCount??5)});
  for(const problem of descCheck.errors)errors.push(`CONTENT_PLAN.youtubeUpload.description: ${problem}`);

  const duration=Number(meta.targetDurationSeconds),imageCount=Number(meta.plannedImageCount),imagePolicy=pipeline.imagePolicy??{};
  const per100=Array.isArray(imagePolicy.targetImagesPer100Seconds)?imagePolicy.targetImagesPer100Seconds:[30,42];
  const minImages=Math.max(1,Math.floor((duration/100)*Number(per100[0]??30)));
  if(Number.isFinite(duration)&&Number.isInteger(imageCount)&&imageCount<minImages)errors.push(`Bilddichte zu niedrig: ${imageCount} Bilder für ${duration}s. Mindestens etwa ${minImages} einplanen.`);

  const images=Array.isArray(mapping.images)?mapping.images:[];
  const coverMax=Number(pipeline.introVisualPolicy?.maximumCoverHoldSeconds??2.2),firstHold=Number(images[0]?.plannedHoldSeconds);
  if(Number.isFinite(firstHold)&&firstHold>coverMax)errors.push(`Bild 01/Cover ist mit ${firstHold}s zu lang geplant; maximal ${coverMax}s.`);

  const scriptWindow=Number(pipeline.introVisualPolicy?.phase1ScriptCharacterWindow??520),introScript=normalizeText(script.slice(0,scriptWindow));
  let earlyAnchors=0;
  for(const image of images){const anchor=normalizeText(image?.startAnchor);if(anchor&&introScript.includes(anchor))earlyAnchors+=1;}
  const requiredEarly=Number(pipeline.introVisualPolicy?.minimumImageStartsInWindow??4);
  if(earlyAnchors<requiredEarly)errors.push(`Intro-Bildplanung zu dünn: nur ${earlyAnchors} frühe Bildanker. Mindestens ${requiredEarly} planen.`);

  const warnings=[];
  if(Number(meta.contentPolicyVersion)>=CONTENT_POLICY_V10){
    const story=auditStoryCraft(script,plan,policy);
    errors.push(...story.errors);warnings.push(...story.warnings);
    for(const problem of auditTitle(upload.title,policy).errors)errors.push(`Titel V10: ${problem}`);
    const cover=String(plan.titleCoverSystem?.coverConcept?.visibleText??'').trim().split(/\s+/).filter(Boolean);
    if(cover.length>3)errors.push('Cover V10: Headline maximal 3 Wörter.');
    const tags=upload.tags,[minTags,maxTags]=policy.youtubeUploadPolicy?.tagsRange??[8,20];
    if(!Array.isArray(tags)||tags.length<minTags||tags.length>maxTags)errors.push(`CONTENT_PLAN.youtubeUpload.tags: ${minTags}–${maxTags} Suchbegriffe planen.`);
    const scenePlan=await readJson(path.join(p.techDir,'SCENE_PLAN.json'),{scenes:[]});
    for(const problem of auditChapters(scenePlan.scenes,{minimum:Number(policy.youtubeUploadPolicy?.minimumChapters??3)}).errors)errors.push(problem);
  }

  return{passed:errors.length===0,errors,warnings};
}

async function main(){const dir=arg('--dir');if(!dir)throw new Error('Nutzung: npm run validate:phase1 -- --dir "youtube/..."');const r=await validatePhase1V9(dir);(r.warnings??[]).forEach((w)=>console.warn(`WARNUNG: ${w}`));if(!r.passed){r.errors.forEach((e)=>console.error(`- ${e}`));throw new Error(`${r.errors.length} Phase-1-V9-Regel(n) verletzt.`);}console.log('Phase 1 V9: BESTANDEN — Formatwahl, Skriptqualität, Intro, Upload-Metadaten und Bilddichte sind produktionsbereit.');}
if(isMain(import.meta.url))main().catch((e)=>{console.error(`Phase 1 V9: FEHLER — ${e.message}`);process.exitCode=1;});
