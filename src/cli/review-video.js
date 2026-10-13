#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { arg, isMain, projectPaths, readJson, writeJson } from '../lib/pipeline.js';

function round(n){return Number(Number(n).toFixed(2));}
export function assessVideo({meta,timeline,report,script,pipeline,feedback}){
  if(report?.passed!==true)throw new Error('Review nur nach einem bestandenen FINAL_VIDEO-Export.');
  const images=timeline?.images??[];
  if(!images.length)throw new Error('Für die Verbesserung fehlen Bildzeitdaten.');
  const duration=Number(report.durationSeconds),audio=Number(timeline.audioDurationSeconds);
  if(!Number.isFinite(duration)||duration<=0||!Number.isFinite(audio)||audio<=0)throw new Error('Echte Audio-/Videodauer fehlt.');
  const fps=Number(timeline.fps||pipeline.fps||30);
  const wordCount=String(script||'').trim().split(/\s+/).filter(Boolean).length;
  const target=Number(meta.targetDurationSeconds);
  const delta=Number.isFinite(target)&&target>0?round(duration-target):null;
  const intro=images.filter(x=>Number(x.startFrame)/fps<10).length;
  const density=round(images.length*100/duration);
  const coverHold=Number(images[0].durationSeconds);
  const maxCover=Number(pipeline.introVisualPolicy?.maximumCoverHoldSeconds??2.2);
  const slowLimit=Number(pipeline.imagePolicy?.preferSplitAboveSeconds??5.8);
  const slow=images.filter(x=>Number(x.durationSeconds)>slowLimit);
  const range=pipeline.imagePolicy?.targetImagesPer100Seconds??[30,42];
  const metrics={
    durationSeconds:round(duration),targetDurationSeconds:target,deltaSeconds:delta,
    audioDurationSeconds:round(audio),scriptWords:wordCount,wordsPerMinute:round(wordCount*60/audio),
    imageCount:images.length,imagesPer100Seconds:density,averageImageSeconds:round(duration/images.length),
    introImageStarts:intro,coverSeconds:round(coverHold),longHoldImageNumbers:slow.map(x=>x.imageNumber)
  };
  const improvements=[];
  function add(id,area,evidence,action,priority){
    improvements.push({id,area,evidence,action,priority:priority||'high',status:'evidence-based'});
  }
  if(delta!==null&&Math.abs(delta)>Math.max(10,target*.06))
    add('duration-calibration','Sprechdauer','Plan '+target+'s; tatsächlich '+round(duration)+'s; '+metrics.wordsPerMinute+' Wörter/Minute.','Wortzahl des nächsten Skripts anhand des realen Voice-over-Tempos kalibrieren.');
  if(density<range[0])
    add('visual-density-low','Bildplanung',density+' Bilder pro 100s, Ziel mindestens '+range[0]+'.','Mehr eigenständige, sinnvolle Bildmomente bei Szenen- und Informationswechseln planen.');
  if(density>range[1])
    add('visual-density-high','Bildplanung',density+' Bilder pro 100s, Ziel maximal '+range[1]+'.','Zu schnelle unnötige Bildwechsel reduzieren, wichtige Bilder lesbar halten.');
  if(intro<Number(pipeline.introVisualPolicy?.minimumImageStartsInWindow??4))
    add('intro-visuals','Einleitung',intro+' Bildstarts in ersten 10s.','Intro früher mit neuen, verständlichen Bildmomenten gestalten.');
  if(coverHold>maxCover)
    add('cover-duration','Einleitung','Cover '+round(coverHold)+'s statt maximal '+maxCover+'s.','Cover im nächsten Video kürzer zeigen.');
  if(slow.length)
    add('long-image-holds','Schnitt',slow.length+' Bildpassagen länger als '+slowLimit+'s.','Lange Einstellungen gezielt durch bessere Szenenbilder ersetzen statt den Zoom zu strecken.');
  const feedbackItems=Array.isArray(feedback?.observations)?feedback.observations:[];
  for(let i=0;i<feedbackItems.length;i++){
    const x=feedbackItems[i];
    if(typeof x?.observation==='string'&&x.observation.trim().length>=10&&typeof x?.action==='string'&&x.action.trim().length>=12){
      improvements.push({id:'feedback-'+(i+1),area:String(x.area||'Redaktion'),evidence:x.observation,action:x.action,priority:x.priority==='medium'?'medium':'high',status:'feedback'});
    }
  }
  return{
    schemaVersion:1,videoId:meta.videoId,title:meta.title,createdAt:new Date().toISOString(),
    evidence:'Export, finale Timeline, tatsächliches Voice-over und optional explizites Feedback.',
    technicalExportPassed:true,metrics,improvements,
    strengths:['Finaler Export erfolgreich geprüft; '+round(duration)+'s echte Laufzeit und '+images.length+' gemessene Bildmomente.'],
    humanReview:{
      status:feedbackItems.length?'feedback-present':'pending',
      stillToInspect:['Thema und erwartete Klickattraktivität','Hook und Verständlichkeit','natürlicher Skriptfluss, Humor und Spannungsbogen','Bild-Text-Passung, Bildqualität, konsistente Figuren','Stimme, Pausen, Ton und Schnitt','Schluss und Payoff','Titel und Thumbnail'],
      instruction:'Fertiges Video tatsächlich sichten. Echte qualitative Beobachtungen als POST_VIDEO_FEEDBACK.json speichern und review:video erneut starten. Keine erfundenen Noten.'
    },
    youtubeAnalytics:{status:'not-provided',instruction:'CTR, Zuschauerbindung und Klickzahlen nur aus echten Analytics übernehmen.'}
  };
}

export async function runPostVideoReview(projectDirectory){
  const p=projectPaths(projectDirectory);
  const [meta,timeline,report,script,pipeline,feedback]=await Promise.all([
    readJson(p.meta),readJson(p.timeline),readJson(path.join(p.techDir,'EXPORT_REPORT.json')),
    readFile(p.script,'utf8'),readJson(path.resolve('config/pipeline.json')),
    readJson(path.join(p.techDir,'POST_VIDEO_FEEDBACK.json'),null)
  ]);
  const review=assessVideo({meta,timeline,report,script,pipeline,feedback});
  await writeJson(path.join(p.techDir,'POST_VIDEO_REVIEW.json'),review);
  const m=review.metrics;
  const lines=[
    '# Post-Video-Review: '+review.title,'',
    '**Priorität 1: Lernen nach JEDEM fertigen Video.**','',
    '## Gemessene Daten','',
    '- Laufzeit: '+m.durationSeconds+'s; Ziel: '+m.targetDurationSeconds+'s; Differenz: '+m.deltaSeconds+'s.',
    '- Wörter: '+m.scriptWords+'; tatsächliches Sprechtempo: '+m.wordsPerMinute+' Wörter/Minute.',
    '- Bilder: '+m.imageCount+'; Dichte: '+m.imagesPer100Seconds+' je 100s; Cover: '+m.coverSeconds+'s.',
    '- Erste zehn Sekunden: '+m.introImageStarts+' Bildstarts; lange Standbilder: '+m.longHoldImageNumbers.length+'.','',
    '## Konkrete Verbesserungen','',
    ...(review.improvements.length?review.improvements.map(x=>'- **'+x.area+'**: '+x.evidence+' → '+x.action):['- Keine weiteren Fehler allein durch Export-Zahlen belegt. Echte Sichtprüfung ist noch erforderlich.']),'',
    '## Redaktionelle Sichtprüfung','',
    ...review.humanReview.stillToInspect.map(x=>'- [ ] '+x),'',
    'Qualitatives Feedback in 99-tech/POST_VIDEO_FEEDBACK.json eintragen und review:video erneut ausführen.','',
    '**Wichtig:** Keine erfundene Zuschauerbindung, CTR oder Qualitätswertung.',''
  ];
  await writeFile(path.join(p.techDir,'POST_VIDEO_REVIEW.md'),lines.join('\n'),'utf8');
  const logFile=path.resolve('youtube/_intern/LEARNING_LOG.json');
  const log=await readJson(logFile,{schemaVersion:1,priority:1,entries:[]});
  if(!Array.isArray(log.entries))log.entries=[];
  const e={videoId:review.videoId,title:review.title,reviewPath:path.relative(process.cwd(),path.join(p.techDir,'POST_VIDEO_REVIEW.json')).replaceAll('\\','/'),updatedAt:review.createdAt,metrics:review.metrics,improvements:review.improvements,humanReviewStatus:review.humanReview.status};
  const pos=log.entries.findIndex(x=>x.videoId===e.videoId);
  if(pos>=0)log.entries[pos]=e;else log.entries.push(e);
  await writeJson(logFile,log);
  console.log('Post-Video-Lernbericht: '+review.videoId+'; '+review.improvements.length+' Verbesserungsaufträge.');
  return review;
}

async function main(){
  const dir=arg('--dir');
  if(!dir)throw new Error('Nutzung: npm run review:video -- --dir "youtube/..."');
  await runPostVideoReview(dir);
}
if(isMain(import.meta.url))main().catch(e=>{console.error('Post-Video-Review: FEHLER — '+e.message);process.exitCode=1;});
