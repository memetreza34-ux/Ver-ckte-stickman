import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { editSimilarity, normalizeText, projectPaths, topicSimilarity } from '../src/lib/pipeline.js';
import { evaluateChannelFit } from '../src/cli/check-topic.js';
import { compileFlowPrompt } from '../src/cli/compile-flow-prompt.js';

test('Visual Policy ist produktionsbereit und fordert deutsche Cover-Überschrift',async()=>{
  const v=JSON.parse(await readFile('config/visual-policy.json','utf8'));
  assert.equal(v.status,'READY');
  assert.equal(v.languagePolicy?.promptLanguage,'de');
  assert.equal(v.thumbnailDNA?.headlineRequired,true);
  assert.ok(v.rules.length>=10);
});

test('Content Policy V4 erzwingt immersive Faktenreise, Recherche und Cover',async()=>{
  const c=JSON.parse(await readFile('config/content-policy.json','utf8'));
  assert.equal(c.contentPolicyVersion,4);
  assert.equal(c.experiencePolicy.required,true);
  assert.ok(c.experiencePolicy.allowedFormats.includes('Lebensreise in Du-Perspektive'));
  assert.ok(c.researchPolicy.minimumClaims>=4);
  assert.ok(c.informationDensityPolicy.targetSecondsPerInformationBeat<=25);
  assert.equal(c.titleCoverPolicy.coverHeadlineRequired,true);
  assert.equal(c.endingPolicy.required,true);
});

test('Pipeline V3 fordert höhere adaptive Bilddichte',async()=>{
  const p=JSON.parse(await readFile('config/pipeline.json','utf8'));
  assert.equal(p.pipelineVersion,3);
  assert.ok(p.imagePolicy.targetAverageHoldSeconds[1]<=4.2);
  assert.ok(p.imagePolicy.preferSplitAboveSeconds<=6.2);
  assert.ok(p.imagePolicy.hardMaximumSeconds<=8);
  assert.deepEqual(p.imagePolicy.targetImagesPer100Seconds,[26,34]);
  assert.equal(p.imagePolicy.multipleImagesPerSentenceAllowed,true);
});

test('Projektpfade benutzen Bildprompts und Bilder statt Plan und Assets',()=>{
  const p=projectPaths('/tmp/beispiel');
  assert.match(p.prompt,/00-bildprompts[\\/]99-alle-bildprompts\.txt$/);
  assert.match(p.imagesDir,/03-bilder$/);
  assert.match(p.contentPlan,/99-tech[\\/]CONTENT_PLAN\.json$/);
  assert.doesNotMatch(p.prompt,/00-plan/);
  assert.doesNotMatch(p.imagesDir,/assets/i);
});

test('Kanalfit blockiert Fremdcontent und erkennt passende Rollen-Themen',async()=>{
  const bad=await evaluateChannelFit('iPhone Unboxing und Smartphone Review');
  assert.equal(bad.decision,'BLOCKED_CHANNEL_FIT');
  const good=await evaluateChannelFit('Dein Leben als CIA Agent');
  assert.equal(good.decision,'APPROVED_CHANNEL_FIT');
});

test('Textnormalisierung funktioniert',()=>{
  assert.equal(normalizeText('Über Größe!'),'uber grosse');
  assert.equal(editSimilarity('psychologische manipulation','psychologische manipulation'),1);
});

test('Themenähnlichkeit erkennt nahe Varianten',()=>{
  assert.ok(topicSimilarity('Warum gibt es Grenzen?','Wieso gibt es Grenzen?')>0.45);
});

test('Flow-Vorlage ist schlank, deutsch und enthält keine internen Datenblöcke',async()=>{
  const p=await readFile('youtube/templates/video-template/00-bildprompts/99-alle-bildprompts.txt','utf8');
  assert.match(p,/VERBINDLICHE BILDWELT/i);
  assert.match(p,/ÜBERSCHRIFT:/i);
  assert.match(p,/BILDPROMPT:/i);
  assert.doesNotMatch(p,/CONTENT_POLICY_JSON|RESEARCH_JSON|VOICE_SCRIPT|STYLE-LOCK/);
});

test('Content-Plan V4 enthält Erlebnis- und Informationsplanung',async()=>{
  const c=JSON.parse(await readFile('youtube/templates/video-template/99-tech/CONTENT_PLAN.json','utf8'));
  const r=JSON.parse(await readFile('youtube/templates/video-template/99-tech/RESEARCH.json','utf8'));
  assert.equal(c.contentPolicyVersion,4);
  assert.equal(c.schemaVersion,4);
  assert.ok(Object.hasOwn(c,'formatMode'));
  assert.ok(Object.hasOwn(c,'viewerRole'));
  assert.ok(Array.isArray(c.informationBeats));
  assert.equal(r.status,'DRAFT');
});

test('Flow-Check akzeptiert fertige Einzeldatei',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'stickman-flow-'));
  try{
    await mkdir(path.join(root,'00-bildprompts'),{recursive:true});
    const f=path.join(root,'00-bildprompts','99-alle-bildprompts.txt');
    await writeFile(f,'# ALLE BILDPROMPTS — Test\n\n## VERBINDLICHE BILDWELT FÜR JEDES BILD\nNur deutsche 2D-Comic-Bilder.\n\n## Bild 01 — COVER\nÜBERSCHRIFT: "TEST COVER"\nBILDPROMPT:\nErzeuge eine vollständig illustrierte deutsche 16:9 2D-Comic-Szene mit klarer Stickman-Figur, deutlichen schwarzen Konturen, konkreter Handlung, Umgebung, Komposition und Licht. Die sichtbare Überschrift lautet exakt TEST COVER und erscheint genau einmal groß im oberen Bereich. Kein Fotorealismus, keine Pseudo-Schrift und keine zusätzlichen Texte.\n','utf8');
    const out=await compileFlowPrompt(root);
    assert.equal(out,f);
  }finally{
    await rm(root,{recursive:true,force:true});
  }
});

test('Flow-Check lehnt interne Datenblöcke und Platzhalter ab',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'stickman-flow-bad-'));
  try{
    await mkdir(path.join(root,'00-bildprompts'),{recursive:true});
    await writeFile(path.join(root,'00-bildprompts','99-alle-bildprompts.txt'),'## VERBINDLICHE BILDWELT\n{{VOICE_SCRIPT}}\n## Bild 01\nBILDPROMPT:\n[NOCH AUSFÜLLEN]\n','utf8');
    await assert.rejects(()=>compileFlowPrompt(root));
  }finally{
    await rm(root,{recursive:true,force:true});
  }
});
