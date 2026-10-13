import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { hasCompleteAlignment } from '../src/cli/auto-align.js';
import { hasMeasuredImageStarts } from '../src/cli/build-timeline.js';
import { materializeScenePlan } from '../src/lib/materialize-scene-plan.js';
import { orderImages, importFlowImages } from '../src/cli/import-flow-images.js';

const fake = (name, time = 0) => ({ name, relative: name, mtimeMs: time, path: '/irrelevant/' + name });

test('Alignment cache rejects missing, non-monotonic, or stale timestamps', () => {
  const good = [
    {actualStartSeconds:0,actualEndSeconds:1.5},
    {actualStartSeconds:1.5,actualEndSeconds:4.0}
  ];
  assert.equal(hasCompleteAlignment(good),true);
  assert.equal(hasCompleteAlignment([{...good[0],actualEndSeconds:null},good[1]]),false);
  assert.equal(hasCompleteAlignment([{...good[0],actualStartSeconds:null},good[1]]),false);
  assert.equal(hasCompleteAlignment([good[0],{...good[1],actualStartSeconds:0}]),false);
  assert.equal(hasMeasuredImageStarts(good),true);
  assert.equal(hasMeasuredImageStarts([{actualStartSeconds:null}]),false);
  assert.equal(hasMeasuredImageStarts([{actualStartSeconds:'0'}]),false);
});

test('Flow automatic ordering only trusts complete contiguous filename numbering', () => {
  const input=[fake('Bild 03.png'),fake('Bild 01.png'),fake('Bild 02.png')];
  assert.deepEqual(orderImages(input,'auto',3).map(x=>x.name),['Bild 01.png','Bild 02.png','Bild 03.png']);
  assert.throws(()=>orderImages([fake('Flow_20261013.png'),fake('random.png')],'auto',2),/Sichere automatische Reihenfolge/);
  assert.throws(()=>orderImages([fake('Bild 01.png'),fake('Bild 03.png')],'auto',2),/Sichere automatische Reihenfolge/);
});

test('Flow manifest fixes exact scene ordering and rejects incomplete or reused sources', () => {
  const input=[fake('a.png'),fake('b.png')];
  const manifest={images:[{imageNumber:2,source:'a.png'},{imageNumber:1,source:'b.png'}]};
  assert.deepEqual(orderImages(input,'auto',2,manifest).map(x=>x.name),['b.png','a.png']);
  assert.throws(()=>orderImages(input,'auto',2,{images:[{imageNumber:1,source:'a.png'},{imageNumber:2,source:'a.png'}]}),/doppelt/);
  assert.throws(()=>orderImages(input,'auto',2,{images:[{imageNumber:1,source:'a.png'}]}),/erwartete Bildanzahl/);
});

test('Flow import swaps images only after successful conversion and keeps source mapping', async()=>{
  const tmp=await mkdtemp(path.join(os.tmpdir(),'stickman-import-'));
  try{
    const dir=path.join(tmp,'video'),source=path.join(tmp,'downloads'),tech=path.join(dir,'99-tech'),images=path.join(dir,'03-bilder');
    await mkdir(tech,{recursive:true});await mkdir(source,{recursive:true});await mkdir(images,{recursive:true});
    await writeFile(path.join(tech,'video.json'),JSON.stringify({plannedImageCount:2}));
    await writeFile(path.join(images,'Bild 01.png'),'original');
    await writeFile(path.join(source,'one.png'),'scene one');
    await writeFile(path.join(source,'two.png'),'scene two');
    const manifest=path.join(tmp,'FLOW-ORDER.json');
    await writeFile(manifest,JSON.stringify({images:[{imageNumber:1,source:'two.png'},{imageNumber:2,source:'one.png'}]}));
    const report=await importFlowImages(dir,source,{force:true,manifestPath:manifest});
    assert.equal(report.ordering,'verified-manifest');
    assert.equal((await readFile(path.join(images,'Bild 01.png'),'utf8')),'scene two');
    assert.equal((await readFile(path.join(images,'Bild 02.png'),'utf8')),'scene one');
    assert.equal(report.mapping[0].source,'two.png');
    assert.equal(report.mapping[0].sha256.length,64);
    assert.equal((await readFile(path.join(tech,'FLOW_IMPORT_REPORT.json'),'utf8')).includes('verified-manifest'),true);
    const failed=path.join(tmp,'incorrect.json');
    await writeFile(failed,JSON.stringify({images:[{imageNumber:1,source:'missing.png'},{imageNumber:2,source:'one.png'}]}));
    await assert.rejects(()=>importFlowImages(dir,source,{force:true,manifestPath:failed}),/Quelldatei fehlt/);
    assert.equal((await readFile(path.join(images,'Bild 01.png'),'utf8')),'scene two');
  }finally{await rm(tmp,{recursive:true,force:true});}
});

test('Scene rematerialization preserves matching measured anchors but invalidates changed ones',async()=>{
  const tmp=await mkdtemp(path.join(os.tmpdir(),'stickman-scene-'));
  try{
    const tech=path.join(tmp,'99-tech'),script=path.join(tmp,'01-script');
    await mkdir(tech,{recursive:true});await mkdir(script,{recursive:true});
    await writeFile(path.join(tech,'video.json'),JSON.stringify({plannedImageCount:2,targetDurationSeconds:10,title:'Beispiel'}));
    await writeFile(path.join(tech,'CONTENT_PLAN.json'),JSON.stringify({titleCoverSystem:{finalTitle:'Beispiel',coverConcept:{visibleText:'BEISPIEL'}}}));
    await writeFile(path.join(script,'voice-script.txt'),'Hallo die Welt. Und dann weiter zu einer anderen Szene.');
    const scenePlan={
      world:'Wiederkehrender Strichmann mit rundem Kopf, einfachen Linienarmen und klarer Bildhandlung vor einer farbigen, lebendigen, gut lesbaren Stadtkulisse.',
      coverVisual:'Ein neugieriger Stickman öffnet eine Tür.',
      scenes:[{anchor:'Hallo die Welt',visual:'Tür und Figur'},{anchor:'Und dann weiter',visual:'Figur auf der Straße'}]
    };
    const sceneFile=path.join(tech,'SCENE_PLAN.json'),mappingFile=path.join(tech,'IMAGE_AUDIO_MAP.json');
    await writeFile(sceneFile,JSON.stringify(scenePlan));
    await materializeScenePlan(tmp);
    const mapped=JSON.parse(await readFile(mappingFile,'utf8'));
    mapped.images[0].actualStartSeconds=0;mapped.images[0].actualEndSeconds=4;mapped.images[0].alignmentConfidence=.97;
    mapped.images[1].actualStartSeconds=4;mapped.images[1].actualEndSeconds=10;mapped.images[1].alignmentConfidence=.95;
    await writeFile(mappingFile,JSON.stringify(mapped));
    await materializeScenePlan(tmp);
    const again=JSON.parse(await readFile(mappingFile,'utf8'));
    assert.equal(again.images[0].actualStartSeconds,0);
    assert.equal(again.images[1].actualStartSeconds,4);
    scenePlan.scenes[1].anchor='dann weiter';
    await writeFile(sceneFile,JSON.stringify(scenePlan));
    await materializeScenePlan(tmp);
    const changed=JSON.parse(await readFile(mappingFile,'utf8'));
    assert.equal(changed.images[0].actualStartSeconds,0);
    assert.equal(changed.images[1].actualStartSeconds,null);
  }finally{await rm(tmp,{recursive:true,force:true});}
});
