import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { editSimilarity, normalizeText, projectPaths, topicSimilarity } from '../src/lib/pipeline.js';
import { evaluateChannelFit, evaluateTopicQuality } from '../src/cli/check-topic.js';
import { validatePhase1V9 } from '../src/cli/validate-phase1-v9.js';
import { compileFlowPrompt } from '../src/cli/compile-flow-prompt.js';
import { assessVideo } from '../src/cli/review-video.js';
import { validateYouTubeDescription } from '../src/lib/youtube-description.js';
import { STICKMAN_ANATOMY_RULE, auditStickmanPrompts, auditLivelyGermanVisuals } from '../src/lib/stickman-style.js';

test('Visual Policy bleibt produktionsbereit',async()=>{const v=JSON.parse(await readFile('config/visual-policy.json','utf8'));assert.equal(v.status,'READY');assert.equal(v.languagePolicy?.promptLanguage,'de');assert.equal(v.thumbnailDNA?.headlineRequired,true);});

test('Content Policy V10 priorisiert Rollen und drei Skriptformate',async()=>{const c=JSON.parse(await readFile('config/content-policy.json','utf8'));assert.equal(c.contentPolicyVersion,10);assert.deepEqual(c.scriptFormatPolicy.allowedFormats,['mini-stories','progression','story']);assert.ok(c.channelDirection.preferredTopicArchetypes.includes('Ein Tag als FBI-Agent'));assert.equal(c.contentModePolicy.realInstitutionDefault,'hybrid');assert.equal(c.youtubeUploadPolicy.exportFile,'04-export/YOUTUBE_CAPTION.txt');assert.equal(c.youtubeUploadPolicy.timedTranscriptFile,'04-export/UNTERTITEL_SCRIPT.txt');});

test('Template V10 trennt die drei Formatpläne',async()=>{const c=JSON.parse(await readFile('youtube/_intern/templates/video-template/99-tech/CONTENT_PLAN.json','utf8'));assert.equal(c.schemaVersion,10);assert.equal(c.contentPolicyVersion,10);assert.ok(Object.hasOwn(c,'storyEngine'));assert.ok(Object.hasOwn(c,'scriptFormat'));assert.ok(Object.hasOwn(c.formatPlan,'miniStories'));assert.ok(Object.hasOwn(c.formatPlan,'progression'));assert.ok(Object.hasOwn(c.formatPlan,'story'));assert.ok(Object.hasOwn(c.scriptQuality,'formatFit'));});

test('Package und Phase 3 nutzen V9',async()=>{const p=JSON.parse(await readFile('package.json','utf8'));assert.equal(p.version,'2.9.0');assert.match(p.scripts['validate:phase1'],/validate-phase1-v9\.js$/);const phase3=await readFile('src/cli/phase3.js','utf8');assert.match(phase3,/validate-phase1-v9\.js/);assert.doesNotMatch(phase3,/validate-phase1-v4\.js/);});

test('Finalizer exportiert Caption und zeitcodiertes Vollskript',async()=>{const f=await readFile('src/cli/finalize.js','utf8');assert.match(f,/YOUTUBE_CAPTION\.txt/);assert.match(f,/UNTERTITEL_SCRIPT\.txt/);assert.match(f,/YOUTUBE_AUDIO_OPTIMIZED\.json/);assert.match(f,/blockSeconds=10/);assert.match(f,/Whisper-Zeitdaten fehlen/);});

test('Pipeline behält adaptive Bilddichte und 5er-Batches',async()=>{const p=JSON.parse(await readFile('config/pipeline.json','utf8'));assert.ok(p.imagePolicy.hardMaximumSeconds<=8);assert.equal(p.imagePolicy.multipleImagesPerSentenceAllowed,true);assert.equal(p.flowProductionPolicy.batchSize,5);assert.equal(p.flowProductionPolicy.individualDownloadForbidden,true);assert.equal(p.flowProductionPolicy.manualRenameForbidden,true);});

test('Projektpfade bleiben schlank',()=>{const p=projectPaths('/tmp/beispiel');assert.match(p.prompt,/00-bildprompts[\\/]99-alle-bildprompts\.txt$/);assert.match(p.imagesDir,/03-bilder$/);assert.match(p.contentPlan,/99-tech[\\/]CONTENT_PLAN\.json$/);});

test('Kanalfit bevorzugt konkrete Rollen',async()=>{const bad=await evaluateChannelFit('iPhone Unboxing und Smartphone Review');assert.equal(bad.decision,'BLOCKED_CHANNEL_FIT');const cia=await evaluateChannelFit('Ein Tag als CIA-Agent');const fbi=await evaluateChannelFit('Ein Tag als FBI-Agent');assert.equal(cia.decision,'APPROVED_CHANNEL_FIT');assert.equal(fbi.decision,'APPROVED_CHANNEL_FIT');});

test('Themenqualität akzeptiert Ein-Tag-Rollen und Progression',async()=>{const cia=await evaluateTopicQuality('Ein Tag als CIA-Agent');const fbi=await evaluateTopicQuality('Ein Tag als FBI-Agent');const prog=await evaluateTopicQuality('Vom Rekruten bis zum Mafia-Boss');assert.equal(cia.decision,'APPROVED_TOPIC_QUALITY');assert.equal(fbi.decision,'APPROVED_TOPIC_QUALITY');assert.equal(prog.decision,'APPROVED_TOPIC_QUALITY');assert.ok(cia.suggestedFormats.includes('mini-stories')||cia.suggestedFormats.includes('story'));assert.ok(prog.suggestedFormats.includes('progression'));});

test('Generisches Referat bleibt schwach',async()=>{const boring=await evaluateTopicQuality('Die Geschichte der CIA');assert.equal(boring.decision,'REVIEW_TOPIC_QUALITY');});

test('Textnormalisierung funktioniert',()=>{assert.equal(normalizeText('Über Größe!'),'uber grosse');assert.equal(editSimilarity('psychologische manipulation','psychologische manipulation'),1);assert.ok(topicSimilarity('Warum gibt es Grenzen?','Wieso gibt es Grenzen?')>0.45);});

test('Flow-Check erzeugt exakt 5er-Batches',async()=>{const root=await mkdtemp(path.join(os.tmpdir(),'stickman-flow-'));try{await mkdir(path.join(root,'00-bildprompts'),{recursive:true});const blocks=Array.from({length:7},(_,i)=>`## Bild ${String(i+1).padStart(2,'0')}${i===0?' — COVER':''}\n${i===0?'ÜBERSCHRIFT: "TEST COVER"\n':''}BILDPROMPT:\nErzeuge eine vollständig illustrierte deutsche 16:9 2D-Comic-Szene Nummer ${i+1} mit klarer Stickman-Figur, deutlichen schwarzen Konturen, konkreter Handlung, Umgebung, Komposition und Licht. Kein Fotorealismus, keine Pseudo-Schrift und keine zufälligen Texte.`).join('\n\n');const f=path.join(root,'00-bildprompts','99-alle-bildprompts.txt');await writeFile(f,`# ALLE BILDPROMPTS — Test\n\n## VERBINDLICHE BILDWELT FÜR JEDES BILD\nNur deutsche 2D-Comic-Bilder.\n\n${blocks}\n`,'utf8');const out=await compileFlowPrompt(root);assert.equal(out,f);const dir=path.join(root,'00-bildprompts','5er-batches');const names=(await readdir(dir)).sort();assert.deepEqual(names,['01-bilder-01-05.txt','02-bilder-06-07.txt','BATCH_MANIFEST.json']);}finally{await rm(root,{recursive:true,force:true});}});

test('Flow-Check lehnt Platzhalter ab',async()=>{const root=await mkdtemp(path.join(os.tmpdir(),'stickman-flow-bad-'));try{await mkdir(path.join(root,'00-bildprompts'),{recursive:true});await writeFile(path.join(root,'00-bildprompts','99-alle-bildprompts.txt'),'## VERBINDLICHE BILDWELT\n{{VOICE_SCRIPT}}\n## Bild 01\nBILDPROMPT:\n[NOCH AUSFÜLLEN]\n','utf8');await assert.rejects(()=>compileFlowPrompt(root));}finally{await rm(root,{recursive:true,force:true});}});

test('Deutsche Schauplätze und Institutionen sind neuer Standard',async()=>{const p=JSON.parse(await readFile('config/content-policy.json','utf8'));assert.equal(p.localizationPolicy.preferredCountry,'Deutschland');assert.ok(p.channelDirection.preferredTopicArchetypes.includes('Ein Tag beim BKA'));assert.ok(p.localizationPolicy.rules.some(x=>x.includes('FBI')));});
test('BKA SEK Kripo sind im Themencheck erlaubt',async()=>{for(const topic of ['Ein Tag beim BKA','Dein erster Tag beim SEK','Ein Tag bei der Kriminalpolizei']){const c=await evaluateChannelFit(topic);const q=await evaluateTopicQuality(topic);assert.equal(c.decision,'APPROVED_CHANNEL_FIT');assert.equal(q.decision,'APPROVED_TOPIC_QUALITY');assert.ok(q.suggestedFormats.includes('mini-stories'));}const old=await evaluateTopicQuality('Die Geschichte des BKA');assert.equal(old.decision,'REVIEW_TOPIC_QUALITY');});

test('YouTube-Beschreibung mit exakt fünf Hashtags und zwei Absätzen',()=>{
  const body=('Ein konkreter und unterhaltsamer Videotext mit passend erklärten Szenen und nachvollziehbarem Thema. '.repeat(4)).trim()+'\n\n'+('Ein weiterer sinnvoller Absatz mit den besonderen Situationen des Videos, ohne künstliche Hashtag-Floskeln. '.repeat(3)).trim();
  const good=body+'\n\n#FBI #Ermittlung #Stickman #Geschichten #StrichModus';
  assert.ok(body.length>=450);
  assert.equal(validateYouTubeDescription(good).passed,true);
  assert.equal(validateYouTubeDescription(good.replace(' #StrichModus','')).passed,false);
  assert.equal(validateYouTubeDescription(good+' #Zusatz').passed,false);
  assert.equal(validateYouTubeDescription(good.replace('#StrichModus','#FBI')).passed,false);
  assert.equal(validateYouTubeDescription(body.split('\n\n').join(' ')+'\n\n#FBI #Ermittlung #Stickman #Geschichten #StrichModus').passed,false);
  assert.equal(validateYouTubeDescription('Zu kurz.\n\n#FBI #Ermittlung #Stickman #Geschichten #StrichModus').passed,false);
  assert.equal(validateYouTubeDescription(body+' #Zusaetzlich\n\n#FBI #Ermittlung #Stickman #Geschichten #StrichModus').passed,false);
});
test('Content-Policy schreibt längere Captions und fünf Hashtags vor',async()=>{
 const p=JSON.parse(await readFile('config/content-policy.json','utf8'));
 assert.ok(p.youtubeUploadPolicy.descriptionMinimumBodyCharacters>=450);
 assert.equal(p.youtubeUploadPolicy.hashtagCount,5);
 assert.equal(p.youtubeUploadPolicy.descriptionMinimumParagraphs,2);
});

test('Kontinuierliche Verbesserung ist obligatorische Priorität 1',async()=>{
 const p=JSON.parse(await readFile('config/content-policy.json','utf8'));
 assert.equal(p.continuousImprovementPolicy.priority,1);
 assert.equal(p.continuousImprovementPolicy.mandatory,true);
 assert.equal(p.priorityOrder[0],'1_continuous_improvement');
 const f=await readFile('src/cli/finalize.js','utf8');
 assert.match(f,/runPostVideoReview\(projectDirectory\)/);
});
test('Review erkennt technische Probleme und übernimmt qualitatives Feedback',()=>{
 const sample={
  meta:{videoId:'test-1',title:'Probe',targetDurationSeconds:400},
  timeline:{fps:30,audioDurationSeconds:294,images:Array.from({length:70},(_,i)=>({imageNumber:i+1,startFrame:i*115,durationSeconds:i===0?3:4.2}))},
  report:{passed:true,durationSeconds:295},
  script:Array.from({length:900},()=> 'wort').join(' '),
  feedback:{observations:[{area:'Skript',observation:'Der Anfang war zu kompliziert.',action:'Die Situation im ersten Satz deutlich machen.'}]},
  pipeline:{fps:30,imagePolicy:{targetImagesPer100Seconds:[30,42],preferSplitAboveSeconds:5.8},introVisualPolicy:{maximumCoverHoldSeconds:2.2,minimumImageStartsInWindow:4}}
 };
 const result=assessVideo(sample);
 assert.equal(result.metrics.imageCount,70);
 assert.ok(result.improvements.some(x=>x.id==='duration-calibration'));
 assert.ok(result.improvements.some(x=>x.id==='visual-density-low'));
 assert.ok(result.improvements.some(x=>x.id==='cover-duration'));
 assert.ok(result.improvements.some(x=>x.id==='feedback-1'));
 assert.equal(result.youtubeAnalytics.status,'not-provided');
 assert.throws(()=>assessVideo({...sample,report:{passed:false,durationSeconds:295}}));
});
test('Neue Videos erhalten Lernbrief statt Wiederholung bekannter Fehler',async()=>{
 const make=await readFile('src/cli/create-project.js','utf8');
 assert.match(make,/LEARNING_BRIEF\.md/);
 assert.match(make,/LEARNING_LOG\.json/);
 assert.match(make,/learningFromPreviousVideos/);
 const v=await readFile('src/cli/validate-phase1-v9.js','utf8');
 assert.match(v,/Lernpflicht/);
});

test('StrichModus priorisiert reale Berufswelten und echte Strukturen',async()=>{
 const p=JSON.parse(await readFile('config/content-policy.json','utf8'));
 assert.match(p.channelDirection.core,/Machtstrukturen/);
 assert.equal(p.contentModePolicy.preferredDefault,'hybrid');
 const approved=[
  ['Ein Tag als FBI-Agent','mini-stories'],
  ['Ein Tag im Bundestag','mini-stories'],
  ['Ein Tag im antiken Rom','mini-stories'],
  ['Die Hierarchie einer Mafia erklärt','progression'],
  ['Wie ein Kartell aufgebaut ist','progression'],
  ['Ein Tag beim BKA','mini-stories'],
  ['Vom Rekruten bis zum Mafia-Boss','progression']
 ];
 for(const [name,format] of approved){
   const fit=await evaluateChannelFit(name);
   const q=await evaluateTopicQuality(name);
   assert.equal(fit.decision,'APPROVED_CHANNEL_FIT',name);
   assert.equal(q.decision,'APPROVED_TOPIC_QUALITY',name);
   assert.ok(q.suggestedFormats.includes(format),name);
 }
 for(const name of ['Du bist unsichtbar, aber deine Kleidung nicht','Du kannst Gedanken lesen','Eine Stadt, in der Schlaf verboten ist']){
   const fit=await evaluateChannelFit(name);
   const q=await evaluateTopicQuality(name);
   assert.equal(fit.decision,'REVIEW_CHANNEL_FIT',name);
   assert.equal(q.decision,'REVIEW_TOPIC_QUALITY',name);
 }
 const generic=await evaluateTopicQuality('Die Geschichte der CIA');
 assert.equal(generic.decision,'REVIEW_TOPIC_QUALITY');
});

test('YouTube-Hauptordner bleibt aufgeräumt und interne Dateien werden verwendet',async()=>{
 const root=await readdir('youtube');
 assert.ok(root.includes('_intern'));
 for(const hidden of ['CONTENT_SYSTEM.md','CONTINUOUS_IMPROVEMENT.md','LEARNING_LOG.json','WORKFLOW.md','templates']){
   assert.ok(!root.includes(hidden),'Systemdatei darf nicht lose unter youtube liegen: '+hidden);
 }
 for(const required of ['CONTENT_SYSTEM.md','CONTINUOUS_IMPROVEMENT.md','LEARNING_LOG.json','WORKFLOW.md','templates/video-template/99-tech/CONTENT_PLAN.json']){
   assert.ok((await readFile(path.join('youtube/_intern',required),'utf8')).length>0);
 }
 const create=await readFile('src/cli/create-project.js','utf8');
 const review=await readFile('src/cli/review-video.js','utf8');
 assert.match(create,/youtube\/_intern\/templates\/video-template/);
 assert.match(create,/youtube\/_intern\/LEARNING_LOG\.json/);
 assert.match(review,/youtube\/_intern\/LEARNING_LOG\.json/);
 const policy=JSON.parse(await readFile('config/content-policy.json','utf8'));
 assert.equal(policy.continuousImprovementPolicy.globalLog,'youtube/_intern/LEARNING_LOG.json');
});

test('Stickman V7: jeder Einzelprompt braucht klassische Linien-Anatomie',()=>{
  const ok=['## Bild 01 — COVER\nBILDPROMPT:\n16:9 '+STICKMAN_ANATOMY_RULE+' Startszene.','## Bild 02\nBILDPROMPT:\n16:9 '+STICKMAN_ANATOMY_RULE+' Andere Szene.'];
  assert.equal(auditStickmanPrompts(ok).passed,true);
  assert.equal(auditStickmanPrompts([ok[0],'## Bild 02\nBILDPROMPT:\n16:9. Malerische, anatomisch korrekte Comic-Menschen.']).passed,false);
  assert.equal(auditStickmanPrompts([ok[0].replace('Strichbeine','menschliche Beine')]).passed,false);
  assert.equal(auditStickmanPrompts([ok[0]+' Zeichne die Nebenfiguren als realistische Menschen.']).passed,false);
});

test('Visual Policy V9 wählt Bildtypen nach Aussage statt Stickman-Quote',async()=>{
  const vp=JSON.parse(await readFile('config/visual-policy.json','utf8'));
  assert.equal(vp.visualPolicyVersion,10);
  assert.equal(vp.visualQualityV9.noFixedFigureRatio,true);
  assert.equal(vp.visualQualityV9.sceneSpecificPlanningRequired,true);
  assert.equal(vp.informationTextPolicy.allowedOutsideCover,true);
  assert.equal(vp.characterDNA.figuresOptional,true);
  const create=await readFile('src/cli/create-project.js','utf8');
  assert.match(create,/visualPolicyVersion:visual.visualPolicyVersion/);
  assert.match(create,/VISUAL_BRIEF\.md/);
  const flow=await readFile('src/cli/compile-flow-prompt.js','utf8');
  assert.match(flow,/auditEditorialVisuals/);
  assert.match(flow,/auditStickmanPrompts/); // Altprojekte mit V8 bleiben gültig.
});
test('Mafia KW42: Phase 1 ist vollständig und 25 Flow-5er-Blöcke lassen sich automatisch erzeugen',async()=>{
 const project='youtube/2026-KW42/mafia-hierarchie-erklaert';
 const result=await validatePhase1V9(project);
 assert.equal(result.passed,true,result.errors.join(' | '));
 // 5er-Batches sind gitignored: in einer Projektkopie frisch erzeugen statt eingecheckte Dateien zu lesen.
 const tmp=await mkdtemp(path.join(os.tmpdir(),'stickman-mafia-'));
 try{
  await cp(project,tmp,{recursive:true,filter:(src)=>!src.includes(`${path.sep}5er-batches`)});
  await compileFlowPrompt(tmp);
  const batchDir=path.join(tmp,'00-bildprompts/5er-batches');
  const manifest=JSON.parse(await readFile(path.join(batchDir,'BATCH_MANIFEST.json'),'utf8'));
  assert.equal(manifest.totalImages,125);
  assert.equal(manifest.batches.length,25);
  const images=manifest.batches.flatMap(b=>Array.from({length:b.count},(_,k)=>b.from+k));
  assert.deepEqual(images,Array.from({length:125},(_,i)=>i+1));
  for(const batch of manifest.batches){
   const block=await readFile(path.join(batchDir,batch.file),'utf8');
   assert.equal((block.match(/^## Bild [0-9]{2,3}/gm)||[]).length,5);
   assert.ok(block.includes('STICKMAN-ANATOMIE:'));
  }
 }finally{await rm(tmp,{recursive:true,force:true});}
});

test('V8-Bildvalidator bleibt nur für alte Projekte nutzbar',async()=>{
 const valid=Array.from({length:10},(_,i)=>'## Bild '+String(i+1).padStart(2,'0')+(i===0?' — COVER\nÜBERSCHRIFT: "WER HAT MACHT?"':'')+'\nBILDPROMPT:\nLEBENDIGE SZENE: Eine Figur handelt. '+STICKMAN_ANATOMY_RULE+' KEINE BILDSCHRIFT.');
 assert.equal(auditLivelyGermanVisuals(valid).passed,true);
 assert.equal(auditLivelyGermanVisuals(valid.map((x,i)=>i===2?x.replace('KEINE BILDSCHRIFT',''):x)).passed,false);
 assert.equal(auditLivelyGermanVisuals(valid.map((x,i)=>i>1?x+' BILDTYP: AUSNAHME-DIAGRAMM':x)).passed,false);
});
test('Bildwelt V9 hat konsistente Text-, Marken- und Erklärregeln',async()=>{
 const v=JSON.parse(await readFile('config/visual-policy.json','utf8'));
 assert.equal(v.visualPolicyVersion,10);
 assert.equal(v.informationTextPolicy.allowedOutsideCover,true);
 assert.equal(v.languagePolicy.allVisibleTextMustBeGerman,true);
 assert.equal(v.sceneFirstVisualPolicy.priority,1);
 assert.equal(v.sceneFirstVisualPolicy.supportedTypes.hierarchie.includes('Pyramide'),true);
 assert.equal(v.visualQualityV9.noFixedChartRatio,true);
});
