#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { arg, isMain, normalizeText, readJson, topicSimilarity, walkFiles } from '../lib/pipeline.js';

export async function collectKnownTopics(root=process.cwd()){
  const registry=await readJson(path.join(root,'config','topic-registry.json'),{entries:[]});
  const known=(registry.entries??[]).map((e)=>({source:'registry',title:e.title??'',aliases:e.aliases??[]}));
  const youtubeRoot=path.join(root,'youtube');
  for(const file of await walkFiles(youtubeRoot)){
    if(!file.endsWith(path.join('99-tech','video.json'))||file.includes(`${path.sep}templates${path.sep}`))continue;
    try{const meta=JSON.parse(await readFile(file,'utf8'));if(meta.topic||meta.title)known.push({source:file,title:meta.topic||meta.title,aliases:[meta.title].filter(Boolean)});}catch{}
  }
  return known;
}

export async function evaluateChannelFit(candidate,root=process.cwd()){
  const policy=await readJson(path.join(root,'config','content-policy.json'));
  const niche=policy.nicheFitPolicy??{},text=normalizeText(candidate);
  const positive=(niche.positiveSignals??[]).filter((signal)=>text.includes(normalizeText(signal)));
  const out=(niche.obviousOutOfScopeSignals??[]).filter((signal)=>text.includes(normalizeText(signal)));
  if(out.length)return{decision:'BLOCKED_CHANNEL_FIT',score:2,positiveSignals:positive,outOfScopeSignals:out,reason:'Thema wirkt offensichtlich außerhalb der Kanal-DNA.'};
  if(positive.length)return{decision:'APPROVED_CHANNEL_FIT',score:8,positiveSignals:positive,outOfScopeSignals:[],reason:'Thema enthält klare Signale der Kanal-DNA.'};
  return{decision:'REVIEW_CHANNEL_FIT',score:6,positiveSignals:[],outOfScopeSignals:[],reason:'Kanalfit ist aus dem Titel allein nicht sicher; CONTENT_PLAN muss mindestens 7/10 begründen.'};
}

export async function evaluateTopicQuality(candidate,root=process.cwd()){
  const policy=await readJson(path.join(root,'config','content-policy.json'));
  const q=policy.topicQualityPolicy??{},text=normalizeText(candidate);
  const experience=(q.strongExperienceSignals??[]).filter((s)=>text.includes(normalizeText(s)));
  const curiosity=(q.strongCuriositySignals??[]).filter((s)=>text.includes(normalizeText(s)));
  const generic=(q.genericFramingSignals??[]).filter((s)=>text.includes(normalizeText(s)));
  let score=6;
  if(experience.length)score+=2;
  if(curiosity.length)score+=1;
  if(curiosity.length>=2)score+=1;
  if(generic.length)score-=2;
  score=Math.max(1,Math.min(10,score));
  const minimum=Number(q.minimumScore??8),approved=score>=minimum;
  return{
    decision:approved?'APPROVED_TOPIC_QUALITY':'REVIEW_TOPIC_QUALITY',score,
    experienceSignals:experience,curiositySignals:curiosity,genericSignals:generic,
    reason:approved?'Thema hat genug Erlebnis-, Neugier- und Klickpotenzial für die Kanalrichtung.':'Thema ist zu generisch oder noch nicht stark genug gerahmt. Erst als konkrete Rolle, extreme Situation, Hierarchie, Gefahr oder ungewöhnliche Erlebnisreise neu formulieren.',
    reframePatterns:q.reframePatterns??[]
  };
}

export async function evaluateTopic(candidate,root=process.cwd()){
  if(!normalizeText(candidate))throw new Error('Thema fehlt.');
  const known=await collectKnownTopics(root);let best=null;
  for(const item of known){for(const value of[item.title,...(item.aliases??[])].filter(Boolean)){const score=topicSimilarity(candidate,value),exact=normalizeText(candidate)===normalizeText(value);if(!best||score>best.score||exact)best={...item,matched:value,score,exact};if(exact)break;}if(best?.exact)break;}
  const [channelFit,topicQuality]=await Promise.all([evaluateChannelFit(candidate,root),evaluateTopicQuality(candidate,root)]);
  if(best?.exact||(best?.score??0)>=0.84)return{decision:'BLOCKED_DUPLICATE',candidate,best,channelFit,topicQuality};
  if((best?.score??0)>=0.60)return{decision:'REVIEW_SIMILAR',candidate,best,channelFit,topicQuality};
  if(channelFit.decision==='BLOCKED_CHANNEL_FIT')return{decision:'BLOCKED_CHANNEL_FIT',candidate,best,channelFit,topicQuality};
  if(topicQuality.decision==='REVIEW_TOPIC_QUALITY')return{decision:'REVIEW_TOPIC_QUALITY',candidate,best,channelFit,topicQuality};
  return{decision:channelFit.decision==='APPROVED_CHANNEL_FIT'?'APPROVED_NEW':'REVIEW_CHANNEL_FIT',candidate,best,channelFit,topicQuality};
}

async function main(){
  const topic=arg('--topic')??process.argv.slice(2).find((x)=>!x.startsWith('--'));const result=await evaluateTopic(topic);
  console.log(`THEMA: ${result.decision}`);if(result.best)console.log(`Ähnlichster Treffer: ${result.best.matched} (${result.best.score.toFixed(2)})`);
  console.log(`KANALFIT: ${result.channelFit.score}/10 — ${result.channelFit.reason}`);
  console.log(`THEMENQUALITÄT: ${result.topicQuality.score}/10 — ${result.topicQuality.reason}`);
  if(result.decision==='REVIEW_TOPIC_QUALITY')console.log(`Besser rahmen, z. B.: ${result.topicQuality.reframePatterns.slice(0,4).join(' | ')}`);
  if(['BLOCKED_DUPLICATE','REVIEW_SIMILAR','BLOCKED_CHANNEL_FIT','REVIEW_TOPIC_QUALITY'].includes(result.decision))process.exitCode=1;
}
if(isMain(import.meta.url))main().catch((e)=>{console.error(`Themencheck: FEHLER — ${e.message}`);process.exitCode=1;});
