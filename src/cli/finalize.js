#!/usr/bin/env node
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { arg, exists, fileSize, isMain, parseFps, probeMedia, projectPaths, readJson, sha256, writeJson } from '../lib/pipeline.js';

export async function finalize(projectDirectory){
  const p=projectPaths(projectDirectory);
  const [meta,timeline,pipeline,contentPlan]=await Promise.all([
    readJson(p.meta),
    readJson(p.timeline),
    readJson(path.resolve('config/pipeline.json')),
    readJson(p.contentPlan)
  ]);

  const video=path.join(p.exportDir,'FINAL_VIDEO.mp4');
  const cover=path.join(p.imagesDir,'Bild 01.png');
  const thumb=path.join(p.exportDir,'THUMBNAIL.png');
  const uploadFile=path.join(p.exportDir,'YOUTUBE_UPLOAD.txt');

  if(!(await exists(video)))throw new Error('FINAL_VIDEO.mp4 fehlt.');
  if(!(await exists(cover)))throw new Error('Bild 01.png fehlt.');

  await mkdir(p.exportDir,{recursive:true});
  await copyFile(cover,thumb);

  const upload=contentPlan.youtubeUpload??{};
  const finalTitle=String(upload.title||contentPlan.titleCoverSystem?.finalTitle||meta.title||'').trim();
  const description=String(upload.description||contentPlan.viewerPromise||'').trim();
  if(finalTitle.length<6)throw new Error('YouTube-Titel fehlt in CONTENT_PLAN.youtubeUpload.title.');
  if(description.length<40)throw new Error('YouTube-Beschreibung fehlt oder ist zu kurz in CONTENT_PLAN.youtubeUpload.description.');
  await writeFile(uploadFile,`TITEL:\n${finalTitle}\n\nBESCHREIBUNG:\n${description}\n`,'utf8');

  const info=await probeMedia(video);
  const streams=info.streams??[];
  const v=streams.find((x)=>x.codec_type==='video');
  const a=streams.find((x)=>x.codec_type==='audio');
  const duration=Number(info.format?.duration);
  const fps=parseFps(v?.r_frame_rate);
  const errors=[];

  if((await fileSize(video))<pipeline.renderPolicy.minimumVideoBytes)errors.push('FINAL_VIDEO.mp4 ist verdächtig klein.');
  if(v?.codec_name!=='h264')errors.push(`Video-Codec ist ${v?.codec_name??'unbekannt'} statt h264.`);
  if(Number(v?.width)!==pipeline.resolution.width||Number(v?.height)!==pipeline.resolution.height)errors.push(`Auflösung ist ${v?.width}x${v?.height} statt ${pipeline.resolution.width}x${pipeline.resolution.height}.`);
  if(Math.abs(fps-pipeline.fps)>0.05)errors.push(`FPS ist ${fps} statt ${pipeline.fps}.`);
  if(!a)errors.push('Audio-Stream fehlt im finalen Video.');
  if(!Number.isFinite(duration)||Math.abs(duration-timeline.durationSeconds)>pipeline.renderPolicy.durationToleranceSeconds)errors.push(`Renderdauer ${duration}s passt nicht zur Timeline ${timeline.durationSeconds}s.`);

  const coverHash=await sha256(cover);
  const thumbHash=await sha256(thumb);
  if(coverHash!==thumbHash)errors.push('Thumbnail ist nicht identisch zu Bild 01.');
  if(errors.length)throw new Error(errors.join(' | '));

  const registryPath=path.resolve('config/topic-registry.json');
  const registry=await readJson(registryPath,{version:2,entries:[]});
  const entry=registry.entries.find((x)=>x.id===meta.videoId);
  if(entry){
    entry.status='completed';
    entry.completedAt=new Date().toISOString();
    await writeJson(registryPath,registry);
  }

  const report={
    schemaVersion:3,
    createdAt:new Date().toISOString(),
    videoFile:'04-export/FINAL_VIDEO.mp4',
    thumbnailFile:'04-export/THUMBNAIL.png',
    youtubeUploadFile:'04-export/YOUTUBE_UPLOAD.txt',
    youtubeTitle:finalTitle,
    durationSeconds:duration,
    width:v.width,
    height:v.height,
    fps,
    codec:v.codec_name,
    audioCodec:a.codec_name,
    thumbnailIdenticalToCover:true,
    passed:true
  };
  await writeJson(path.join(p.techDir,'EXPORT_REPORT.json'),report);
  console.log('Post-Render-QC: BESTANDEN — Video, Thumbnail und YOUTUBE_UPLOAD.txt sind bereit.');
  return report;
}

async function main(){
  const dir=arg('--dir');
  if(!dir)throw new Error('Nutzung: npm run finalize:video -- --dir "youtube/..."');
  await finalize(dir);
}

if(isMain(import.meta.url))main().catch((e)=>{
  console.error(`Finalize: FEHLER — ${e.message}`);
  process.exitCode=1;
});
