#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { arg, fileSize, isMain, listFinalImages, projectPaths, readJson, sha256, sha256Text, writeJson } from '../lib/pipeline.js';

const validStatuses=new Set(['pending','approved','rejected']);
const escapeHtml=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reviewFile=(p)=>path.join(p.techDir,'IMAGE_REVIEW.json');

export function validateImageReview(saved,images){
  const errors=[];
  const approved=[];
  const rows=Array.isArray(saved?.images)?saved.images:[];
  if(rows.length!==images.length)errors.push('Review hat nicht genau die erwartete Bildzahl.');
  const byNumber=new Map();
  for(const row of rows){
    if(!Number.isInteger(row.imageNumber)||byNumber.has(row.imageNumber))errors.push('Doppelte oder ungültige Bildnummer im Review.');
    byNumber.set(row.imageNumber,row);
  }
  for(const image of images){
    const entry=byNumber.get(image.imageNumber);
    if(!entry||entry.sha256!==image.sha256)errors.push('Review fehlt oder Bild wurde seit der Freigabe ersetzt: Bild '+image.imageNumber);
    else if(image.briefSha256&&entry.briefSha256!==image.briefSha256)errors.push('Bildbriefing hat sich seit der Freigabe geändert: Bild '+image.imageNumber);
    else if(!validStatuses.has(entry.status))errors.push('Ungültiger Review-Status bei Bild '+image.imageNumber);
    else if(entry.status==='approved')approved.push(image.imageNumber);
  }
  return{passed:errors.length===0,errors,approvedCount:approved.length,totalImages:images.length,complete:errors.length===0&&approved.length===images.length};
}

function htmlDocument(videoId,items){
  const cards=items.map(x=>{
    const file='../03-bilder/'+encodeURIComponent('Bild '+String(x.imageNumber).padStart(2,'0')+'.png');
    return '<article class="card"><div class="photo"><img src="'+file+'" loading="lazy" alt="Bild '+x.imageNumber+'"></div>'
      +'<div class="body"><h2>Bild '+String(x.imageNumber).padStart(2,'0')+'</h2>'
      +'<p class="anchor">'+escapeHtml(x.startAnchor)+'</p>'
      +'<p><b>Bildtyp: '+escapeHtml(x.visualType||'Szenenbild')+'</b></p>'
      +'<p><b>Das Bild muss erklären:</b> '+escapeHtml(x.visualPurpose)+'</p>'
      +(x.visibleLabels?.length?'<p><b>Zu kontrollierende Beschriftungen:</b> '+escapeHtml(x.visibleLabels.join(' · '))+'</p>':'')
      +'<label>Bildprüfung <select data-review data-number="'+x.imageNumber+'" data-sha="'+x.sha256+'" data-brief="'+x.briefSha256+'">'
      +['pending','approved','rejected'].map(v=>'<option value="'+v+'"'+(v===x.status?' selected':'')+'>'+({pending:'Noch prüfen',approved:'Freigeben',rejected:'Neu erzeugen'}[v])+'</option>').join('')
      +'</select></label><label>Notiz <input data-note="'+x.imageNumber+'" value="'+escapeHtml(x.comment??'')+'" placeholder="Optionaler Fehlerhinweis"></label></div></article>';
  }).join('\n');
  return '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    +'<title>Bildkontrolle – '+escapeHtml(videoId)+'</title>'
    +'<style>body{font:16px system-ui,sans-serif;background:#12151b;color:#e5e7eb;margin:0}header{position:sticky;top:0;background:#161b23;padding:14px 24px;z-index:2;display:flex;gap:18px;flex-wrap:wrap;align-items:center;border-bottom:1px solid #36404b}button{background:#70ded0;border:0;border-radius:6px;padding:10px 14px;cursor:pointer;font-weight:700}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:18px;padding:20px}.card{background:#202630;border:1px solid #374151;border-radius:12px;overflow:hidden}.photo{aspect-ratio:16/9;background:#07090c}.photo img{width:100%;height:100%;object-fit:contain}.body{padding:14px}.body h2{margin:0 0 8px;font-size:18px}.body p{font-size:13px;line-height:1.5;color:#cbd5e1}.body .anchor{font-weight:700;color:#fff}label{display:block;margin:12px 0 0;font-size:13px}select,input{box-sizing:border-box;margin-top:5px;background:#0d1118;color:#fff;border:1px solid #4b5563;border-radius:6px;padding:8px;width:100%}small{color:#9ca3af}</style></head><body>'
    +'<header><strong>Bildkontrolle: '+escapeHtml(videoId)+'</strong><small>Jede Szene gegen Skriptanker und Kernaussage prüfen: Bildtyp, Aussage, korrekte Struktur, lesbare Labels und einheitlichen Illustrationsstil. Bei Figuren zusätzlich Stickman-Anatomie prüfen.</small><button id="download">Prüfbericht als JSON speichern</button></header>'
    +'<main>'+cards+'</main>'
    +'<script>document.getElementById("download").addEventListener("click",function(){const images=Array.from(document.querySelectorAll("select[data-review]")).map(el=>({imageNumber:Number(el.dataset.number),sha256:el.dataset.sha,briefSha256:el.dataset.brief,status:el.value,comment:document.querySelector("input[data-note=\\""+el.dataset.number+"\\"]").value}));const data={schemaVersion:1,videoId:'+JSON.stringify(videoId)+',images};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="IMAGE_REVIEW_APPROVED.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});</script>'
    +'</body></html>';
}

export async function createImageReview(projectDirectory){
  const p=projectPaths(projectDirectory),[meta,mapping,files,old]=await Promise.all([
    readJson(p.meta),readJson(p.mapping),listFinalImages(p.imagesDir),readJson(reviewFile(p),{images:[]})
  ]);
  const expected=Number(meta.plannedImageCount);
  if(!Number.isInteger(expected)||files.length!==expected)throw new Error('Bildreview benötigt alle erwarteten Bilddateien. Erwartet: '+expected+'; gefunden: '+files.length+'.');
  const byImage=new Map((mapping.images??[]).map(x=>[x.imageNumber,x]));
  const prior=new Map((old.images??[]).map(x=>[x.imageNumber,x]));
  const items=[];
  for(let number=1;number<=expected;number++){
    const image=files.find(x=>x.number===number),scene=byImage.get(number);
    if(!image||!scene)throw new Error('Bild oder Szenen-Mapping fehlt: '+number);
    if((await fileSize(image.path))===0)throw new Error('Leere Bilddatei: '+image.name);
    const hash=await sha256(image.path),previous=prior.get(number);
    const brief={startAnchor:String(scene.startAnchor??''),visualPurpose:String(scene.visualPurpose??''),
      visualType:String(scene.visualType??''),visibleLabels:scene.visibleLabels??[]};
    const briefSha256=sha256Text(JSON.stringify(brief));
    const keep=previous?.sha256===hash&&previous?.briefSha256===briefSha256&&validStatuses.has(previous.status);
    items.push({imageNumber:number,sha256:hash,...brief,briefSha256,
      status:keep?previous.status:'pending',comment:keep?String(previous.comment??''):''});
  }
  const review={schemaVersion:1,videoId:meta.videoId,images:items};
  await writeJson(reviewFile(p),review);
  await writeFile(path.join(p.techDir,'IMAGE_REVIEW.html'),htmlDocument(meta.videoId,items),'utf8');
  return{...validateImageReview(review,items),html:path.join(p.techDir,'IMAGE_REVIEW.html'),report:reviewFile(p)};
}

export async function applyImageReview(projectDirectory,file){
  const p=projectPaths(projectDirectory);
  // Recompute hashes at approval time: a picture may have been replaced since the HTML report was created.
  await createImageReview(projectDirectory);
  const current=await readJson(reviewFile(p));
  const submitted=await readJson(path.resolve(file));
  if(current.videoId!==submitted.videoId)throw new Error('Review stammt von einem anderen Videoprojekt.');
  const result=validateImageReview(submitted,current.images);
  if(!result.passed)throw new Error(result.errors.join(' | '));
  await writeJson(reviewFile(p),{schemaVersion:1,videoId:current.videoId,images:submitted.images});
  return result;
}

async function main(){
  const dir=arg('--dir');
  if(!dir)throw new Error('Nutzung: npm run review:images -- --dir "youtube/..." [--apply IMAGE_REVIEW_APPROVED.json]');
  const submitted=arg('--apply');
  const report=submitted?await applyImageReview(dir,submitted):await createImageReview(dir);
  console.log('Bildreview: '+report.approvedCount+'/'+report.totalImages+' manuell freigegeben.');
  if(report.html)console.log('Sichtprüfung öffnen: '+report.html);
  if(!report.complete)console.log('Nicht vollständig visuell freigegeben. Prüfe die Bilder, lade JSON aus der HTML-Seite herunter und importiere es mit --apply.');
}
if(isMain(import.meta.url))main().catch(e=>{console.error('Bildreview: FEHLER — '+e.message);process.exitCode=1;});
