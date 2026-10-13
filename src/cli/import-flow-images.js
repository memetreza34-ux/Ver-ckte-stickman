#!/usr/bin/env node
import { cp, mkdir, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { arg, commandExists, execFileAsync, exists, isMain, listFinalImages, projectPaths, readJson, sha256 } from '../lib/pipeline.js';

const SOURCE_RE=/\.(png|jpe?g|webp)$/i;

async function walkImages(root){
  const out=[];
  async function visit(dir){
    for(const entry of await readdir(dir,{withFileTypes:true})){
      if(entry.name.startsWith('.'))continue;
      const full=path.join(dir,entry.name);
      if(entry.isDirectory())await visit(full);
      else if(entry.isFile()&&SOURCE_RE.test(entry.name)){
        const s=await stat(full);
        out.push({path:full,name:entry.name,relative:path.relative(root,full),mtimeMs:s.mtimeMs});
      }
    }
  }
  await visit(root);
  return out;
}


function numericHint(name){
  // Only a final image/scene number is considered. Dates and unrelated digits in
  // the middle of filenames must not silently become scene indices.
  const match=String(name).match(/(?:^|[_\s-])(?:bild|image|img|scene|shot)?[_\s-]*0*(\d{1,3})(?=\.(?:png|jpe?g|webp)$)/i);
  return match?Number(match[1]):null;
}

function naturalCompare(a,b){return a.localeCompare(b,'de',{numeric:true,sensitivity:'base'});}

export function orderImages(files,mode,expected,manifest=null){
  if(manifest){
    const items=manifest.images;
    if(!Array.isArray(items)||items.length!==expected)throw new Error('FLOW-Mapping: images muss genau die erwartete Bildanzahl enthalten.');
    const byPath=new Map(files.map((f)=>[f.relative,f]));
    const ordered=new Array(expected);
    const consumed=new Set();
    for(const item of items){
      const n=Number(item.imageNumber),relative=String(item.source??'');
      if(!Number.isInteger(n)||n<1||n>expected||ordered[n-1])throw new Error('FLOW-Mapping: doppelte oder ungültige Bildnummer '+n+'.');
      if(!byPath.has(relative)||consumed.has(relative))throw new Error('FLOW-Mapping: Quelldatei fehlt oder ist doppelt: '+relative);
      ordered[n-1]=byPath.get(relative);consumed.add(relative);
    }
    if(ordered.some((item)=>!item)||consumed.size!==files.length)throw new Error('FLOW-Mapping enthält nicht jede Bilddatei genau einmal.');
    return ordered;
  }
  if(mode==='filename')return [...files].sort((a,b)=>naturalCompare(a.relative,b.relative));
  if(mode==='mtime')return [...files].sort((a,b)=>a.mtimeMs-b.mtimeMs||naturalCompare(a.relative,b.relative));
  const hints=files.map((f)=>numericHint(f.name));
  const uniqueHints=new Set(hints);
  if(uniqueHints.size===expected&&hints.every((n)=>Number.isInteger(n)&&n>=1&&n<=expected))
    return [...files].sort((a,b)=>numericHint(a.name)-numericHint(b.name));
  throw new Error('Sichere automatische Reihenfolge nicht möglich. Lege ein geprüftes FLOW-ORDER.json mit images: [{imageNumber: 1, source: "Dateiname.png"}, ...] an und nutze --manifest DATEI. --order filename/mtime nur nach manueller Kontrolle.');
}

async function convertOrCopy(source,target){
  if(/\.png$/i.test(source)){await cp(source,target);return;}
  if(!commandExists('ffmpeg'))throw new Error('ffmpeg fehlt; JPG/WEBP kann nicht sicher in PNG umgewandelt werden.');
  await execFileAsync('ffmpeg',['-y','-v','error','-i',source,'-frames:v','1',target]);
}

export async function importFlowImages(projectDirectory,sourceDirectory,{order='auto',force=false,manifestPath=null}={}){
  const p=projectPaths(projectDirectory),meta=await readJson(p.meta),expected=Number(meta.plannedImageCount);
  if(!Number.isInteger(expected)||expected<1)throw new Error('video.json.plannedImageCount muss vor dem Import gesetzt sein.');
  const source=path.resolve(sourceDirectory);
  if(!(await exists(source)))throw new Error(`Download-Ordner fehlt: ${source}`);
  const files=await walkImages(source);
  if(files.length!==expected)throw new Error(`Sammeldownload enthält ${files.length} Bilder, erwartet werden exakt ${expected}. Nichts wurde importiert.`);
  const manifest=manifestPath?await readJson(path.resolve(manifestPath)):null;
  const ordered=orderImages(files,order,expected,manifest);
  const existing=await listFinalImages(p.imagesDir);
  if(existing.length&&!force)throw new Error(`03-bilder enthält bereits ${existing.length} finale Bilder. Für bewusstes Ersetzen --force verwenden.`);

  const temp=path.join(p.techDir,'.flow-import-temp');
  const backup=path.join(p.techDir,'.flow-import-backup');
  if(await exists(backup))throw new Error('Sicherheitskopie einer früheren Import-Unterbrechung vorhanden: '+backup+'. Vor neuem Import prüfen.');
  if(await exists(temp))throw new Error('Unvollständiger temporärer Import vorhanden: '+temp+'. Vor neuem Import prüfen.');
  await mkdir(temp,{recursive:true});
  const mapping=[];
  try{
    for(let i=0;i<ordered.length;i+=1){
      const targetName=`Bild ${String(i+1).padStart(2,'0')}.png`,tempTarget=path.join(temp,targetName);
      await convertOrCopy(ordered[i].path,tempTarget);
      mapping.push({imageNumber:i+1,source:ordered[i].relative,target:targetName,sha256:await sha256(tempTarget)});
    }
    // Swap whole directories only after ALL files have been copied and hashed.
    // A failed conversion therefore never destroys the previous final image set.
    await mkdir(path.dirname(p.imagesDir),{recursive:true});
    const hadFolder=await exists(p.imagesDir);
    if(hadFolder)await rename(p.imagesDir,backup);
    try{
      await rename(temp,p.imagesDir);
    }catch(error){
      if(hadFolder)await rename(backup,p.imagesDir);
      throw error;
    }
    if(hadFolder)await rm(backup,{recursive:true,force:true});
    const report={schemaVersion:2,importedAt:new Date().toISOString(),sourceDirectory:source,
      ordering:manifest?'verified-manifest':order==='auto'?'contiguous-filename-numbers':'manually-selected-'+order,
      count:mapping.length,mapping};
    await writeFile(path.join(p.techDir,'FLOW_IMPORT_REPORT.json'),`${JSON.stringify(report,null,2)}\n`,'utf8');
    return report;
  }finally{
    await rm(temp,{recursive:true,force:true});
  }
}

async function main(){
  const dir=arg('--dir'),source=arg('--source'),order=arg('--order')??'auto',force=process.argv.includes('--force'),manifestPath=arg('--manifest');
  if(!dir||!source)throw new Error('Nutzung: npm run import:flow-images -- --dir "youtube/..." --source "DOWNLOAD-ORDNER" [--manifest FLOW-ORDER.json] [--order auto|filename|mtime] [--force]');
  if(!['auto','filename','mtime'].includes(order))throw new Error('--order muss auto, filename oder mtime sein.');
  const report=await importFlowImages(dir,source,{order,force,manifestPath});
  console.log(`Flow-Sammeldownload importiert: ${report.count} Bilder.`);
  console.log('Dateien liegen jetzt lückenlos als Bild 01.png ... in 03-bilder/.');
}
if(isMain(import.meta.url))main().catch((e)=>{console.error(`Flow-Bildimport: FEHLER — ${e.message}`);process.exitCode=1;});
