#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { arg, copyDirectory, ensureInside, exists, isMain, normalizeText, readJson, slugify, writeJson } from '../lib/pipeline.js';
import { evaluateTopic } from './check-topic.js';

function chooseContentMode(topic,contentPolicy){
  const policy=contentPolicy.contentModePolicy??{};
  const text=normalizeText(topic);
  const realSignals=policy.realInstitutionSignals??[];
  if(realSignals.some((signal)=>text.includes(normalizeText(signal))))return policy.realInstitutionDefault??'hybrid';
  return policy.preferredDefault??'hybrid';
}

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
  await mkdir(path.dirname(destination),{recursive:true});
  await copyDirectory(path.resolve('youtube/_intern/templates/video-template'),destination);

  const now=new Date().toISOString(),techDir=path.join(destination,'99-tech'),metaPath=path.join(techDir,'video.json'),meta=await readJson(metaPath);
  Object.assign(meta,{videoId:`${week}_${slug}`,weekFolder:week,topicSlug:slug,title,topic,visualStyleId:visual.styleId,visualPolicyVersion:visual.visualPolicyVersion,contentPolicyVersion:contentPolicy.contentPolicyVersion,learningPolicyVersion:1,createdAt:now,updatedAt:now});
  await writeJson(metaPath,meta);

  const contentPlanPath=path.join(techDir,'CONTENT_PLAN.json'),contentPlan=await readJson(contentPlanPath),defaultMode=chooseContentMode(topic,contentPolicy);
  Object.assign(contentPlan,{contentPolicyVersion:contentPolicy.contentPolicyVersion,language:'de',topic,workingTitle:title,contentMode:defaultMode});
  await writeJson(contentPlanPath,contentPlan);

  const researchPath=path.join(techDir,'RESEARCH.json'),research=await readJson(researchPath);
  Object.assign(research,{topic});
  await writeJson(researchPath,research);

  // Jede neue Produktion übernimmt die bestätigten Lektionen früherer Videos.
  const playbook=await readJson(path.resolve('config/learning-playbook.json'),{lessons:[]});
  const learnLog=await readJson(path.resolve('youtube/_intern/LEARNING_LOG.json'),{entries:[]});
  const recent=(learnLog.entries??[]).filter(x=>x.videoId!==meta.videoId).slice(-3);
  const measured=recent.flatMap(x=>(x.improvements??[]).filter(y=>y.status==='evidence-based'||y.status==='feedback').map(y=>({source:x.videoId,action:y.action}))).slice(-5);
  const baseline=(playbook.lessons??[]).filter(x=>x.priority==='high').slice(0,5).map(x=>({source:x.source,action:x.action}));
  const selected=[...measured,...baseline].slice(0,8);
  contentPlan.learningFromPreviousVideos={policyVersion:1,sourceVideos:recent.map(x=>x.videoId),plannedImprovements:selected,appliedDuringProduction:[],notes:'Verbesserungen beim Schreiben, Bildplanen und Rendern tatsächlich beachten; nicht nur abhaken.'};
  await writeJson(contentPlanPath,contentPlan);
  const summary=['# Verbindlicher Lernbrief','','Oberste Priorität: Jede neue Produktion nutzt Erkenntnisse aus vorigen Videos.','',...selected.map((x,i)=>(i+1)+'. ['+x.source+'] '+x.action),'','Vor der Bildproduktion prüfen, welche Schritte tatsächlich umgesetzt wurden.'];
  await writeFile(path.join(techDir,'LEARNING_BRIEF.md'),summary.join('\n')+'\n','utf8');
  if(Number(visual.visualPolicyVersion)>=9){
    await writeFile(path.join(techDir,'VISUAL_BRIEF.md'),[
      '# Szenenbasierte Bildplanung – StrichModus V9','',
      'Lies youtube/_intern/SCENE_VISUAL_GUIDE_V9.md und die aktuelle config/visual-policy.json.',
      'Niemals pauschal fünf Figurenbilder pro Batch generieren: Jede gesprochene Aussage bekommt ihren idealen Bildtyp.',
      'Jede SCENE_PLAN.json-Szene braucht exakten Skriptanker, Kernaussage (message), visualType, konkrete Komposition (visual), mindestens zwei wichtige elements und bei Erklärgrafiken 2–7 exakte kurze labels.',
      'Für Handlungen: szene oder detail. Für Rangstufen: hierarchie. Für Beziehungen: organigramm. Für Unterschiede: vergleich. Für Folge: ablauf. Für Geschichte: zeitleiste. Für Orte: karte. Für belegte Größen: infografik.',
      'Keine Bild- oder Diagrammquoten. Ein durchgängiger handgezeichneter Editorial-Comic-Stil. Kurze deutsche Schrift nur bei tatsächlichem Informationsgewinn. Fakten prüfen.',
      'Danach npm run compile:flow -- --dir "youtube/<week>/<slug>" ausführen, alle echten Bilder visuell prüfen und fehlerhafte Versionen neu generieren.',
      ...(Number(visual.visualPolicyVersion)>=10?[
        '','## V10: eigene Bildwelt für dieses Video',
        'Fülle SCENE_PLAN.json → visualWorld: name, look (Stimmung/Material genau dieses Videos), palette (3–6 Farben), lighting, mindestens 3 locations mit festen Details, cast mit look und stages (Status über Kleidung/Requisiten), motif (Leitmotiv für Anfang und Ende).',
        'Jede Szene vom Typ szene/detail nennt location; Figuren über cast, Statusstufe über stage; motif: true im ersten und letzten Zehntel; chapter markiert YouTube-Kapitel (erstes bei Bild 01).',
        'Story und Titel: youtube/_intern/STORY_GUIDE_V10.md, CONTENT_PLAN.storyEngine, Titelformeln in config/content-policy.json.'
      ]:[])
    ].join('\n')+'\n','utf8');
  }


  const promptPath=path.join(destination,'00-bildprompts','99-alle-bildprompts.txt');
  const prompt=(await readFile(promptPath,'utf8')).replaceAll('{{VIDEO_TITLE}}',title).replaceAll('{{STYLE_ID}}',visual.styleId);
  await writeFile(promptPath,prompt,'utf8');

  const registryPath=path.resolve('config/topic-registry.json'),registry=await readJson(registryPath,{version:2,entries:[]});
  registry.entries.push({id:meta.videoId,title,aliases:[topic],status:'reserved',channelFitAtCreation:topicCheck.channelFit,topicQualityAtCreation:topicCheck.topicQuality,createdAt:now});
  await writeJson(registryPath,registry);

  console.log(`Projekt erstellt: ${path.relative(process.cwd(),destination)}`);
  console.log(`Themenqualität: ${topicCheck.topicQuality.score}/10`);
  console.log(`Content-Modus: ${defaultMode}`);
  console.log(`Empfohlene Skriptformate: ${(topicCheck.topicQuality.suggestedFormats??[]).join(', ')||'manuell wählen'}`);
  if(defaultMode==='hybrid')console.log('Hinweis: Reale Institution erkannt. Reale Fakten recherchieren; dramatische Verbindungsszenen dürfen intern als erfunden markiert werden.');
  console.log('Nächster Schritt: Rolle/Tagesablauf bzw. Progression konkret planen, dann Hook, Hauptteil, Schluss und Voice-over schreiben.');
}
if(isMain(import.meta.url))main().catch((e)=>{console.error(`Projekt-Erstellung: FEHLER — ${e.message}`);process.exitCode=1;});
