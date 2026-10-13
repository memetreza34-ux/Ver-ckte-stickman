#!/usr/bin/env node
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { arg, isMain, projectPaths, readJson } from '../lib/pipeline.js';
import { materializeScenePlan } from '../lib/materialize-scene-plan.js';
import { STICKMAN_POLICY_VERSION, VISUAL_POLICY_V8, auditStickmanPrompts, auditLivelyGermanVisuals } from '../lib/stickman-style.js';

function imageBlocks(prompt){
  return prompt.split(/\n(?=## Bild \d{2,3}\b)/i).filter((x)=>/^## Bild \d{2,3}\b/i.test(x.trim()));
}

function imageNumber(block){
  return Number(block.match(/^## Bild (\d{2,3})\b/i)?.[1]);
}

export async function compileFlowPrompt(projectDirectory){
  await materializeScenePlan(projectDirectory);
  const p=projectPaths(projectDirectory),prompt=await readFile(p.prompt,'utf8');
  if(/\{\{[^}]+\}\}/.test(prompt)||/\[[A-ZÄÖÜ0-9 _-]{3,}\]/.test(prompt))throw new Error('Bildprompt-Datei enthält noch Platzhalter.');
  if(!/VERBINDLICHE BILDWELT/i.test(prompt))throw new Error('Verbindliche Bildwelt fehlt.');
  if(!/^## Bild 01\b/m.test(prompt))throw new Error('Bild 01 fehlt.');
  if(/CONTENT_POLICY_JSON|VISUAL_POLICY_JSON|CONTENT_PLAN_JSON|RESEARCH_JSON|VOICE_SCRIPT|AKTIVE CONTENT-POLICY|AUSGEFÜLLTER CONTENT-PLAN|RECHERCHE-GRUNDLAGE|FINALER VOICE-OVER-TEXT/i.test(prompt))throw new Error('Die Flow-Datei enthält interne Planungsdaten statt nur finaler Bildanweisungen.');

  const blocks=imageBlocks(prompt);
  if(!blocks.length)throw new Error('Keine Bildblöcke gefunden.');
  blocks.forEach((block,i)=>{if(imageNumber(block)!==i+1)throw new Error(`Bildblöcke sind nicht lückenlos: erwartet Bild ${String(i+1).padStart(2,'0')}.`);});
  const meta=await readJson(p.meta,{});
  if(Number(meta.visualPolicyVersion)>=STICKMAN_POLICY_VERSION){
    const styleCheck=auditStickmanPrompts(blocks);
    if(!styleCheck.passed)throw new Error('Stickman-Stilprüfung nicht bestanden: '+styleCheck.errors.slice(0,8).join(' | '));
  }

  if(Number(meta.visualPolicyVersion)>=VISUAL_POLICY_V8){
    const v8Check=auditLivelyGermanVisuals(blocks);
    if(!v8Check.passed)throw new Error('Bildwelt V8 nicht bestanden: '+v8Check.errors.slice(0,8).join(' | '));
  }

  const policy=await readJson(path.resolve('config/pipeline.json'));
  const batchSize=Number(policy.flowProductionPolicy?.batchSize??5);
  if(batchSize!==5)throw new Error('Flow-Batchgröße muss laut Kanalstandard exakt 5 sein.');

  const firstIndex=prompt.search(/^## Bild 01\b/m);
  const globalPart=prompt.slice(0,firstIndex).trimEnd().replace(/^Google-Flow-Regel:.*$/mi,'Google-Flow-Regel: Bilder werden verbindlich in 5er-Blöcken erzeugt. Während der Generierung nichts einzeln herunterladen oder manuell umbenennen. Erst nach Abschluss aller Blöcke einmal gesammelt herunterladen und automatisch importieren.');
  const batchDir=path.join(path.dirname(p.prompt),'5er-batches');
  await rm(batchDir,{recursive:true,force:true});
  await mkdir(batchDir,{recursive:true});

  const manifest={schemaVersion:1,batchSize,totalImages:blocks.length,batches:[]};
  for(let start=0,batchIndex=1;start<blocks.length;start+=batchSize,batchIndex+=1){
    const group=blocks.slice(start,start+batchSize),from=imageNumber(group[0]),to=imageNumber(group[group.length-1]);
    const fileName=`${String(batchIndex).padStart(2,'0')}-bilder-${String(from).padStart(2,'0')}-${String(to).padStart(2,'0')}.txt`;
    const header=[
      globalPart,
      '',
      '## VERBINDLICHER 5ER-PRODUKTIONSBLOCK',
      `Erzeuge in diesem Durchgang ausschließlich Bild ${String(from).padStart(2,'0')} bis Bild ${String(to).padStart(2,'0')}.`,
      group.length===5?'Dieser Block enthält exakt fünf Bilder. Alle fünf Bilder vollständig erzeugen, bevor der nächste Block begonnen wird.':`Dies ist der letzte Block und enthält ${group.length} Bilder.`,
      'STILKONTROLLE: Figuren mit rundem Kopf, Stricharmen/-beinen, großem Ausdruck, dynamischer Pose und einheitlichen Accessoires. Ab Bild 02 keinerlei Schrift im Bild; nur Cover hat deutsche Überschrift. Keine Organigramm-Folien. Falsche Bilder erneut erzeugen.',
      'Die Ergebnisse während der Produktion NICHT einzeln herunterladen und NICHT manuell umbenennen.',
      'Erst wenn alle Blöcke des Videos fertig sind, alle erzeugten Bilder einmal gesammelt herunterladen.',
      'Danach die Bilder mit `npm run import:flow-images -- --dir "youtube/..." --source "DOWNLOAD-ORDNER"` automatisch nach `Bild NN.png` importieren.',
      ''
    ].join('\n');
    await writeFile(path.join(batchDir,fileName),`${header}${group.join('\n\n')}\n`,'utf8');
    manifest.batches.push({batch:batchIndex,from,to,count:group.length,file:fileName});
  }
  await writeFile(path.join(batchDir,'BATCH_MANIFEST.json'),`${JSON.stringify(manifest,null,2)}\n`,'utf8');
  return p.prompt;
}

async function main(){
  const dir=arg('--dir');
  if(!dir)throw new Error('Nutzung: npm run compile:flow -- --dir "youtube/..."');
  const out=await compileFlowPrompt(dir);
  console.log(`Google-Flow-Masterdatei geprüft: ${out}`);
  console.log(`5er-Batches erzeugt: ${path.join(path.dirname(out),'5er-batches')}`);
}
if(isMain(import.meta.url))main().catch((e)=>{console.error(`Flow-Check: FEHLER — ${e.message}`);process.exitCode=1;});
