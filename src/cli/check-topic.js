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

const contains=(text,signal)=>text.includes(normalizeText(signal));
const findSignals=(text,signals)=>(signals??[]).filter(s=>contains(text,s));
const WORLD_GROUPS={
  crime:["mafia","kartell","organisierte kriminalität","organisierte kriminalitaet","unterwelt","gangster","clan","geldwäsche","geldwaesche","geldwäscher","finanzagent","betrug","betrüger","schmuggel","schmuggler","drogenhandel","waffenhandel","auftragskiller"],
  authority:["fbi","cia","bka","lka","sek","swat","kripo","kriminalpolizei","polizei","zoll","bundespolizei","geheimdienst","spezialeinheit","undercover","ermittler","gefängnis","gefangnis"],
  government:["parlament","bundestag","abgeordnet","regierung","kanzler","minister","senat","politiker","politikbetrieb"],
  history:["rom","römisch","roemisch","gladiator","legion","antike","mittelalter","ritter","wikinger","kaiser","römische","roemische"],
  institutions:["militär","militaer","armee","soldat","geheimorganisation","organisationsstruktur","hierarchie einer","gefängnis","gefangnis"]
};
const FRAMING={
  day:["pov du bist","pov du wirst","du bist ein","du bist eine","du wirst ","so jagt dich","so fühlt sich","so lebst du","ein tag als","ein tag beim","ein tag bei der","ein tag im","ein tag in der","ein tag eines","ein tag einer","dein erster tag","dein leben als","dein leben im","dein leben in"],
  structure:["hierarchie","struktur","aufbau","aufgebaut","organisiert","rang","ränge","range","stufen","stufe","vom ","bis zum","wer entscheidet","machtverhältnisse","machtverteilung","jeder rang","jede stufe","funktioniert die mafia","funktioniert ein kartell","ablauf"],
  history:["im antiken","im mittelalter","römischen","römischer","roemischen","roemischer","zur zeit","im alten rom"],
  explanatory:["wie ","warum ","wer ","was macht ","einblick","erklärt","erklaert"],
  generic:["die geschichte von","geschichte der","geschichte des","fakten über","fakten uber","fakten ueber","alles über","alles uber","alles ueber","was ist","ein überblick","ein ueberblick","biografie von"],
  narrative:["mission","einsatz","ermittlung","operation","verfolgung","fall","verhör","verhoer","verdeckter"]
};
function inspect(candidate,policy){
  const value=normalizeText(candidate),world=Object.fromEntries(Object.entries(WORLD_GROUPS).map(([k,signals])=>[k,findSignals(value,signals)]));
  const framing=Object.fromEntries(Object.entries(FRAMING).map(([k,signals])=>[k,findSignals(value,signals)]));
  const anchored=Object.values(world).some(x=>x.length>0);
  const fantasy=findSignals(value,policy.nicheFitPolicy?.magicalFantasySignals??[]);
  const out=findSignals(value,policy.nicheFitPolicy?.obviousOutOfScopeSignals??[]);
  return{value,world,framing,anchored,fantasy,out,worldSignals:[...new Set(Object.values(world).flat())]};
}
export async function evaluateChannelFit(candidate,root=process.cwd()){
  const policy=await readJson(path.join(root,'config','content-policy.json'));
  const x=inspect(candidate,policy);
  if(x.out.length)return{decision:'BLOCKED_CHANNEL_FIT',score:2,positiveSignals:[],outOfScopeSignals:x.out,reason:'Dieses Thema gehört nicht zur StrichModus-Welt aus Berufen, Geschichte und Strukturen.'};
  if(x.fantasy.length)return{decision:'REVIEW_CHANNEL_FIT',score:4,positiveSignals:x.worldSignals,outOfScopeSignals:[],fantasySignals:x.fantasy,reason:'Magisch-fantastische Prämisse ist keine Standardrichtung. Nur nach ausdrücklicher redaktioneller Ausnahme.'};
  if(x.anchored&&(x.framing.day.length||x.framing.structure.length||x.framing.history.length||x.framing.narrative.length))
    return{decision:'APPROVED_CHANNEL_FIT',score:9,positiveSignals:x.worldSignals,outOfScopeSignals:[],reason:'Konkreter realer Beruf, historischer Alltag, politische Rolle oder nachvollziehbare Macht-/Organisationsstruktur.'};
  return{decision:'REVIEW_CHANNEL_FIT',score:x.anchored?7:5,positiveSignals:x.worldSignals,outOfScopeSignals:[],reason:'Konkreten realen Einblick nennen: ein Tag in einer Rolle, Aufgaben, Organisationsaufbau, Hierarchie oder historische Lebenswelt.'};
}
export async function evaluateTopicQuality(candidate,root=process.cwd()){
  const policy=await readJson(path.join(root,'config','content-policy.json'));
  const q=policy.topicQualityPolicy??{},x=inspect(candidate,policy);
  const{framing:f}=x;
  const day=!!f.day.length,structure=!!f.structure.length,historical=!!f.history.length||x.world.history.length>0;
  const generic=!!f.generic.length,hasNarrative=!!f.narrative.length;
  let score=4.5;
  if(x.anchored)score+=1.8;
  if(day)score+=1.6;
  if(structure)score+=2.3;
  if(day&&x.anchored)score+=0.8;
  if(structure&&x.anchored)score+=0.8;
  if(historical&&day)score+=0.2;
  if(hasNarrative&&x.anchored)score+=0.8;
  if(generic&&!day&&!structure)score-=2.0;
  if(x.fantasy.length)score-=2.2;
  if(!x.anchored)score=Math.min(score,6.5);
  if(x.out.length)score=Math.min(score,3);
  score=Math.max(1,Math.min(10,Number(score.toFixed(1))));
  const weight={'mini-stories':day?5:0,progression:structure?5:0,story:hasNarrative?4:0};
  if(x.anchored&&historical&&!day)weight['mini-stories']+=2;
  if(structure)weight['mini-stories']+=1;
  if(day&&hasNarrative)weight.story+=2;
  const suggestedFormats=Object.entries(weight).sort((a,b)=>b[1]-a[1]).filter(([,v])=>v>0).map(([k])=>k);
  const approved=score>=Number(q.minimumScore??8)&&x.anchored&&!x.fantasy.length&&!x.out.length;
  return{
    decision:approved?'APPROVED_TOPIC_QUALITY':'REVIEW_TOPIC_QUALITY',score,
    roleSignals:f.day,listSignals:[],progressionSignals:f.structure,storySignals:f.narrative,
    worldSignals:x.worldSignals,funnySignals:[],genericSignals:f.generic,fantasySignals:x.fantasy,suggestedFormats,
    reason:approved?'Reale Welt mit klar erlebbaren Aufgaben, Macht-/Organisationsstruktur oder historischen Stationen.':'Noch keinen ausreichend konkreten echten Einblick oder zu viel Fantasie. Beruf, Institution, Epoche, Tätigkeit oder belegte Hierarchie präzisieren.',
    reframePatterns:['Ein Tag als FBI-Agent','Ein Tag im Bundestag','Ein Tag im antiken Rom','Die Hierarchie einer Mafia erklärt','Wie ein Kartell aufgebaut ist','Ein Tag als Legionär im Römischen Reich']
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
