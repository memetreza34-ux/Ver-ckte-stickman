import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { editSimilarity, normalizeText, topicSimilarity } from '../src/lib/pipeline.js';

test('Visual Policy ist produktionsbereit',async()=>{const v=JSON.parse(await readFile('config/visual-policy.json','utf8'));assert.equal(v.status,'READY');assert.notEqual(v.styleId,'UNSET');assert.ok(v.rules.length>=4);});
test('Pipeline V2 hat Asset-, Alignment- und Render-QC',async()=>{const p=JSON.parse(await readFile('config/pipeline.json','utf8'));assert.equal(p.pipelineVersion,2);assert.ok(p.assetPolicy.minimumWidth>=1280);assert.ok(p.alignmentPolicy.minimumConfidence>=0.65);assert.ok(p.renderPolicy.durationToleranceSeconds<=0.25);});
test('Textnormalisierung funktioniert',()=>{assert.equal(normalizeText('Über Größe!'),'uber grosse');assert.ok(editSimilarity('psychologische manipulation','psychologische manipulation')===1);});
test('Themenähnlichkeit erkennt nahe Varianten',()=>{assert.ok(topicSimilarity('Warum gibt es Grenzen?','Wieso gibt es Grenzen?')>0.45);});
test('Template enthält echte Motion-Hints und injizierbare Visual Policy',async()=>{const p=await readFile('youtube/templates/video-template/00-plan/google-flow-prompt.txt','utf8');assert.match(p,/\{\{VISUAL_POLICY_JSON\}\}/);assert.match(p,/Motion Hint/);});
