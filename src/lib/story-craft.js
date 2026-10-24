// Story-Handwerk V10: messbare Regeln aus der Analyse erfolgreicher POV-/Stufen-Kanäle.
// Alles hier prüft nur Text und Plan – die eigentliche Qualität entsteht beim Schreiben.
import { normalizeText } from './pipeline.js';

export const CONTENT_POLICY_V10=10;

const DU_RE=/\b(du|dein|deine|deinen|deinem|deiner|deines|dir|dich)\b/gi;
const NUMBER_RE=/\b\d[\d.,:]*\b|\b(zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf|zwanzig|dreißig|hundert|tausend|million(en)?|milliarde(n)?)\b/gi;

function words(text){return String(text??'').split(/\s+/).filter(Boolean);}
function sentences(text){return String(text??'').replace(/\s+/g,' ').split(/(?<=[.!?…])\s+(?=[A-ZÄÖÜ„"])/).map(s=>s.trim()).filter(Boolean);}
function per1000(count,total){return total?count*1000/total:0;}
function filled(value,min=3){return typeof value==='string'&&value.trim().length>=min&&!value.trim().startsWith('[');}

export function storyMetrics(script){
  const text=String(script??''),all=words(text),total=all.length,s=sentences(text);
  const du=(text.match(DU_RE)??[]).length,numbers=(text.match(NUMBER_RE)??[]).length;
  const lengths=s.map(x=>words(x).length);
  const avg=lengths.length?lengths.reduce((a,b)=>a+b,0)/lengths.length:0;
  const shortShare=lengths.length?lengths.filter(n=>n<=6).length/lengths.length:0;
  return{
    words:total,sentences:s.length,
    duPer100:Number((total?du*100/total:0).toFixed(2)),
    numbersPer1000:Number(per1000(numbers,total).toFixed(2)),
    averageSentenceWords:Number(avg.toFixed(2)),
    shortSentenceShare:Number(shortShare.toFixed(3)),
    firstSentence:s[0]??''
  };
}

function findAll(text,patterns){
  const hits=[];
  for(const source of patterns??[]){
    const re=new RegExp(source,'giu');
    for(const m of String(text).matchAll(re))hits.push(m[0]);
  }
  return hits;
}

// Position (0..1) des ersten bzw. letzten Vorkommens einer normalisierten Phrase im Skript.
function positions(script,phrase){
  const hay=normalizeText(script),needle=normalizeText(phrase);
  if(!needle)return null;
  const first=hay.indexOf(needle),last=hay.lastIndexOf(needle);
  if(first<0)return null;
  return{first:first/hay.length,last:(last+needle.length)/hay.length};
}

export function auditStoryCraft(script,plan,policy){
  const rules=policy?.storyCraftPolicy??{},errors=[],warnings=[];
  const engine=plan?.storyEngine??{},m=storyMetrics(script);
  const lower=String(script??'').toLowerCase();

  for(const hit of new Set(findAll(lower,rules.forbiddenPhrases)))errors.push(`Story V10: Erklärfloskel „${hit}“ ersetzen – zeige die Information in einer Szene.`);
  for(const hit of new Set(findAll(lower,rules.discouragedPhrases)))warnings.push(`Story V10: „${hit}“ wirkt wie ein Vortrag; prüfen.`);
  const disclaimers=findAll(lower,rules.disclaimerPatterns);
  const maxDisclaimers=Number(rules.maxDisclaimersPer1000Words??3);
  if(per1000(disclaimers.length,m.words)>maxDisclaimers)
    errors.push(`Story V10: ${disclaimers.length} Absicherungen im Skript (${disclaimers.slice(0,4).map(x=>'„'+x+'“').join(', ')}). Maximal ${maxDisclaimers} pro 1000 Wörter – Einordnung gehört in die Beschreibung.`);

  const opening=m.firstSentence,maxOpening=Number(rules.maxFirstSentenceWords??18);
  if(words(opening).length>maxOpening)errors.push(`Story V10: erster Satz hat ${words(opening).length} Wörter; maximal ${maxOpening}. Der Einstieg ist ein Bild, kein Überblick.`);

  if(!['du','erzaehler'].includes(engine.perspective))errors.push('CONTENT_PLAN.storyEngine.perspective muss „du“ oder „erzaehler“ sein.');
  if(engine.perspective==='du'&&m.duPer100<Number(rules.minimumDuPer100Words??3))
    errors.push(`Story V10: Du-Perspektive zu schwach (${m.duPer100} Du-Formen pro 100 Wörter, mindestens ${rules.minimumDuPer100Words??3}). Der Zuschauer ist die Hauptfigur.`);
  if(m.numbersPer1000<Number(rules.minimumConcreteNumbersPer1000Words??6))
    errors.push(`Story V10: zu wenig konkrete Zahlen/Uhrzeiten/Beträge (${m.numbersPer1000} pro 1000 Wörter, mindestens ${rules.minimumConcreteNumbersPer1000Words??6}).`);
  if(m.shortSentenceShare<Number(rules.minimumShortSentenceShare??0.12))
    errors.push(`Story V10: nur ${(m.shortSentenceShare*100).toFixed(0)} % kurze Sätze (≤6 Wörter), mindestens ${Math.round(Number(rules.minimumShortSentenceShare??0.12)*100)} %. Gleich lange Sätze klingen vorgelesen monoton.`);

  const p=engine.protagonist??{};
  for(const [key,label] of [['start','Ausgangslage'],['want','Ziel'],['belief','Überzeugung/Selbstbild']])if(!filled(p[key],12))errors.push(`CONTENT_PLAN.storyEngine.protagonist.${key} (${label}) fehlt.`);
  if(!filled(engine.stakes,20))errors.push('CONTENT_PLAN.storyEngine.stakes: Was steht konkret auf dem Spiel?');

  const voice=Array.isArray(engine.innerVoice)?engine.innerVoice:[];
  const minVoice=Number(rules.minimumInnerVoiceLines??3);
  if(voice.length<minVoice)errors.push(`CONTENT_PLAN.storyEngine.innerVoice: mindestens ${minVoice} Entwicklungsstufen der inneren Stimme planen.`);
  voice.forEach((v,i)=>{
    if(!filled(v?.line,8))errors.push(`storyEngine.innerVoice ${i+1}: line fehlt.`);
    else if(!positions(script,v.line))errors.push(`storyEngine.innerVoice ${i+1}: „${v.line}“ kommt im Skript nicht wörtlich vor.`);
  });
  const voicePos=voice.map(v=>positions(script,v?.line)?.first).filter(x=>typeof x==='number');
  if(voicePos.some((x,i)=>i>0&&x<=voicePos[i-1]))errors.push('storyEngine.innerVoice: die Stufen müssen in Skript-Reihenfolge stehen.');

  const turns=Array.isArray(engine.turns)?engine.turns:[];
  const minTurns=Number(rules.minimumTurns??4);
  if(turns.length<minTurns)errors.push(`CONTENT_PLAN.storyEngine.turns: mindestens ${minTurns} Wendepunkte, an denen sich Lage oder Status ändern.`);
  turns.forEach((t,i)=>{if(!filled(t?.whatChanges,12)||!filled(t?.concreteDetail,12))errors.push(`storyEngine.turns ${i+1}: whatChanges und concreteDetail ausfüllen.`);});

  const motif=String(engine.callbackMotif??'').trim(),window=Number(rules.callbackWindow??0.15);
  const pos=positions(script,motif);
  if(!motif)errors.push('CONTENT_PLAN.storyEngine.callbackMotif fehlt: ein Bild/Satz vom Anfang kehrt am Ende zurück.');
  else if(!pos||pos.first>window||pos.last<1-window)errors.push(`Story V10: Callback-Motiv „${motif}“ muss in den ersten und letzten ${Math.round(window*100)} % des Skripts vorkommen.`);

  return{passed:errors.length===0,errors,warnings,metrics:m};
}

export function auditTitle(title,policy){
  const rules=policy?.titleCoverPolicy??{},errors=[],t=String(title??'').trim();
  const [min,max]=rules.titleLength??[25,70];
  if(t.length<min||t.length>max)errors.push(`Titel hat ${t.length} Zeichen; erlaubt ${min}–${max}.`);
  const formulas=(rules.titleFormulas??[]).map(f=>new RegExp(f.pattern,'iu'));
  if(formulas.length&&!formulas.some(re=>re.test(t)))errors.push('Titel folgt keiner bewährten Formel aus content-policy.titleCoverPolicy.titleFormulas.');
  for(const source of rules.forbiddenTitlePatterns??[])if(new RegExp(source,'iu').test(t))errors.push(`Titel enthält ein verbotenes Muster (${source}).`);
  return{passed:errors.length===0,errors};
}

export function auditChapters(scenes,{minimum=3}={}){
  const errors=[],chapters=(scenes??[]).map((s,i)=>({imageNumber:i+1,title:String(s?.chapter??'').trim()})).filter(c=>c.title);
  if(chapters.length<minimum)errors.push(`SCENE_PLAN: mindestens ${minimum} Kapitel (Feld chapter) für YouTube-Kapitelmarken setzen.`);
  else if(chapters[0].imageNumber!==1)errors.push('SCENE_PLAN: das erste Kapitel muss bei Bild 01 beginnen (YouTube verlangt 0:00).');
  for(const c of chapters)if(c.title.length>60)errors.push(`Kapitel bei Bild ${c.imageNumber}: Titel zu lang.`);
  return{passed:errors.length===0,errors,chapters};
}
