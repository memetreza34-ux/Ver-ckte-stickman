import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { editSimilarity, normalizeText, projectPaths, topicSimilarity } from '../src/lib/pipeline.js';
import { evaluateChannelFit } from '../src/cli/check-topic.js';
import { compileFlowPrompt } from '../src/cli/compile-flow-prompt.js';

test('Visual Policy ist produktionsbereit und fordert deutsche Cover-Überschrift',async()=>{const v=JSON.parse(await readFile('config/visual-policy.json','utf8'));assert.equal(v.status,'READY');assert.equal(v.languagePolicy?.promptLanguage,'de');assert.equal(v.thumbnailDNA?.headlineRequired,true);assert.ok(v.rules.length>=10);});

test('Content Policy erzwingt Cover-Überschrift, Kanalfit, Recherche und Ending',async()=>{const c=JSON.parse(await readFile('config/content-policy.json','utf8'));assert.equal(c.contentPolicyVersion,3);assert.equal(c.titleCoverPolicy.coverHeadlineRequired,true);assert.equal(c.titleCoverPolicy.coverHeadlineMaxWords,4);assert.ok(c.nicheFitPolicy.minimumPlanScore>=7);assert.ok(c.researchPolicy.minimumSources>=2);assert.equal(c.endingPolicy.required,true);});

test('Projektpfade benutzen Bildprompts und Bilder statt Plan und Assets',()=>{const p=projectPaths('/tmp/beispiel');assert.match(p.prompt,/00-bildprompts[\\/]99-alle-bildprompts\.txt$/);assert.match(p.imagesDir,/03-bilder$/);assert.match(p.contentPlan,/99-tech[\\/]CONTENT_PLAN\.json$/);assert.doesNotMatch(p.prompt,/00-plan/);assert.doesNotMatch(p.imagesDir,/assets/i);});

test('Kanalfit blockiert Fremdcontent und erkennt passende Themen',async()=>{const bad=await evaluateChannelFit('iPhone Unboxing und Smartphone Review');assert.equal(bad.decision,'BLOCKED_CHANNEL_FIT');const good=await evaluateChannelFit('Die bizarrsten Regeln einer Mafia-Hierarchie');assert.equal(good.decision,'APPROVED_CHANNEL_FIT');});

test('Textnormalisierung funktioniert',()=>{assert.equal(normalizeText('Über Größe!'),'uber grosse');assert.equal(editSimilarity('psychologische manipulation','psychologische manipulation'),1);});

test('Themenähnlichkeit erkennt nahe Varianten',()=>{assert.ok(topicSimilarity('Warum gibt es Grenzen?','Wieso gibt es Grenzen?')>0.45);});

test('Flow-Template ist schlank und enthält keine internen JSON-Dumps',async()=>{const p=await readFile('youtube/templates/video-template/00-bildprompts/99-alle-bildprompts.txt','utf8');assert.match(p,/VERBINDLICHER STYLE-LOCK/i);assert.match(p,/ÜBERSCHRIFT:/i);assert.match(p,/PROMPT:/i);assert.doesNotMatch(p,/CONTENT_POLICY_JSON|RESEARCH_JSON|VOICE_SCRIPT/);});

test('Content-Plan und Research liegen intern in 99-tech',async()=>{const c=JSON.parse(await readFile('youtube/templates/video-template/99-tech/CONTENT_PLAN.json','utf8'));const r=JSON.parse(await readFile('youtube/templates/video-template/99-tech/RESEARCH.json','utf8'));assert.equal(c.contentPolicyVersion,3);assert.equal(r.status,'DRAFT');});

test('Flow-Check akzeptiert fertige Datei ohne zweite Masterdatei',async()=>{const root=await mkdtemp(path.join(os.tmpdir(),'stickman-flow-'));try{await mkdir(path.join(root,'00-bildprompts'),{recursive:true});const f=path.join(root,'00-bildprompts','99-alle-bildprompts.txt');await writeFile(f,'# ALLE BILDPROMPTS — Test\n\n## VERBINDLICHER STYLE-LOCK FÜR JEDES BILD\nNur deutsche 2D-Comic-Bilder.\n\n## Bild 01 — COVER\nÜBERSCHRIFT: "TEST COVER"\nPROMPT:\nErzeuge eine vollständig illustrierte deutsche 16:9 2D-Comic-Szene mit klarer Stickman-Figur, deutlichen schwarzen Konturen, konkreter Handlung, Umgebung, Komposition und Licht. Die sichtbare Überschrift lautet exakt TEST COVER und erscheint genau einmal groß im oberen Bereich. Kein Fotorealismus, keine Pseudo-Schrift und keine zusätzlichen Texte.\n','utf8');const out=await compileFlowPrompt(root);assert.equal(out,f);}finally{await rm(root,{recursive:true,force:true});}});

test('Flow-Check lehnt interne Datenblöcke und Platzhalter ab',async()=>{const root=await mkdtemp(path.join(os.tmpdir(),'stickman-flow-bad-'));try{await mkdir(path.join(root,'00-bildprompts'),{recursive:true});await writeFile(path.join(root,'00-bildprompts','99-alle-bildprompts.txt'),'## VERBINDLICHER STYLE-LOCK\n{{VOICE_SCRIPT}}\n## Bild 01\nPROMPT:\n[NOCH AUSFÜLLEN]\n','utf8');await assert.rejects(()=>compileFlowPrompt(root));}finally{await rm(root,{recursive:true,force:true});}});
