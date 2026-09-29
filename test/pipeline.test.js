import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { editSimilarity, normalizeText, topicSimilarity } from '../src/lib/pipeline.js';
import { evaluateChannelFit } from '../src/cli/check-topic.js';
import { compileFlowPrompt } from '../src/cli/compile-flow-prompt.js';

test('Visual Policy ist produktionsbereit und vollständig deutsch',async()=>{const v=JSON.parse(await readFile('config/visual-policy.json','utf8'));assert.equal(v.status,'READY');assert.equal(v.styleId,'dark-grotesque-surreal-stickman-de-v1');assert.equal(v.languagePolicy?.channelLanguage,'de');assert.equal(v.languagePolicy?.promptLanguage,'de');assert.equal(v.languagePolicy?.allVisibleTextMustBeGerman,true);assert.ok(v.rules.length>=10);});

test('Content Policy hat Kanalfit, Recherche, Hook, Retention und Ending',async()=>{const c=JSON.parse(await readFile('config/content-policy.json','utf8'));assert.equal(c.status,'READY');assert.equal(c.language,'de');assert.ok(c.nicheFitPolicy.minimumPlanScore>=7);assert.ok(c.researchPolicy.minimumSources>=2);assert.ok(c.hookPolicy.allowedTypes.length>=6);assert.ok(c.retentionPolicy.minimumPlannedSignals>=2);assert.equal(c.endingPolicy.required,true);});

test('Kanalfit blockiert offensichtlichen Fremdcontent und erkennt passende Themen',async()=>{const bad=await evaluateChannelFit('iPhone Unboxing und Smartphone Review');assert.equal(bad.decision,'BLOCKED_CHANNEL_FIT');const good=await evaluateChannelFit('Die bizarrsten Regeln einer Mafia-Hierarchie');assert.equal(good.decision,'APPROVED_CHANNEL_FIT');});

test('Pipeline V2 hat Asset-, Alignment- und Render-QC',async()=>{const p=JSON.parse(await readFile('config/pipeline.json','utf8'));assert.equal(p.pipelineVersion,2);assert.ok(p.assetPolicy.minimumWidth>=1280);assert.ok(p.alignmentPolicy.minimumConfidence>=0.65);assert.ok(p.renderPolicy.durationToleranceSeconds<=0.25);});

test('Textnormalisierung funktioniert',()=>{assert.equal(normalizeText('Über Größe!'),'uber grosse');assert.equal(editSimilarity('psychologische manipulation','psychologische manipulation'),1);});

test('Themenähnlichkeit erkennt nahe Varianten',()=>{assert.ok(topicSimilarity('Warum gibt es Grenzen?','Wieso gibt es Grenzen?')>0.45);});

test('Content-Plan erzwingt Kanalfit, Retention und Ending',async()=>{const p=JSON.parse(await readFile('youtube/templates/video-template/00-plan/CONTENT_PLAN.json','utf8'));assert.equal(p.language,'de');assert.ok('topicFit' in p);assert.ok('retention' in p);assert.ok('ending' in p);assert.ok('titleCoverSystem' in p);});

test('Research-Template enthält Quellen, Claims und Unsicherheiten',async()=>{const r=JSON.parse(await readFile('youtube/templates/video-template/00-plan/RESEARCH.json','utf8'));assert.equal(r.status,'DRAFT');assert.ok(Array.isArray(r.sources));assert.ok(Array.isArray(r.claims));assert.ok(Array.isArray(r.uncertainties));});

test('Flow-Prompt bettet Content-Plan, Recherche und Voice-over ein',async()=>{const p=await readFile('youtube/templates/video-template/00-plan/google-flow-prompt.txt','utf8');assert.match(p,/\{\{CONTENT_PLAN_JSON\}\}/);assert.match(p,/\{\{RESEARCH_JSON\}\}/);assert.match(p,/\{\{VOICE_SCRIPT\}\}/);assert.match(p,/vollständig auf Deutsch/i);assert.match(p,/Titel und Cover müssen sich ergänzen/i);});

test('Flow-Compiler ersetzt alle projektbezogenen Platzhalter',async()=>{const root=await mkdtemp(path.join(os.tmpdir(),'stickman-flow-'));try{await mkdir(path.join(root,'00-plan'),{recursive:true});await mkdir(path.join(root,'01-script'),{recursive:true});await writeFile(path.join(root,'00-plan','google-flow-prompt.txt'),'PLAN\n{{CONTENT_PLAN_JSON}}\nRESEARCH\n{{RESEARCH_JSON}}\nSCRIPT\n{{VOICE_SCRIPT}}\n','utf8');await writeFile(path.join(root,'00-plan','CONTENT_PLAN.json'),JSON.stringify({hook:{text:'Testhook'}}),'utf8');await writeFile(path.join(root,'00-plan','RESEARCH.json'),JSON.stringify({summary:'Belegte Recherche'}),'utf8');await writeFile(path.join(root,'01-script','voice-script.txt'),'Testhook. Das ist der finale Text.','utf8');const out=await compileFlowPrompt(root),compiled=await readFile(out,'utf8');assert.doesNotMatch(compiled,/\{\{(?:CONTENT_PLAN_JSON|RESEARCH_JSON|VOICE_SCRIPT)\}\}/);assert.match(compiled,/Testhook/);assert.match(compiled,/Belegte Recherche/);}finally{await rm(root,{recursive:true,force:true});}});
