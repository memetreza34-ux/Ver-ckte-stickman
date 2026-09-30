#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { arg, copyDirectory, ensureInside, exists, isMain, readJson, slugify, writeJson } from '../lib/pipeline.js';
import { evaluateTopic } from './check-topic.js';

async function main(){
  const topic=arg('--topic'),title=arg('--title')??topic,week=arg('--week'),slug=slugify(arg('--slug')??title??topic);
  if(!topic||!title||!week||!slug)throw new Error('Nutzung: npm run create:video -- --topic "THEMA" --title "ARBEITSTITEL" --week "2026-KW40" [--slug "slug"]');
  if(!/^[A-Za-z0-9._-]+$/.test(week))throw new Error('week enthält unerlaubte Zeichen.');
  const topicCheck=await evaluateTopic(topic);
  if(['BLOCKED_DUPLICATE','REVIEW_SIMILAR','BLOCKED_CHANNEL_FIT','REVIEW_TOPIC_QUALITY'].includes(topicCheck.decision)){
    const extra=topicCheck.decision==='REVIEW_TOPIC_QUALITY'?` — Themenqualität ${topicCheck.topicQuality?.score??'?'} / 10. Erst stärker rahmen.`:'';
    throw new Error(`Thema nicht freigegeben: ${topicCheck.decision}${extra}`);
  }
  const [visual,contentPolicy]=await Promise.all([readJson(path.resolve('config/visual-policy.json')),readJson(path.resolve('config/content-policy.json'))]);
  if(visual.status!=='READY'||!visual.styleId)throw new Error('Visual Policy ist nicht produktionsbereit.');
  if(contentPolicy.status!=='READY'||!contentPolicy.contentPolicyVersion)throw new Error('Content Policy ist nicht produktionsbereit.');
  const youtubeRoot=path.resolve('youtube'),destination=ensureInside(youtubeRoot,path.join(youtubeRoot,week,slug));
  if(await exists(destination))throw new Error(`Projekt existiert bereits: ${destination}`);
  await mkdir(path.dirname(destination),{recursive:true});await copyDirectory(path.resolve('youtube/templates/video-template'),destination);
  const now=new Date().toISOString(),techDir=path.join(destination,'99-tech'),metaPath=path.join(techDir,'video.json'),meta=await readJson(metaPath);
  Object.assign(meta,{videoId:`${week}_${slug}`,weekFolder:week,topicSlug:slug,title,topic,visualStyleId:visual.styleId,contentPolicyVersion:contentPolicy.contentPolicyVersion,createdAt:now,updatedAt:now});await writeJson(metaPath,meta);
  const contentPlanPath=path.join(techDir,'CONTENT_PLAN.json'),contentPlan=await readJson(contentPlanPath),defaultMode=contentPolicy.contentModePolicy?.preferredDefault??'frei-surreal';
  Object.assign(contentPlan,{contentPolicyVersion:contentPolicy.contentPolicyVersion,language:'de',topic,workingTitle:title,contentMode:defaultMode});await writeJson(contentPlanPath,contentPlan);
  const researchPath=path.join(techDir,'RESEARCH.json'),research=await readJson(researchPath);Object.assign(research,{topic});await writeJson(researchPath,research);
  const promptPath=path.join(destination,'00-bildprompts','99-alle-bildprompts.txt');const prompt=(await readFile(promptPath,'utf8')).replaceAll('{{VIDEO_TITLE}}',title).replaceAll('{{STYLE_ID}}',visual.styleId);await writeFile(promptPath,prompt,'utf8');
  const registryPath=path.resolve('config/topic-registry.json'),registry=await readJson(registryPath,{version:2,entries:[]});registry.entries.push({id:meta.videoId,title,aliases:[topic],status:'reserved',channelFitAtCreation:topicCheck.channelFit,topicQualityAtCreation:topicCheck.topicQuality,createdAt:now});await writeJson(registryPath,registry);
  console.log(`Projekt erstellt: ${path.relative(process.cwd(),destination)}`);
  console.log(`Themenqualität: ${topicCheck.topicQuality.score}/10`);
  console.log(`Content-Modus: ${defaultMode}`);
  console.log('Nächster Schritt: zuerst scriptFormat wählen und begründen: mini-stories, progression oder story. Erst danach Hook, Intro, Format-Plan und Voice-over schreiben. Recherche nur bei realen Tatsachenbehauptungen.');
}
if(isMain(import.meta.url))main().catch((e)=>{console.error(`Projekt-Erstellung: FEHLER — ${e.message}`);process.exitCode=1;});
