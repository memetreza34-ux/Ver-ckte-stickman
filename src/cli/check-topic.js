#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { arg, isMain, normalizeText, readJson, topicSimilarity, walkFiles } from '../lib/pipeline.js';

export async function collectKnownTopics(root=process.cwd()){
  const registry=await readJson(path.join(root,'config','topic-registry.json'),{entries:[]});
  const known=(registry.entries??[]).filter((e)=>!['abandoned-direction','discarded'].includes(e.status)).map((e)=>({source:'registry',title:e.title??'',aliases:e.aliases??[]}));
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
  const positiveSignals=niche.positiveSignals??[];
  const outSignals=niche.obviousOutOfScopeSignals??[];
  const positive=positiveSignals.filter((s)=>text.includes(normalizeText(s))),out=outSignals.filter((s)=>text.includes(normalizeText(s)));
  if(out.length)return{decision:'BLOCKED_CHANNEL_FIT',score:2,positiveSignals:positive,outOfScopeSignals:out,reason:'Thema wirkt offensichtlich außerhalb der Kanal-DNA.'};
  if(positive.length)return{decision:'APPROVED_CHANNEL_FIT',score:9,positiveSignals:positive,outOfScopeSignals:[],reason:'Thema trifft die bevorzugte Rollen-/Lebenswelt-/Progressions-DNA.'};
  return{decision:'REVIEW_CHANNEL_FIT',score:6,positiveSignals:[],outOfScopeSignals:[],reason:'Kanalfit ist aus dem Einzeiler allein nicht sicher; Rollen-, Lebenswelt- oder Progressionswinkel stärker machen.'};
}

export async function evaluateTopicQuality(candidate,root=process.cwd()){
  const policy=await readJson(path.join(root,'config','content-policy.json'));
  const q=policy.topicQualityPolicy??{},text=normalizeText(candidate);
  const genericSignals=['die geschichte von','geschichte der','fakten uber','fakten ueber','alles uber','alles ueber','was ist','wie funktioniert','ein uberblick','ein ueberblick','biografie von'];
  const roleSignals=['ein tag als','dein leben als','du bist','dein erster tag','ein tag im leben','dein tag als'];
  const listSignals=['arten','falle','fälle','orte','lander','länder','dinge','jede art','jeder typ','top ','ranking'];
  const progressionSignals=['stufe','stufen','rang','range','ränge','level','vom ','bis zum','hierarchie','aufstieg','rekrut','boss'];
  const storySignals=['mission','einsatz','undercover','flucht','verfolgung','zielperson','geisel','operation','auftrag'];
  const strongWorldSignals=['cia','fbi','swat','agent','geheimdienst','mafia','kartell','spezialeinheit','polizei','soldat','sniper','scharfschutze','scharfschütze','auftragskiller','undercover'];

  const generic=genericSignals.filter((s)=>text.includes(normalizeText(s)));
  const role=roleSignals.filter((s)=>text.includes(normalizeText(s)));
  const list=listSignals.filter((s)=>text.includes(normalizeText(s)));
  const progression=progressionSignals.filter((s)=>text.includes(normalizeText(s)));
  const story=storySignals.filter((s)=>text.includes(normalizeText(s)));
  const world=strongWorldSignals.filter((s)=>text.includes(normalizeText(s)));

  let score=5.3;
  if(role.length)score+=1.9;
  if(world.length)score+=1.2;
  if(progression.length)score+=1.2;
  if(progression.length>=2)score+=0.5;
  if(list.length)score+=0.8;
  if(story.length)score+=0.8;
  if(role.length&&world.length)score+=0.6;
  if(progression.length&&world.length)score+=0.5;
  if(generic.length&&!role.length&&!progression.length)score-=1.8;
  else if(generic.length)score-=0.4;
  score=Math.max(1,Math.min(10,Number(score.toFixed(1))));

  const formatScores={
    'mini-stories':role.length*3+list.length+world.length,
    progression:progression.length*2+world.length,
    story:story.length*2+role.length+world.length
  };
  const suggestedFormats=Object.entries(formatScores).sort((a,b)=>b[1]-a[1]).filter(([,v])=>v>0).map(([k])=>k);
  const minimum=Number(q.minimumScore??8),approved=score>=minimum;
  return{
    decision:approved?'APPROVED_TOPIC_QUALITY':'REVIEW_TOPIC_QUALITY',score,
    roleSignals:role,listSignals:list,progressionSignals:progression,storySignals:story,worldSignals:world,genericSignals:generic,suggestedFormats,
    reason:approved?'Thema besitzt eine klare Rolle/Lebenswelt oder starke Progression mit gutem visuellen Potenzial.':'Thema ist noch zu allgemein. Bevorzuge eine konkrete Rolle, einen Tag, einen Einsatz oder eine echte Hierarchie.',
    reframePatterns:['Ein Tag als FBI-Agent','Ein Tag als CIA-Agent','Dein Leben als Undercover-Agent','Vom Rekruten bis zum Boss','Dein Leben auf jeder Stufe von ...']
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
  const topic=arg('--topic')??process.argv.slice(2).find((x)=>!x.startsWith('--'));
  const result=await evaluateTopic(topic);
  console.log(`THEMA: ${result.decision}`);
  if(result.best)console.log(`Ähnlichster Treffer: ${result.best.matched} (${result.best.score.toFixed(2)})`);
  console.log(`KANALFIT: ${result.channelFit.score}/10 — ${result.channelFit.reason}`);
  console.log(`THEMENQUALITÄT: ${result.topicQuality.score}/10 — ${result.topicQuality.reason}`);
  if(result.topicQuality.suggestedFormats?.length)console.log(`Mögliche Formate: ${result.topicQuality.suggestedFormats.join(', ')}`);
  if(result.decision==='REVIEW_TOPIC_QUALITY')console.log(`Besser rahmen, z. B.: ${result.topicQuality.reframePatterns.join(' | ')}`);
  if(['BLOCKED_DUPLICATE','REVIEW_SIMILAR','BLOCKED_CHANNEL_FIT','REVIEW_TOPIC_QUALITY'].includes(result.decision))process.exitCode=1;
}
if(isMain(import.meta.url))main().catch((e)=>{console.error(`Themencheck: FEHLER — ${e.message}`);process.exitCode=1;});
