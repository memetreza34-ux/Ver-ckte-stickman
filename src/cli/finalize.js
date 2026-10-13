#!/usr/bin/env node
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { arg, exists, fileSize, isMain, parseFps, probeMedia, projectPaths, readJson, sha256, writeJson } from '../lib/pipeline.js';
import { validateYouTubeDescription } from '../lib/youtube-description.js';
import { runPostVideoReview } from './review-video.js';

function flattenTranscriptWords(json){
  const out=[];
  for(const segment of json.segments??[]){
    if(Array.isArray(segment.words)&&segment.words.length){
      for(const word of segment.words){
        const text=String(word.word??'').trim();
        const start=Number(word.start),end=Number(word.end??word.start);
        if(text&&Number.isFinite(start))out.push({text,start,end:Number.isFinite(end)?end:start});
      }
      continue;
    }
    const parts=String(segment.text??'').trim().split(/\s+/).filter(Boolean);
    const start=Number(segment.start??0),end=Number(segment.end??start),step=parts.length?(end-start)/parts.length:0;
    parts.forEach((text,index)=>out.push({text,start:start+step*index,end:start+step*(index+1)}));
  }
  return out.sort((a,b)=>a.start-b.start);
}

function joinWords(words){
  return words.map((x)=>x.text).join(' ')
    .replace(/\s+([,.;!?…:])/g,'$1')
    .replace(/([„“"'])\s+/g,'$1')
    .replace(/\s+/g,' ')
    .trim();
}

function formatTime(seconds){
  const total=Math.max(0,Math.floor(Number(seconds)||0));
  const hours=Math.floor(total/3600),minutes=Math.floor((total%3600)/60),secs=total%60;
  const mm=String(minutes).padStart(2,'0'),ss=String(secs).padStart(2,'0');
  return hours>0?`${String(hours).padStart(2,'0')}:${mm}:${ss}`:`${mm}:${ss}`;
}

function buildTimedTranscript(words,audioDuration,blockSeconds=10){
  if(!words.length)throw new Error('Whisper-Transkript enthält keine Wörter.');
  const blocks=[];
  const count=Math.max(1,Math.ceil(audioDuration/blockSeconds));
  for(let index=0;index<count;index+=1){
    const start=index*blockSeconds,end=Math.min(audioDuration,(index+1)*blockSeconds);
    const text=joinWords(words.filter((word)=>word.start>=start&&word.start<end));
    blocks.push(`[${formatTime(start)} - ${formatTime(end)}]\n${text||'(Pause)'}`);
  }
  return `GESAMTES VIDEO-SKRIPT MIT ZEITDATEN\nQuelle: finales Voice-over / Whisper-Wortzeiten\n\n${blocks.join('\n\n')}\n`;
}


function formatSrtTime(seconds){
  const millis=Math.max(0,Math.round(Number(seconds)*1000));
  const hh=String(Math.floor(millis/3600000)).padStart(2,'0');
  const mm=String(Math.floor(millis%3600000/60000)).padStart(2,'0');
  const ss=String(Math.floor(millis%60000/1000)).padStart(2,'0');
  const ms=String(millis%1000).padStart(3,'0');
  return hh+':'+mm+':'+ss+','+ms;
}

// SRT can be uploaded directly to YouTube. Cues use actual Whisper word times;
// no timestamps are estimated from the expected script length.
export function buildSrtTranscript(words,audioDuration){
  const duration=Number(audioDuration);
  if(!Number.isFinite(duration)||duration<=0)throw new Error('Ungültige Audiodauer für SRT.');
  const sorted=(words??[]).filter(w=>String(w.text??'').trim()
    &&Number.isFinite(w.start)&&Number.isFinite(w.end)
    &&w.start>=0&&w.start<duration&&w.end>=w.start).sort((a,b)=>a.start-b.start);
  if(!sorted.length)throw new Error('Whisper hat keine nutzbaren Wortzeiten für SRT geliefert.');
  const groups=[];
  let current=[];
  for(const word of sorted){
    const last=current.at(-1);
    if(current.length&&(current.length>=10
      ||word.start-current[0].start>=4.2
      ||(current.length>=4&&/[.!?…]$/.test(String(last.text).trim())))){
      groups.push(current);current=[];
    }
    current.push(word);
  }
  if(current.length)groups.push(current);
  const cues=groups.map((group,index)=>{
    const start=group[0].start;
    const next=groups[index+1]?.[0].start??duration;
    const end=Math.min(duration,next,Math.max(group.at(-1).end,start+0.1));
    if(end<=start)throw new Error('Ungültige oder überlappende Wortzeiten in SRT.');
    return (index+1)+'\n'+formatSrtTime(start)+' --> '+formatSrtTime(end)+'\n'+joinWords(group);
  });
  return cues.join('\n\n')+'\n';
}

export async function finalize(projectDirectory){
  const p=projectPaths(projectDirectory);
  const [meta,timeline,pipeline,contentPlan,contentPolicy]=await Promise.all([
    readJson(p.meta),
    readJson(p.timeline),
    readJson(path.resolve('config/pipeline.json')),
    readJson(p.contentPlan),
    readJson(path.resolve('config/content-policy.json'))
  ]);

  const video=path.join(p.exportDir,'FINAL_VIDEO.mp4');
  const cover=path.join(p.imagesDir,'Bild 01.png');
  const thumb=path.join(p.exportDir,'THUMBNAIL.png');
  const captionFile=path.join(p.exportDir,'YOUTUBE_CAPTION.txt');
  const transcriptFile=path.join(p.exportDir,'UNTERTITEL_SCRIPT.txt');
  const srtFile=path.join(p.exportDir,'UNTERTITEL.srt');
  const legacyUploadFile=path.join(p.exportDir,'YOUTUBE_UPLOAD.txt');
  const whisperFile=path.join(p.techDir,'whisper','YOUTUBE_AUDIO_OPTIMIZED.json');

  if(!(await exists(video)))throw new Error('FINAL_VIDEO.mp4 fehlt.');
  if(!(await exists(cover)))throw new Error('Bild 01.png fehlt.');
  if(!(await exists(whisperFile)))throw new Error('Whisper-Zeitdaten fehlen. Erst Audio-Alignment ausführen; keine Untertitelzeiten schätzen.');

  await mkdir(p.exportDir,{recursive:true});
  await copyFile(cover,thumb);

  const upload=contentPlan.youtubeUpload??{};
  const finalTitle=String(upload.title||contentPlan.titleCoverSystem?.finalTitle||meta.title||'').trim();
  const description=String(upload.description??'').trim();
  if(finalTitle.length<6)throw new Error('YouTube-Titel fehlt in CONTENT_PLAN.youtubeUpload.title.');
  const descPolicy=contentPolicy.youtubeUploadPolicy??{};
  const descCheck=validateYouTubeDescription(description,{minimumBodyCharacters:Number(descPolicy.descriptionMinimumBodyCharacters??450),minimumParagraphs:Number(descPolicy.descriptionMinimumParagraphs??2),requiredHashtags:Number(descPolicy.hashtagCount??5)});
  if(!descCheck.passed)throw new Error(descCheck.errors.join(' | '));
  await writeFile(captionFile,`YOUTUBE-TITEL:\n${finalTitle}\n\nYOUTUBE-BESCHREIBUNG:\n${description}\n`,'utf8');
  await rm(legacyUploadFile,{force:true});

  const whisper=await readJson(whisperFile);
  const transcriptWords=flattenTranscriptWords(whisper);
  const audioDuration=Number(timeline.audioDurationSeconds??timeline.durationSeconds);
  if(!Number.isFinite(audioDuration)||audioDuration<=0)throw new Error('Audio-Dauer für Untertitel ist ungültig.');
  await writeFile(transcriptFile,buildTimedTranscript(transcriptWords,audioDuration,10),'utf8');
  await writeFile(srtFile,buildSrtTranscript(transcriptWords,audioDuration),'utf8');

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

  const coverHash=await sha256(cover),thumbHash=await sha256(thumb);
  if(coverHash!==thumbHash)errors.push('Thumbnail ist nicht identisch zu Bild 01.');
  if(errors.length)throw new Error(errors.join(' | '));

  const registryPath=path.resolve('config/topic-registry.json');
  const registry=await readJson(registryPath,{version:2,entries:[]});
  const entry=registry.entries.find((x)=>x.id===meta.videoId);
  if(entry){entry.status='completed';entry.completedAt=new Date().toISOString();await writeJson(registryPath,registry);}

  const report={
    schemaVersion:4,
    createdAt:new Date().toISOString(),
    videoFile:'04-export/FINAL_VIDEO.mp4',
    thumbnailFile:'04-export/THUMBNAIL.png',
    youtubeCaptionFile:'04-export/YOUTUBE_CAPTION.txt',
    timedTranscriptFile:'04-export/UNTERTITEL_SCRIPT.txt',
    srtSubtitleFile:'04-export/UNTERTITEL.srt',
    transcriptBlockSeconds:10,
    transcriptSource:'Whisper word timestamps from final optimized voice-over',
    youtubeTitle:finalTitle,
    durationSeconds:duration,
    width:v.width,height:v.height,fps,codec:v.codec_name,audioCodec:a.codec_name,
    thumbnailIdenticalToCover:true,
    passed:true
  };
  await writeJson(path.join(p.techDir,'EXPORT_REPORT.json'),report);
  await runPostVideoReview(projectDirectory);
  console.log('Post-Render-QC: BESTANDEN — Video, Thumbnail, YouTube-Caption, Zeittranskript und SRT-Untertitel sind bereit.');
  return report;
}

async function main(){const dir=arg('--dir');if(!dir)throw new Error('Nutzung: npm run finalize:video -- --dir "youtube/..."');await finalize(dir);}
if(isMain(import.meta.url))main().catch((e)=>{console.error(`Finalize: FEHLER — ${e.message}`);process.exitCode=1;});
