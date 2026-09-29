#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { arg, isMain, projectPaths, readJson } from '../lib/pipeline.js';

export async function compileFlowPrompt(projectDirectory){
  const p=projectPaths(projectDirectory);
  const [template,contentPlan,research,script]=await Promise.all([
    readFile(p.prompt,'utf8'),readJson(p.contentPlan),readJson(p.research),readFile(p.script,'utf8')
  ]);
  const compiled=template
    .replace('{{CONTENT_PLAN_JSON}}',JSON.stringify(contentPlan,null,2))
    .replace('{{RESEARCH_JSON}}',JSON.stringify(research,null,2))
    .replace('{{VOICE_SCRIPT}}',script.trim());
  if(/\{\{(?:CONTENT_PLAN_JSON|RESEARCH_JSON|VOICE_SCRIPT)\}\}/.test(compiled))throw new Error('Flow-Masterprompt enthält noch nicht ersetzte Projekt-Platzhalter.');
  await writeFile(p.flowMasterPrompt,`${compiled.trim()}\n`,'utf8');
  return p.flowMasterPrompt;
}

async function main(){const dir=arg('--dir');if(!dir)throw new Error('Nutzung: npm run compile:flow -- --dir "youtube/..."');const out=await compileFlowPrompt(dir);console.log(`Flow-Masterprompt erstellt: ${out}`);}
if(isMain(import.meta.url))main().catch((e)=>{console.error(`Flow-Compile: FEHLER — ${e.message}`);process.exitCode=1;});
