import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { editSimilarity, normalizeText, projectPaths, topicSimilarity } from '../src/lib/pipeline.js';
import { evaluateChannelFit, evaluateTopicQuality } from '../src/cli/check-topic.js';
import { compileFlowPrompt } from '../src/cli/compile-flow-prompt.js';

test('Visual Policy bleibt produktionsbereit',async()=>{const v=JSON.parse(await readFile('config/visual-policy.json','utf8'));assert.equal(v.status,'READY');assert.equal(v.languagePolicy?.promptLanguage,'de');assert.equal(v.thumbnailDNA?.headlineRequired,true);});

test('Content Policy V9 kennt drei Skriptformate',async()=>{const c=JSON.parse(await readFile('config/content-policy.json','utf8'));assert.equal(c.contentPolicyVersion,9);assert.deepEqual(c.scriptFormatPolicy.allowedFormats,['mini-stories','progression','story']);assert.equal(c.scriptFormatPolicy.formats['mini-stories'].minimumSections,4);assert.equal(c.scriptFormatPolicy.formats.progression.minimumStages,4);assert.equal(c.scriptFormatPolicy.formats.story.minimumCausalTurns,4);});

test('Template V9 trennt die drei Formatpläne',async()=>{const c=JSON.parse(await readFile('youtube/templates/video-template/99-tech/CONTENT_PLAN.json','utf8'));assert.equal(c.schemaVersion,9);assert.equal(c.contentPolicyVersion,9);assert.ok(Object.hasOwn(c,'scriptFormat'));assert.ok(Object.hasOwn(c.formatPlan,'miniStories'));assert.ok(Object.hasOwn(c.formatPlan,'progression'));assert.ok(Object.hasOwn(c.formatPlan,'story'));assert.ok(Object.hasOwn(c.scriptQuality,'formatFit'));});

test('Package nutzt den V9 Validator',async()=>{const p=JSON.parse(await readFile('package.json','utf8'));assert.match(p.scripts['validate:phase1'],/validate-phase1-v9\.js$/);});

test('Pipeline behält adaptive Bilddichte und 5er-Batches',async()=>{const p=JSON.parse(await readFile('config/pipeline.json','utf8'));assert.ok(p.imagePolicy.hardMaximumSeconds<=8);assert.equal(p.imagePolicy.multipleImagesPerSentenceAllowed,true);assert.equal(p.flowProductionPolicy.batchSize,5);assert.equal(p.flowProductionPolicy.individualDownloadForbidden,true);assert.equal(p.flowProductionPolicy.manualRenameForbidden,true);});

test('Projektpfade bleiben schlank',()=>{const p=projectPaths('/tmp/beispiel');assert.match(p.prompt,/00-bildprompts[\\/]99-alle-bildprompts\.txt$/);assert.match(p.imagesDir,/03-bilder$/);assert.match(p.contentPlan,/99-tech[\\/]CONTENT_PLAN\.json$/);});

test('Kanalfit erkennt surreale Themen',async()=>{const bad=await evaluateChannelFit('iPhone Unboxing und Smartphone Review');assert.equal(bad.decision,'BLOCKED_CHANNEL_FIT');const good=await evaluateChannelFit('Jeder Spiegel zeigt dir, was zehn Minuten später passiert');assert.equal(good.decision,'APPROVED_CHANNEL_FIT');});

test('Themenqualität akzeptiert Mini-Stories, Progression und Story',async()=>{const list=await evaluateTopicQuality('7 absurde Regeln in einer Stadt ohne Schlaf');const prog=await evaluateTopicQuality('Von Stufe 1 bis zum Mafia-Boss');const story=await evaluateTopicQuality('Jeder Spiegel zeigt dir zehn Minuten Zukunft');assert.equal(list.decision,'APPROVED_TOPIC_QUALITY');assert.equal(prog.decision,'APPROVED_TOPIC_QUALITY');assert.equal(story.decision,'APPROVED_TOPIC_QUALITY');assert.ok(list.suggestedFormats.includes('mini-stories'));assert.ok(prog.suggestedFormats.includes('progression'));assert.ok(story.suggestedFormats.includes('story'));});

test('Generisches Referat bleibt schwach',async()=>{const boring=await evaluateTopicQuality('Die Geschichte der CIA');assert.equal(boring.decision,'REVIEW_TOPIC_QUALITY');});

test('Textnormalisierung funktioniert',()=>{assert.equal(normalizeText('Über Größe!'),'uber grosse');assert.equal(editSimilarity('psychologische manipulation','psychologische manipulation'),1);assert.ok(topicSimilarity('Warum gibt es Grenzen?','Wieso gibt es Grenzen?')>0.45);});

test('Flow-Check erzeugt exakt 5er-Batches',async()=>{const root=await mkdtemp(path.join(os.tmpdir(),'stickman-flow-'));try{await mkdir(path.join(root,'00-bildprompts'),{recursive:true});const blocks=Array.from({length:7},(_,i)=>`## Bild ${String(i+1).padStart(2,'0')}${i===0?' — COVER':''}\n${i===0?'ÜBERSCHRIFT: "TEST COVER"\n':''}BILDPROMPT:\nErzeuge eine vollständig illustrierte deutsche 16:9 2D-Comic-Szene Nummer ${i+1} mit klarer Stickman-Figur, deutlichen schwarzen Konturen, konkreter Handlung, Umgebung, Komposition und Licht. Kein Fotorealismus, keine Pseudo-Schrift und keine zufälligen Texte.`).join('\n\n');const f=path.join(root,'00-bildprompts','99-alle-bildprompts.txt');await writeFile(f,`# ALLE BILDPROMPTS — Test\n\n## VERBINDLICHE BILDWELT FÜR JEDES BILD\nNur deutsche 2D-Comic-Bilder.\n\n${blocks}\n`,'utf8');const out=await compileFlowPrompt(root);assert.equal(out,f);const dir=path.join(root,'00-bildprompts','5er-batches');const names=(await readdir(dir)).sort();assert.deepEqual(names,['01-bilder-01-05.txt','02-bilder-06-07.txt','BATCH_MANIFEST.json']);}finally{await rm(root,{recursive:true,force:true});}});

test('Flow-Check lehnt Platzhalter ab',async()=>{const root=await mkdtemp(path.join(os.tmpdir(),'stickman-flow-bad-'));try{await mkdir(path.join(root,'00-bildprompts'),{recursive:true});await writeFile(path.join(root,'00-bildprompts','99-alle-bildprompts.txt'),'## VERBINDLICHE BILDWELT\n{{VOICE_SCRIPT}}\n## Bild 01\nBILDPROMPT:\n[NOCH AUSFÜLLEN]\n','utf8');await assert.rejects(()=>compileFlowPrompt(root));}finally{await rm(root,{recursive:true,force:true});}});
