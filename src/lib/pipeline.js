import { createHash } from 'node:crypto';
import { access, cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFile, spawnSync } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

export const execFileAsync = promisify(execFile);
export const AUDIO_RE = /\.(mp3|wav|m4a|aac|flac|ogg|opus)$/i;
export const IMAGE_RE = /^Bild (\d{2,3})\.png$/i;
export function isMain(metaUrl){return Boolean(process.argv[1])&&metaUrl===pathToFileURL(process.argv[1]).href;}
export function arg(name,argv=process.argv){const i=argv.indexOf(name);return i>=0?argv[i+1]:undefined;}
export async function exists(filePath){try{await access(filePath);return true;}catch{return false;}}
export async function readJson(filePath,fallback=undefined){if(!(await exists(filePath))){if(fallback!==undefined)return fallback;throw new Error(`JSON-Datei fehlt: ${filePath}`);}return JSON.parse(await readFile(filePath,'utf8'));}
export async function writeJson(filePath,value){await mkdir(path.dirname(filePath),{recursive:true});await writeFile(filePath,`${JSON.stringify(value,null,2)}\n`,'utf8');}
export async function sha256(filePath){return createHash('sha256').update(await readFile(filePath)).digest('hex');}
export function sha256Text(value){return createHash('sha256').update(String(value)).digest('hex');}
export function slugify(input){return String(input??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').replace(/-{2,}/g,'-');}
export function normalizeText(input){return String(input??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');}
export function tokens(input){return normalizeText(input).split(' ').filter(Boolean);}
export function levenshtein(a,b){const left=String(a),right=String(b),prev=Array.from({length:right.length+1},(_,i)=>i);for(let i=1;i<=left.length;i+=1){const next=[i];for(let j=1;j<=right.length;j+=1)next[j]=Math.min(next[j-1]+1,prev[j]+1,prev[j-1]+(left[i-1]===right[j-1]?0:1));prev.splice(0,prev.length,...next);}return prev[right.length];}
export function editSimilarity(a,b){const left=normalizeText(a),right=normalizeText(b);if(!left||!right)return 0;return 1-levenshtein(left,right)/Math.max(left.length,right.length);}
export function jaccardSimilarity(a,b){const left=new Set(tokens(a)),right=new Set(tokens(b));if(!left.size||!right.size)return 0;let intersection=0;for(const token of left)if(right.has(token))intersection+=1;return intersection/new Set([...left,...right]).size;}
export function topicSimilarity(a,b){const j=jaccardSimilarity(a,b);return Math.max(j,0.55*j+0.45*editSimilarity(a,b));}
export function ensureInside(root,candidate){const rootAbs=path.resolve(root),abs=path.resolve(candidate),rel=path.relative(rootAbs,abs);if(rel.startsWith('..')||path.isAbsolute(rel))throw new Error(`Pfad verlässt den erlaubten Ordner: ${candidate}`);return abs;}
export async function copyDirectory(source,destination){await mkdir(destination,{recursive:true});await cp(source,destination,{recursive:true,force:false,errorOnExist:true});}
export async function discoverAudioFiles(audioDir){if(!(await exists(audioDir)))return[];return(await readdir(audioDir,{withFileTypes:true})).filter((e)=>e.isFile()&&AUDIO_RE.test(e.name)).map((e)=>path.join(audioDir,e.name)).sort();}
export async function listFinalImages(imagesDir){if(!(await exists(imagesDir)))return[];return(await readdir(imagesDir,{withFileTypes:true})).filter((e)=>e.isFile()&&IMAGE_RE.test(e.name)).map((e)=>{const m=e.name.match(IMAGE_RE);return{name:e.name,number:Number(m[1]),path:path.join(imagesDir,e.name)};}).sort((a,b)=>a.number-b.number);}
export async function walkFiles(root){if(!(await exists(root)))return[];const out=[];async function visit(dir){for(const e of await readdir(dir,{withFileTypes:true})){const full=path.join(dir,e.name);if(e.isDirectory())await visit(full);else if(e.isFile())out.push(full);}}await visit(root);return out;}
export async function fileSize(filePath){return(await stat(filePath)).size;}
export async function probeDuration(filePath){const{stdout}=await execFileAsync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',filePath]);const value=Number(String(stdout).trim());if(!Number.isFinite(value)||value<=0)throw new Error(`Ungültige Medien-Dauer: ${filePath}`);return Number(value.toFixed(3));}
export async function probeImage(filePath){const{stdout}=await execFileAsync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','json',filePath]);const stream=JSON.parse(stdout).streams?.[0]??{},width=Number(stream.width),height=Number(stream.height);if(!width||!height)throw new Error(`Bilddimensionen nicht lesbar: ${filePath}`);return{width,height,aspectRatio:width/height};}
export async function probeMedia(filePath){const{stdout}=await execFileAsync('ffprobe',['-v','error','-show_entries','format=duration:stream=index,codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels','-of','json',filePath]);return JSON.parse(stdout);}
export function parseFps(value){const[a,b]=String(value??'').split('/').map(Number);return b?a/b:Number(a||0);}
export function commandExists(command,args=['--version']){const r=spawnSync(command,args,{encoding:'utf8'});return!r.error&&r.status===0;}
export function projectPaths(projectDirectory){const projectDir=path.resolve(projectDirectory);return{projectDir,prompt:path.join(projectDir,'00-plan','google-flow-prompt.txt'),script:path.join(projectDir,'01-script','voice-script.txt'),audioDir:path.join(projectDir,'02-audio'),imagesDir:path.join(projectDir,'03-assets','images'),exportDir:path.join(projectDir,'04-export'),techDir:path.join(projectDir,'99-tech'),meta:path.join(projectDir,'99-tech','video.json'),mapping:path.join(projectDir,'99-tech','IMAGE_AUDIO_MAP.json'),renderPlan:path.join(projectDir,'99-tech','RENDER_PLAN.json'),optimizedAudio:path.join(projectDir,'99-tech','YOUTUBE_AUDIO_OPTIMIZED.wav'),audioReport:path.join(projectDir,'99-tech','AUDIO_REPORT.json'),alignmentEvidence:path.join(projectDir,'99-tech','ALIGNMENT_REPORT.json'),timeline:path.join(projectDir,'99-tech','FINAL_TIMELINE.json'),renderProps:path.join(projectDir,'99-tech','RENDER_PROPS.json')};}
