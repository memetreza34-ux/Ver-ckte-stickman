import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { editSimilarity, normalizeText, topicSimilarity } from '../src/lib/pipeline.js';

test('Visual Policy ist produktionsbereit und vollständig deutsch',async()=>{const v=JSON.parse(await readFile('config/visual-policy.json','utf8'));assert.equal(v.status,'READY');assert.equal(v.styleId,'dark-grotesque-surreal-stickman-de-v1');assert.equal(v.languagePolicy?.channelLanguage,'de');assert.equal(v.languagePolicy?.promptLanguage,'de');assert.equal(v.languagePolicy?.allVisibleTextMustBeGerman,true);assert.ok(v.rules.length>=10);});

test('Content Policy erzwingt individuelle Hook-, Story- und Cover-Planung',async()=>{const c=JSON.parse(await readFile('config/content-policy.json','utf8'));assert.equal(c.status,'READY');assert.equal(c.language,'de');assert.equal(c.individualityPolicy?.required,true);assert.ok(c.hookPolicy.allowedTypes.length>=6);assert.ok(c.storyPolicy.narrativeModes.length>=6);assert.match(c.titleCoverPolicy.principle,/ergänzen/i);});

test('Pipeline V2 hat Asset-, Alignment- und Render-QC',async()=>{const p=JSON.parse(await readFile('config/pipeline.json','utf8'));assert.equal(p.pipelineVersion,2);assert.ok(p.assetPolicy.minimumWidth>=1280);assert.ok(p.alignmentPolicy.minimumConfidence>=0.65);assert.ok(p.renderPolicy.durationToleranceSeconds<=0.25);});

test('Textnormalisierung funktioniert',()=>{assert.equal(normalizeText('Über Größe!'),'uber grosse');assert.ok(editSimilarity('psychologische manipulation','psychologische manipulation')===1);});

test('Themenähnlichkeit erkennt nahe Varianten',()=>{assert.ok(topicSimilarity('Warum gibt es Grenzen?','Wieso gibt es Grenzen?')>0.45);});

test('Content-Plan hat Hook, Story, Retention und Titel-Cover-System',async()=>{const p=JSON.parse(await readFile('youtube/templates/video-template/00-plan/CONTENT_PLAN.json','utf8'));assert.equal(p.language,'de');assert.ok('viewerPromise' in p);assert.ok('hook' in p);assert.ok('narrativeMode' in p);assert.ok(Array.isArray(p.beats));assert.ok('retention' in p);assert.ok('titleCoverSystem' in p);assert.ok('coverConcept' in p.titleCoverSystem);});

test('Bildprompt injiziert Content- und Visual-Policy und bleibt deutsch',async()=>{const p=await readFile('youtube/templates/video-template/00-plan/google-flow-prompt.txt','utf8');assert.match(p,/\{\{CONTENT_POLICY_JSON\}\}/);assert.match(p,/\{\{VISUAL_POLICY_JSON\}\}/);assert.match(p,/CONTENT_PLAN\.json/);assert.match(p,/Bewegungs-Hinweis/);assert.match(p,/vollständig auf Deutsch/i);assert.match(p,/Titel und Cover müssen sich ergänzen/i);});
