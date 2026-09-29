#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { arg, isMain, projectPaths } from '../lib/pipeline.js';

export async function compileFlowPrompt(projectDirectory){
  const p=projectPaths(projectDirectory),prompt=await readFile(p.prompt,'utf8');
  if(/\{\{[^}]+\}\}/.test(prompt)||/\[[A-ZÄÖÜ0-9 _-]{3,}\]/.test(prompt))throw new Error('Bildprompt-Datei enthält noch Platzhalter.');
  if(!/VERBINDLICHER STYLE-LOCK/i.test(prompt))throw new Error('Verbindlicher Style-Lock fehlt.');
  if(!/^## Bild 01\b/m.test(prompt))throw new Error('Bild 01 fehlt.');
  if(/CONTENT_POLICY_JSON|VISUAL_POLICY_JSON|CONTENT_PLAN_JSON|RESEARCH_JSON|VOICE_SCRIPT|AKTIVE CONTENT-POLICY|AUSGEFÜLLTER CONTENT-PLAN|RECHERCHE-GRUNDLAGE|FINALER VOICE-OVER-TEXT/i.test(prompt))throw new Error('Die Flow-Datei enthält interne Planungsdaten statt nur finaler Bildanweisungen.');
  return p.prompt;
}

async function main(){const dir=arg('--dir');if(!dir)throw new Error('Nutzung: npm run compile:flow -- --dir "youtube/..."');const out=await compileFlowPrompt(dir);console.log(`Google-Flow-Bildprompts bereit: ${out}`);}
if(isMain(import.meta.url))main().catch((e)=>{console.error(`Flow-Check: FEHLER — ${e.message}`);process.exitCode=1;});
