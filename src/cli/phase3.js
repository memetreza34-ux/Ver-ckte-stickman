#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { arg, isMain } from '../lib/pipeline.js';

function run(script,args=[]){console.log(`\n=== ${script} ===`);const r=spawnSync(process.execPath,[script,...args],{stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)throw new Error(`${script} fehlgeschlagen (Exit ${r.status}).`);}
async function main(){const dir=arg('--dir');if(!dir)throw new Error('Nutzung: npm run phase3 -- --dir "youtube/..." [--prepare-only] [--model small]');const common=['--dir',dir],model=arg('--model')??'small';run('src/cli/validate-phase1-v4.js',common);run('src/cli/validate-assets.js',common);run('src/cli/optimize-audio.js',common);run('src/cli/auto-align.js',[...common,'--model',model]);run('src/cli/build-timeline.js',common);run('src/cli/validate-timeline.js',common);if(process.argv.includes('--prepare-only')){console.log('\nPhase 3 vorbereitet.');return;}run('src/cli/render.js',common);run('src/cli/finalize.js',common);console.log('\nPhase 3: BESTANDEN');}
if(isMain(import.meta.url))main().catch((e)=>{console.error(`Phase 3: FEHLER — ${e.message}`);process.exitCode=1;});
