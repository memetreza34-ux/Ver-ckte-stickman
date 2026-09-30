#!/usr/bin/env node
import { cp, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { arg, commandExists, execFileAsync, exists, isMain, listFinalImages, projectPaths, readJson } from '../lib/pipeline.js';

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
  const nums=[...String(name).matchAll(/(\d+)/g)].map((m)=>Number(m[1]));
  return nums.length?nums[nums.length-1]:null;
}

function naturalCompare(a,b){return a.localeCompare(b,'de',{numeric:true,sensitivity:'base'});}

function orderImages(files,mode){
  if(mode==='filename')return [...files].sort((a,b)=>naturalCompare(a.relative,b.relative));
  if(mode==='mtime')return [...files].sort((a,b)=>a.mtimeMs-b.mtimeMs||naturalCompare(a.relative,b.relative));
  const hints=files.map((f)=>numericHint(f.name));
  const uniqueHints=new Set(hints.filter(Number.isFinite));
  if(hints.every(Number.isFinite)&&uniqueHints.size===files.length)return [...files].sort((a,b)=>numericHint(a.name)-numericHint(b.name)||naturalCompare(a.relative,b.relative));
  const mtimes=new Set(files.map((f)=>f.mtimeMs));
  if(mtimes.size===files.length)return [...files].sort((a,b)=>a.mtimeMs-b.mtimeMs);
  throw new Error('Reihenfolge des Sammeldownloads ist nicht sicher erkennbar. Nutze --order filename oder --order mtime nur, wenn diese Reihenfolge im Download-Ordner wirklich der Flow-Reihenfolge entspricht.');
}

async function convertOrCopy(source,target){
  if(/\.png$/i.test(source)){await cp(source,target);return;}
  if(!commandExists('ffmpeg'))throw new Error('ffmpeg fehlt; JPG/WEBP kann nicht sicher in PNG umgewandelt werden.');
  await execFileAsync('ffmpeg',['-y','-v','error','-i',source,'-frames:v','1',target]);
}

export async function importFlowImages(projectDirectory,sourceDirectory,{order='auto',force=false}={}){
  const p=projectPaths(projectDirectory),meta=await readJson(p.meta),expected=Number(meta.plannedImageCount);
  if(!Number.isInteger(expected)||expected<1)throw new Error('video.json.plannedImageCount muss vor dem Import gesetzt sein.');
  const source=path.resolve(sourceDirectory);
  if(!(await exists(source)))throw new Error(`Download-Ordner fehlt: ${source}`);
  const files=await walkImages(source);
  if(files.length!==expected)throw new Error(`Sammeldownload enthält ${files.length} Bilder, erwartet werden exakt ${expected}. Nichts wurde importiert.`);
  const ordered=orderImages(files,order);
  const existing=await listFinalImages(p.imagesDir);
  if(existing.length&&!force)throw new Error(`03-bilder enthält bereits ${existing.length} finale Bilder. Für bewusstes Ersetzen --force verwenden.`);

  const temp=path.join(p.techDir,'.flow-import-temp');
  await rm(temp,{recursive:true,force:true});await mkdir(temp,{recursive:true});
  const mapping=[];
  try{
    for(let i=0;i<ordered.length;i+=1){
      const targetName=`Bild ${String(i+1).padStart(2,'0')}.png`,tempTarget=path.join(temp,targetName);
      await convertOrCopy(ordered[i].path,tempTarget);
      mapping.push({imageNumber:i+1,source:ordered[i].relative,target:targetName});
    }
    await mkdir(p.imagesDir,{recursive:true});
    if(force)for(const image of existing)await rm(image.path,{force:true});
    for(const item of mapping)await cp(path.join(temp,item.target),path.join(p.imagesDir,item.target));
    const report={schemaVersion:1,importedAt:new Date().toISOString(),sourceDirectory:source,ordering:order==='auto'?'auto-sicher-erkannt':order,count:mapping.length,mapping};
    await writeFile(path.join(p.techDir,'FLOW_IMPORT_REPORT.json'),`${JSON.stringify(report,null,2)}\n`,'utf8');
    return report;
  }finally{await rm(temp,{recursive:true,force:true});}
}

async function main(){
  const dir=arg('--dir'),source=arg('--source'),order=arg('--order')??'auto',force=process.argv.includes('--force');
  if(!dir||!source)throw new Error('Nutzung: npm run import:flow-images -- --dir "youtube/..." --source "DOWNLOAD-ORDNER" [--order auto|filename|mtime] [--force]');
  if(!['auto','filename','mtime'].includes(order))throw new Error('--order muss auto, filename oder mtime sein.');
  const report=await importFlowImages(dir,source,{order,force});
  console.log(`Flow-Sammeldownload importiert: ${report.count} Bilder.`);
  console.log('Dateien liegen jetzt lückenlos als Bild 01.png ... in 03-bilder/.');
}
if(isMain(import.meta.url))main().catch((e)=>{console.error(`Flow-Bildimport: FEHLER — ${e.message}`);process.exitCode=1;});
