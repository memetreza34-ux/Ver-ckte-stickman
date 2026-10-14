import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { compileFlowPrompt } from '../src/cli/compile-flow-prompt.js';
import { auditEditorialVisuals, validateEditorialScenes } from '../src/lib/stickman-style.js';

const world='Handgezeichneter 2D-Editorial-Comic über organisierte Kriminalität mit Tuschekonturen, Cremepapier, dunklem Petrol, Ocker und Bordeauxrot. Alle Illustrationen und Datenbilder behalten dieselbe grafische Sprache und eine klare visuelle Hierarchie.';
const scenes=[
  {
    anchor:'Bei der Mafia steht oben ein Boss.',
    message:'Der Boss steht an der Spitze einer definierten Mafia-Hierarchie.',
    visualType:'hierarchie',
    visual:'Eine klar abgestufte Rangpyramide ragt über einem dunkelpetrolfarbenen Bildhintergrund auf. Die Spitze ist rot beleuchtet und die Unterebenen sind mit sauberen Zwischenlinien getrennt.',
    elements:['Beleuchtete rote Pyramidenspitze','Drei sauber getrennte Ebenen unterhalb'],
    labels:[]
  },
  {
    anchor:'Ein Außenstehender gehört nicht automatisch dazu.',
    message:'Ein Außenstehender unterscheidet sich klar von aufgenommenen Mitgliedern.',
    visualType:'vergleich',
    visual:'Ein starker Split-Screen stellt links Kontakte in einem äußeren ockerfarbenen Ring und rechts Mitglieder innerhalb eines geschlossenen roten Kreises gegenüber.',
    elements:['Linker Außenring in Ocker','Rechter Innenring in Bordeauxrot'],
    labels:['Außenstehende','Mitglieder']
  },
  {
    anchor:'Darunter teilen sich die Funktionen.',
    message:'Verschiedene Rollen haben unterschiedliche Weisungs- und Beratungswege.',
    visualType:'organigramm',
    visual:'Eine anschauliche Rollengrafik stellt die Weisungskette als gerade Linien dar und die beratende Verbindung seitlich als andere Linie. Keine falsche Unterordnung.',
    elements:['Senkrechte Verbindung mit Kommandopfeilen','Seitliche gestrichelte Beratungslinie'],
    labels:['Boss','Underboss','Consigliere','Capo']
  },
  {
    anchor:'Ein Bote bringt die Nachricht.',
    message:'Ein Kontakt übergibt eine Nachricht an einen Ansprechpartner.',
    visualType:'szene',
    visual:'Ein wiedererkennbarer grün bekappter Strichmann mit schlanker Linienfigur überreicht einen versiegelten Umschlag im beleuchteten Café an einen rot bekappten Ansprechpartner.',
    elements:['Grün bekappter Bote mit Umschlag','Roter Ansprechpartner am Cafétisch'],
    labels:[]
  },
  {
    anchor:'Der Ort ist New York.',
    message:'Die historische Einordnung betrifft New York in den Vereinigten Staaten.',
    visualType:'karte',
    visual:'Eine illustrierte korrekt gezeichnete USA-Karte zeigt die Ostküste und den geografisch passenden Fokus auf New York mit zwei lesbaren Bezeichnungen.',
    elements:['Geografisch korrekter USA-Umriss','New-York-Markierung an der Ostküste'],
    labels:['USA','New York']
  }
];
const script=scenes.map(s=>s.anchor).join(' ')+' Danach geht es weiter.';

test('Redaktionelle V9-Szenen sind valide und brauchen keine Figurenquote',()=>{
  assert.equal(validateEditorialScenes(scenes).passed,true);
  assert.equal(validateEditorialScenes(scenes.map((s,i)=>i===1?{...s,visualType:'unbekannt'}:s)).passed,false);
  assert.equal(validateEditorialScenes(scenes.map((s,i)=>i===2?{...s,labels:[]}:s)).passed,false);
  assert.equal(validateEditorialScenes(scenes.map((s,i)=>i===3?{...s,message:'vage'}:s)).passed,false);
  assert.equal(validateEditorialScenes(scenes.map((s,i)=>i===4?{...s,visual:scenes[3].visual}:s)).passed,true); // Eine gleiche Bildwelt allein kein Dopplungsfehler, anderer Bildtyp.
});

test('Google Flow V9 erzeugt spezifische Hierarchie-, Vergleichs- und Kartenbilder mit deutschen Labels',async()=>{
  const tmp=await mkdtemp(path.join(os.tmpdir(),'stickman-editorial-v9-'));
  try{
    const tech=path.join(tmp,'99-tech'),scriptDir=path.join(tmp,'01-script');
    await mkdir(tech,{recursive:true});await mkdir(scriptDir,{recursive:true});
    await writeFile(path.join(tech,'video.json'),JSON.stringify({
      videoId:'test-editorial-v9',visualPolicyVersion:9,plannedImageCount:scenes.length,targetDurationSeconds:18,title:'Rangfolge erklärt'
    }));
    await writeFile(path.join(tech,'CONTENT_PLAN.json'),JSON.stringify({
      titleCoverSystem:{finalTitle:'Rangfolge erklärt',coverConcept:{visibleText:'WER REGIERT'}}
    }));
    await writeFile(path.join(scriptDir,'voice-script.txt'),script);
    await writeFile(path.join(tech,'SCENE_PLAN.json'),JSON.stringify({
      world,coverVisual:'Rangpyramide mit rot beleuchteter Spitze.',scenes
    }));
    await compileFlowPrompt(tmp);
    const prompt=await readFile(path.join(tmp,'00-bildprompts','99-alle-bildprompts.txt'),'utf8');
    assert.match(prompt,/BILDTYP: hierarchie/);
    assert.match(prompt,/BILDTYP: organigramm/);
    assert.match(prompt,/BILDTYP: karte/);
    assert.match(prompt,/„Außenstehende“, „Mitglieder“/);
    assert.match(prompt,/„USA“, „New York“/);
    assert.match(prompt,/WER REGIERT/);
    assert.equal((prompt.match(/STICKMAN-ANATOMIE:/g)??[]).length,1);
    assert.doesNotMatch(prompt,/KEINE BILDSCHRIFT/);
    const map=JSON.parse(await readFile(path.join(tech,'IMAGE_AUDIO_MAP.json'),'utf8'));
    assert.equal(map.images[1].visualType,'vergleich');
    assert.equal(map.images[1].visualPurpose,scenes[1].message);
    assert.deepEqual(map.images[2].visibleLabels,['Boss','Underboss','Consigliere','Capo']);
    const batchDir=path.join(tmp,'00-bildprompts','5er-batches');
    const filenames=(await readdir(batchDir)).sort();
    assert.deepEqual(filenames,['01-bilder-01-05.txt','BATCH_MANIFEST.json']);
    const block=await readFile(path.join(batchDir,'01-bilder-01-05.txt'),'utf8');
    assert.match(block,/V9-BILDPRÜFUNG/);
    assert.doesNotMatch(block,/Nur Cover hat deutsche Überschrift/);
    const blocks=prompt.split(/\n(?=## Bild \d{2,3}\b)/).filter(x=>/^## Bild \d{2,3}/.test(x));
    assert.equal(auditEditorialVisuals(blocks).passed,true);
    assert.equal(auditEditorialVisuals(blocks.map((b,i)=>i===2?b.replace('KERNAUSSAGE:','FEHLT:'):b)).passed,false);
  }finally{await rm(tmp,{recursive:true,force:true});}
});

test('V9 sperrt fehlende echte Bildidee und unpräzise Diagrammlabels vor Flow',async()=>{
  const base={...scenes[2],elements:['nur']};
  assert.equal(validateEditorialScenes([base]).passed,false);
  assert.equal(validateEditorialScenes([{...scenes[2],labels:['Unterboss mit vielen seltsamen zusätzlichen Wörtern','Boss']}]).passed,false);
});
