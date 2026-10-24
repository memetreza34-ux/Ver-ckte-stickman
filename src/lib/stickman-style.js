// Verbindlicher Stil-Check ab Visual Policy V7. Prüft Texte, nicht generierte Pixel.
export const STICKMAN_POLICY_VERSION=7;
export const STICKMAN_ANATOMY_RULE="STICKMAN-ANATOMIE: ALLE SICHTBAREN PERSONEN SIND KLASSISCHE STRICHMÄNNCHEN. Einfacher Kreis- oder Ovalkopf, Gesicht nur mit Punktaugen und Strichmund. Der Rumpf ist ein einzelner dünner schwarzer Strich. Stricharme und Strichbeine sind jeweils dünne einzelne schwarze Linien, keine anatomisch modellierten Schultern, Arme, Hände, Oberschenkel oder Körper. Kleidung nur flache kleine Farbsymbole an Strichkörpern, NIEMALS als Körpervolumen. KEINE NORMALEN COMIC-MENSCHEN, KEINE VOLUMINÖSEN MENSCHENKÖRPER, kein Anime, keine realistischen Gesichter, keine halb-realistischen Cartoonfiguren. Auch in einem detailreichen Raum müssen Stricharme und Strichbeine eindeutig als Linien erkennbar bleiben.";
export function auditStickmanPrompts(blocks){
  const errors=[];
  for(let i=0;i<blocks.length;i++){
    const body=String(blocks[i].split(/BILDPROMPT:\s*\n/i)[1]??'');
    const number=String(i+1).padStart(2,'0');
    // Der vollständige kanonische Regeltext ist erforderlich. Einzelne
    // Schlüsselwörter reichen nicht aus: sonst bleiben Teil-Prompts unbemerkt.
    if(!body.includes(STICKMAN_ANATOMY_RULE))
      errors.push('Bild '+number+': vollständige verbindliche STICKMAN-ANATOMIE fehlt oder wurde verändert.');
    // Explizit gegenteilige POSITIVE Figurenvorgaben trotz Pflicht-Header ablehnen.
    if(/(?:zeichne|zeige|gestalte|generiere|stelle)[^.!?]{0,140}(?:als |wie |mit )(?:realistische|anatomisch korrekte|voluminöse|voll ausgearbeitete) (?:menschen|comic-menschen|figuren|menschenkörper)/i.test(body))
      errors.push('Bild '+number+': gegenteilige Anweisung für anatomische Comic-Menschen erkannt.');
  }
  return {passed:errors.length===0,errors,total:blocks.length};
}

export const VISUAL_POLICY_V8=8;
export function auditLivelyGermanVisuals(blocks){
 const errors=[];let scenes=0;
 for(let i=0;i<blocks.length;i++){
  const block=String(blocks[i]);const body=block.split(/BILDPROMPT:\s*\n/i)[1]??'';
  const n=i+1;
  if(!body.includes('LEBENDIGE SZENE:'))errors.push('Bild '+n+': konkreter szenischer Bildmoment fehlt.');
  const diagram=body.includes('BILDTYP: AUSNAHME-DIAGRAMM');
  if(!diagram)scenes++;
  if(n>1&&!body.includes('KEINE BILDSCHRIFT'))errors.push('Bild '+n+': Schriftverbot fehlt.');
  if(n>1&&/(?:^|[.!?]\s*)(?:Schreibe|Beschrifte|Setze)\s+(?:das Wort|den Text|die Wörter|das Schild|die Überschrift|einen Schriftzug|eine Beschriftung)/im.test(body))
    errors.push('Bild '+n+': widersprüchliche Aufforderung zu Bildschrift.');
  if(n===1&&!block.includes('ÜBERSCHRIFT:'))errors.push('Cover: deutsche Überschrift fehlt.');
 }
 if(blocks.length>0&&scenes/blocks.length<0.85)errors.push('Zu viele Diagramme, zu wenig figurenzentrierte Szenen.');
 for(let start=0;start<blocks.length;start+=5){
  if(blocks.slice(start,start+5).filter(b=>!b.includes('BILDTYP: AUSNAHME-DIAGRAMM')).length<Math.min(4,blocks.length-start))
   errors.push('Flow-Batch ab Bild '+(start+1)+': mindestens vier echte Szenen erforderlich.');
 }
 return {passed:errors.length===0,errors,characterScenes:scenes,total:blocks.length};
}


// V9: Der Kanal-Look bleibt kohärent, aber die passende Darstellungsform richtet
// sich nach der Skriptaussage – kein erzwungener Stickman-Anteil.
export const VISUAL_POLICY_V9=9;
export const VISUAL_TYPES_V9=Object.freeze([
  'szene','hierarchie','organigramm','vergleich','ablauf',
  'zeitleiste','karte','infografik','symbolbild','detail'
]);
export const EDITORIAL_WORLD_V9='GEMEINSAME BILDWELT: Handgezeichnete deutsche 2D-Editorial-Comicillustration, charakteristische dunkle Tuschekonturen, reduzierte klare Formen, dezente Papiertextur; feste Grundpalette Creme, tiefes Petrol, Anthrazit, Ocker, gedämpftes Rot, gezieltes Cyan/Gelb. Eine starke visuelle Hauptidee statt Folientext; klare Bildhierarchie, filmisch gestaltetes Licht, 16:9, keine Stockfotos, kein Fotorealismus, kein 3D und keine Pseudoschrift.';
export const V9_GRAPHIC_TYPES=new Set(['hierarchie','organigramm','vergleich','ablauf','zeitleiste','karte','infografik']);

export function validateEditorialScenes(scenes,{maxLabels=7,maxWordsPerLabel=4}={}){
  const errors=[];
  const seen=new Map();
  for(let i=0;i<scenes.length;i++){
    const scene=scenes[i]??{},n=i+1,kind=String(scene.visualType??'').toLowerCase();
    const elements=scene.elements,labels=scene.labels??[];
    if(!VISUAL_TYPES_V9.includes(kind))errors.push('Bild '+n+': visualType muss bewusst aus den erlaubten Bildtypen gewählt werden.');
    if(String(scene.message??'').trim().length<16)errors.push('Bild '+n+': konkrete Kernaussage (message) mit mindestens 16 Zeichen fehlt.');
    if(String(scene.visual??'').trim().length<30)errors.push('Bild '+n+': konkrete szenengenaue Darstellung (visual) fehlt.');
    if(!Array.isArray(elements)||elements.length<2||elements.some(x=>typeof x!=='string'||x.trim().length<4))
      errors.push('Bild '+n+': mindestens zwei konkrete Bildbestandteile (elements) fehlen.');
    if(!Array.isArray(labels))errors.push('Bild '+n+': labels muss ein Array sein.');
    else{
      if(labels.length>maxLabels)errors.push('Bild '+n+': zu viele Beschriftungen; maximal '+maxLabels+'.');
      if(labels.some(x=>typeof x!=='string'||!x.trim()||x.trim().split(/\s+/).length>maxWordsPerLabel))
        errors.push('Bild '+n+': ein sichtbares Label ist leer/zu lang oder nicht als Text angegeben.');
      if(labels.some(x=>/[<>{}]/.test(x)))errors.push('Bild '+n+': Platzhalter in Bildbeschriftungen.');
      if(i>0&&V9_GRAPHIC_TYPES.has(kind)&&labels.length<2)errors.push('Bild '+n+': erklärende '+kind+' braucht mindestens zwei überprüfte, kurze Labels.');
      if(i===0&&labels.length)errors.push('Bild 1: Cover trägt nur die eine Headline aus dem Content-Plan, keine zusätzlichen Labels.');
      if(kind==='szene'&&labels.length>2)errors.push('Bild '+n+': eine Spielszenen-Illustration darf maximal zwei Kurzlabels haben.');
    }
    if(i>0&&String(scene.visual??'').trim()===String(scenes[i-1]?.visual??'').trim())
      errors.push('Bild '+n+': dieselbe Bildidee wie im vorherigen Bild. Für die neue Aussage neu gestalten.');
    const key=kind+'|'+String(scene.visual??'').trim().toLowerCase();
    if(key.length>30&&seen.has(key))errors.push('Bild '+n+': identische Bildidee wie Bild '+seen.get(key)+'.');
    seen.set(key,n);
  }
  return {passed:errors.length===0,errors,total:scenes.length,types:scenes.map(s=>s.visualType)};
}

// Prüft nur die generierten Prompt-Texte. Echte Bild-/Schriftfehler müssen
// nach Google Flow weiterhin im IMAGE_REVIEW visuell überprüft werden.
export function auditEditorialVisuals(blocks){
  const errors=[],types=[];
  for(let i=0;i<blocks.length;i++){
    const block=String(blocks[i]),n=i+1;
    const body=block.split(/BILDPROMPT:\s*\n/i)[1]??'';
    for(const marker of ['BILDTYP:','KERNAUSSAGE:','KONKRETE DARSTELLUNG:','GEMEINSAME BILDWELT:','BESCHRIFTUNGEN:'])
      if(!body.includes(marker))errors.push('Bild '+n+': Pflichtangabe '+marker+' fehlt.');
    const type=body.match(/(?:^|\n)BILDTYP:\s*([a-z-]+)/i)?.[1]?.toLowerCase();
    if(!VISUAL_TYPES_V9.includes(type))errors.push('Bild '+n+': unbekannter oder fehlender Bildtyp.');
    types.push(type);
    if(n===1&&!/ÜBERSCHRIFT:\s*"[^"]+"/.test(block))
      errors.push('Cover: kurze deutsche Überschrift fehlt.');
    if(n>1&&body.includes('NUR AUF DEM COVER TEXT'))errors.push('Bild '+n+': pauschales Textverbot widerspricht V9.');
  }
  return{passed:errors.length===0,errors,total:blocks.length,types};
}

// V10: jedes Video bekommt eine eigene, strukturierte Bildwelt (Orte, Figuren mit Statusstufen, Leitmotiv).
export const VISUAL_POLICY_V10=10;
const LOCATION_TYPES=new Set(['szene','detail']);

function text(value){return String(value??'').trim();}
// stage ist entweder ein Text (gilt für jede Figur, die diese Stufe kennt) oder {figur:stufe}.
function stageFor(scene,member){return scene?.stage&&typeof scene.stage==='object'?scene.stage[member]:scene?.stage;}

export function validateVisualWorld(world,scenes,{minLocations=3,minCast=1,paletteSize=[3,6]}={}){
  const errors=[],w=world??{};
  if(text(w.name).length<4)errors.push('visualWorld.name fehlt.');
  if(text(w.look).length<60)errors.push('visualWorld.look: Stimmung und Material dieses Videos konkret beschreiben (mindestens 60 Zeichen).');
  if(text(w.lighting).length<20)errors.push('visualWorld.lighting fehlt.');
  const palette=Array.isArray(w.palette)?w.palette:[];
  if(palette.length<paletteSize[0]||palette.length>paletteSize[1])errors.push(`visualWorld.palette braucht ${paletteSize[0]}–${paletteSize[1]} Farben.`);
  const locations=w.locations&&typeof w.locations==='object'?w.locations:{};
  if(Object.keys(locations).length<minLocations)errors.push(`visualWorld.locations: mindestens ${minLocations} wiederkehrende Schauplätze.`);
  for(const [key,value] of Object.entries(locations))if(text(value).length<40)errors.push(`visualWorld.locations.${key}: feste Details beschreiben (mindestens 40 Zeichen).`);
  const cast=w.cast&&typeof w.cast==='object'?w.cast:{};
  if(Object.keys(cast).length<minCast)errors.push(`visualWorld.cast: mindestens ${minCast} feste Figur.`);
  for(const [key,value] of Object.entries(cast)){
    if(text(value?.look).length<40)errors.push(`visualWorld.cast.${key}.look: Aussehen konkret festlegen (mindestens 40 Zeichen).`);
    if(value?.stages!==undefined&&(typeof value.stages!=='object'||Array.isArray(value.stages)))errors.push(`visualWorld.cast.${key}.stages muss ein Objekt sein.`);
  }
  const motif=w.motif??{};
  if(text(motif.object).length<8||text(motif.meaning).length<12)errors.push('visualWorld.motif braucht object und meaning.');

  const list=Array.isArray(scenes)?scenes:[],motifScenes=[];
  list.forEach((scene,i)=>{
    const n=i+1,kind=text(scene?.visualType).toLowerCase();
    if(LOCATION_TYPES.has(kind)&&!scene?.location)errors.push(`Bild ${n}: ${kind} braucht location aus visualWorld.locations.`);
    if(scene?.location&&!locations[scene.location])errors.push(`Bild ${n}: unbekannte location „${scene.location}“.`);
    const members=scene?.cast??[];
    for(const member of members)if(!cast[member])errors.push(`Bild ${n}: unbekannte Figur „${member}“.`);
    if(scene?.stage&&typeof scene.stage==='object'){
      for(const [member,stage] of Object.entries(scene.stage)){
        if(!members.includes(member))errors.push(`Bild ${n}: stage nennt „${member}“, die Figur ist aber nicht in cast.`);
        else if(cast[member]&&!cast[member].stages?.[stage])errors.push(`Bild ${n}: Figur „${member}“ hat keine Stufe „${stage}“.`);
      }
    }else if(scene?.stage&&!members.some(m=>cast[m]?.stages?.[scene.stage]))
      errors.push(`Bild ${n}: keine Figur in cast hat die Stufe „${scene.stage}“.`);
    if(scene?.motif)motifScenes.push(n);
  });
  if(list.length){
    const edge=Math.max(1,Math.ceil(list.length*0.1));
    if(!motifScenes.some(n=>n<=edge)||!motifScenes.some(n=>n>list.length-edge))
      errors.push(`visualWorld.motif muss im ersten und im letzten Zehntel der Bilder vorkommen (Szenen mit motif: true; aktuell ${motifScenes.join(', ')||'keine'}).`);
  }
  return{passed:errors.length===0,errors,motifScenes};
}

export function composeWorldText(world,{includeCast=true}={}){
  const w=world??{};
  const cast=Object.entries(w.cast??{}).map(([key,value])=>`${key}: ${text(value.look)}`).join(' ');
  return [
    `BILDWELT „${text(w.name)}“: ${text(w.look)}`,
    `Farbklima: ${(w.palette??[]).join(', ')}. Licht: ${text(w.lighting)}.`,
    includeCast&&cast?`Feste Figuren: ${cast}`:'',
    `Leitmotiv: ${text(w.motif?.object)}.`
  ].filter(Boolean).join(' ');
}

export function sceneWorldLines(world,scene){
  const w=world??{},lines=[];
  if(scene?.location&&w.locations?.[scene.location])lines.push(`ORT: ${text(w.locations[scene.location])}`);
  const members=(scene?.cast??[]).filter(m=>w.cast?.[m]);
  if(members.length)lines.push('FIGUREN: '+members.map(m=>{
    const key=stageFor(scene,m),stage=key?text(w.cast[m].stages?.[key]):'';
    return `${m} – ${text(w.cast[m].look)}${stage?' Jetzt: '+stage:''}`;
  }).join(' | '));
  if(scene?.motif)lines.push(`LEITMOTIV SICHTBAR: ${text(w.motif?.object)} (${text(w.motif?.meaning)})`);
  return lines;
}

// V10-Kanalstil ohne feste Farbpalette: Farben und Licht kommen aus der Bildwelt des Videos.
export const EDITORIAL_WORLD_V10='GEMEINSAME BILDWELT: Handgezeichnete deutsche 2D-Comicillustration im StrichModus-Strich, dunkle Tuschekonturen, dezente Papiertextur, eine starke visuelle Hauptidee, klare Bildhierarchie, filmisches Licht, 16:9; Farben und Licht ausschließlich laut Bildwelt dieses Videos; keine Stockfotos, kein Fotorealismus, kein 3D und keine Pseudoschrift.';
export const EXPRESSION_RULE_V10='MIMIK V10: Köpfe dürfen ausdrucksstarke Comicgesichter tragen – kräftige Augenbrauen, große Augen, offener Mund, Schweißtropfen, Tränen, Grinsen –, damit die Emotion auf Thumbnail-Größe lesbar bleibt. Körper, Arme und Beine bleiben dünne Strichlinien.';
