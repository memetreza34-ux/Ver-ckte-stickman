import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { exists, projectPaths, readJson, writeJson } from './pipeline.js';
import { STICKMAN_ANATOMY_RULE, EDITORIAL_WORLD_V9, validateEditorialScenes } from './stickman-style.js';

const DEFAULT_SHOTS=['Nahaufnahme','Halbtotale','POV','weite Totale','Detail','leichte Untersicht','Seitenansicht','symmetrische Ansicht'];
const DEFAULT_MOTIONS=['push-in','pan-right','focus-left','pull-out','drift-up','focus-right','pan-left','drift-down'];


const V9_LAYOUTS={
  szene:'Die Figuren zeigen eine konkrete Handlung, erkennbare Ursache und Konsequenz. Nicht automatisch Gruppen am Tisch zeichnen.',
  hierarchie:'Stufen der Macht in faktisch richtiger vertikaler Reihenfolge als stilisierte, klare Pyramide/Ebenengrafik darstellen. Keine erfundenen Ebenen.',
  organigramm:'Rollen in klaren Boxen/illustrativen Emblemen, korrekt gerichtete Linien; beratende Rollen nicht fälschlich unterordnen.',
  vergleich:'Präziser Split-Screen: zwei klar getrennte Seiten mit spezifischen, visuell erkennbaren Unterschieden.',
  ablauf:'Verständlicher Weg in wenigen Stationen mit Pfeilen und eindeutiger Richtung, von Auslöser zu Konsequenz.',
  zeitleiste:'Stilisierte klare Zeitachse mit belegten chronologischen Stationen, keine erfundenen Jahreszahlen.',
  karte:'Illustrierte, geografisch richtige Kartensituation mit genau den zum Gesagten gehörenden Orten.',
  infografik:'Wenige überprüfbare Größen, klare Proportionen oder Beziehungen, kein erfundener Messwert.',
  symbolbild:'Ein präzises starkes Symbol, das exakt die Aussage trägt, ohne unnötige Personen.',
  detail:'Nahes, gut erkennbares Detail eines zur Aussage gehörenden Gegenstands oder Handlungsschrittes.'
};
function editorialPromptV9(scene,{number,world,shot,coverText,coverVisual}){
  const type=String(scene.visualType).toLowerCase();
  const sceneElements=scene.elements.map(s=>String(s).trim()).join('; ');
  const chosenLabels=number===1?[]:scene.labels??[];
  const labels=number===1
    ?'BESCHRIFTUNGEN: genau die Cover-Headline „'+coverText+'“ einmal, keine weitere Schrift.'
    :chosenLabels.length
      ?'BESCHRIFTUNGEN: Schreibe NUR diese exakten überprüften kurzen Labels deutlich und fehlerfrei, keine weiteren Wörter oder Fantasieschrift: '+chosenLabels.map(s=>'„'+s+'“').join(', ')+'.'
      :'BESCHRIFTUNGEN: keine lesbaren Wörter nötig, keine zufälligen Buchstaben oder Fantasieschrift.';
  const anatomy=type==='szene'
    ?STICKMAN_ANATOMY_RULE+' Falls Personen zu sehen sind: eindeutige individuelle Accessoires, aktive Körperhaltung, korrekte Handlung – keine anonymen austauschbaren Figuren.'
    :'Figuren nur dann einsetzen, wenn sie der Informationsvermittlung dienen; keine erzwungene Strichmännchen-Gruppe.';
  const visibleDescription=number===1?coverVisual+'. '+scene.visual:scene.visual;
  return [
    'BILDTYP: '+type,
    'KERNAUSSAGE: '+scene.message,
    'KONKRETE DARSTELLUNG: '+visibleDescription,
    'WICHTIGE ELEMENTE: '+sceneElements,
    'VISUELLE UMSETZUNG: '+V9_LAYOUTS[type],
    'KOMPOSITION: '+shot+'. Eine Aussage, klarer Blickfang, direkt verständlich.',
    labels,
    EDITORIAL_WORLD_V9,
    'KONTINUITÄT: '+world,
    anatomy,
    'QUALITÄT: Dieses Bild visualisiert genau die Kernaussage; Rangfolge, Beschriftung, Rollen, geografische oder historische Details nach recherchierten Fakten. Kein beliebiges Dekomotiv, keine Textwand, kein Wasserzeichen.'
  ].join('\n');
}

export async function materializeScenePlan(projectDirectory){
  const p=projectPaths(projectDirectory);
  const scenePlanPath=path.join(p.techDir,'SCENE_PLAN.json');
  if(!(await exists(scenePlanPath)))return{materialized:false};

  const [scenePlan,meta,plan,script]=await Promise.all([
    readJson(scenePlanPath),readJson(p.meta),readJson(p.contentPlan),readFile(p.script,'utf8')
  ]);
  const scenes=Array.isArray(scenePlan.scenes)?scenePlan.scenes:[];
  const isEditorialV9=Number(meta.visualPolicyVersion)>=9;
  if(isEditorialV9){
    const quality=validateEditorialScenes(scenes);
    if(!quality.passed)throw new Error('Bildplan V9 verletzt: '+quality.errors.slice(0,12).join(' | '));
  }
  if(!scenes.length)throw new Error('SCENE_PLAN enthält keine Szenen.');
  if(Number(meta.plannedImageCount)!==scenes.length)throw new Error(`SCENE_PLAN enthält ${scenes.length} Szenen, video.json erwartet ${meta.plannedImageCount}.`);
  if(!String(script).trim().startsWith(String(scenes[0]?.anchor??'').trim()))throw new Error('SCENE_PLAN Bild 01 stimmt nicht mit dem Skriptanfang überein.');

  const world=String(scenePlan.world??'').trim();
  if(world.length<80)throw new Error('SCENE_PLAN.world ist zu knapp.');
  const shots=Array.isArray(scenePlan.shots)&&scenePlan.shots.length?scenePlan.shots:DEFAULT_SHOTS;
  const motions=Array.isArray(scenePlan.motions)&&scenePlan.motions.length?scenePlan.motions:DEFAULT_MOTIONS;
  const groupPurpose=scenePlan.groupPurpose??{};
  const coverText=String(plan.titleCoverSystem?.coverConcept?.visibleText??'').trim();
  const coverVisual=String(scenePlan.coverVisual??'').trim();
  if(!coverText||!coverVisual)throw new Error('SCENE_PLAN braucht coverVisual und CONTENT_PLAN einen Covertext.');

  const duration=Number(meta.targetDurationSeconds);
  const coverHold=Number(scenePlan.coverHoldSeconds??2.0);
  const otherHold=scenes.length>1?(duration-coverHold)/(scenes.length-1):duration;
  // Keep verified word alignment on repeated compilation while the scene anchors remain unchanged.
  // Previously a recompile reset all timestamps to null and invalidated cached alignment.
  const previousMapping=await readJson(p.mapping,{images:[]});
  const previousByNumber=new Map((previousMapping.images??[]).map((item)=>[item.imageNumber,item]));
  const mapping={schemaVersion:2,images:[]};
  for(let i=0;i<scenes.length;i+=1){
    const n=i+1,scene=scenes[i],anchor=String(scene.anchor??'').trim();
    if(anchor.length<3)throw new Error(`SCENE_PLAN Szene ${n}: anchor fehlt.`);
    if(!script.includes(anchor))throw new Error(`SCENE_PLAN Szene ${n}: Anchor kommt nicht im Skript vor: ${anchor}`);
    const group=String(scene.group??'allgemein');
    const previous=previousByNumber.get(n);
    const keepAlignment=previous?.startAnchor===anchor&&Number.isFinite(previous.actualStartSeconds)
      &&previous.actualStartSeconds>=0&&Number.isFinite(previous.actualEndSeconds)
      &&previous.actualEndSeconds>previous.actualStartSeconds;
    mapping.images.push({
      imageNumber:n,
      imageFile:`Bild ${String(n).padStart(2,'0')}.png`,
      startAnchor:anchor,
      visualPurpose:isEditorialV9?String(scene.message).trim():String(groupPurpose[group]??`Bildmoment ${group}`),
      topicAnchor:isEditorialV9?`${group} – ${String(scene.message).trim()}`:`${group} – Bildmoment ${String(n).padStart(3,'0')}`,
      visualForm:isEditorialV9?String(scene.visualType):String(scene.shot??shots[i%shots.length]),
      ...(isEditorialV9?{visualType:String(scene.visualType),visibleLabels:i===0?[]:(scene.labels??[])}:{}),
      motionHint:String(scene.motion??motions[i%motions.length]),
      plannedHoldSeconds:Number((n===1?coverHold:otherHold).toFixed(3)),
      actualStartSeconds:keepAlignment?previous.actualStartSeconds:null,
      actualEndSeconds:keepAlignment?previous.actualEndSeconds:null,
      alignmentConfidence:keepAlignment?previous.alignmentConfidence:null
    });
  }
  await writeJson(p.mapping,mapping);

  const title=String(plan.titleCoverSystem?.finalTitle??meta.title??'Video');
  const header=isEditorialV9?[
    `# ALLE BILDPROMPTS — ${title}`,
    '',
    `Format: 16:9 · StrichModus Visual V9 · ${scenes.length} exakt geplante Bildmomente`,
    '',
    'Google Flow: je 5 Bilder vollständig erzeugen, sichtbare Inhalte auf Skriptpassung und Textfehler prüfen, fehlerhafte Bilder neu erzeugen, danach gesammelt importieren.',
    '',
    '## VERBINDLICHE BILDWELT FÜR JEDES BILD',
    '',
    world,
    '',
    EDITORIAL_WORLD_V9,
    '',
    'Jeder Bildtyp muss exakt zum gesprochenen Satz passen. Erklärgrafiken, Hierarchien, Diagramme und kurze deutsche Beschriftungen sind ausdrücklich erwünscht, wenn sie besser erklären. Personen nur bei echtem Erkenntniswert.',
    '',
    '---'
  ].join('\n'):[
    `# ALLE BILDPROMPTS — ${title}`,
    '',
    `Format: 16:9 · deutsche grotesk-surrealistische Stickman-Comicwelt · ${scenes.length} Bildmomente`,
    '',
    'Google Flow: immer in 5er-Blöcken erzeugen (01–05, 06–10 usw.). Einen Block komplett fertigstellen und prüfen, bevor der nächste beginnt. Währenddessen nichts einzeln herunterladen oder manuell umbenennen. Erst nach allen Bildern einmal gesammelt herunterladen und automatisch importieren.',
    '',
    '## VERBINDLICHE BILDWELT FÜR JEDES BILD',
    '',
    world,
    '',
    'Vollständig handgezeichneter 2D-Dark-Grotesque-Stickman-Comic: klare schwarze Konturen, große lesbare Formen, reduzierte Hintergründe, sichtbare Handlung statt Textkarten. Keine Pseudo-Schrift, kein Fotorealismus, kein 3D/Pixar, kein Wasserzeichen.',
    '',
    '---'
  ].join('\n');

  const blocks=scenes.map((scene,i)=>{
    const n=i+1,anchor=String(scene.anchor).trim(),shot=String(scene.shot??shots[i%shots.length]);
    if(isEditorialV9){
      const body=editorialPromptV9(scene,{number:n,world,shot,coverText,coverVisual});
      return `## Bild ${String(n).padStart(2,'0')}${n===1?' — COVER':''}\n${n===1?`ÜBERSCHRIFT: "${coverText}"\n`:''}BILDPROMPT:\n${body}`;
    }
    if(n===1){
      const body=`16:9. LEBENDIGE SZENE: Ein charakterstarker, groß gezeichneter ausdrucksvoller Stickman in klarer Handlung. ${STICKMAN_ANATOMY_RULE} ${coverVisual} Überschrift „${coverText}“ exakt einmal groß und kontrastreich, keine weitere Schrift. ${world} Klare schwarze Konturen, starke Silhouetten und reduzierte Umgebung. Kein Fotorealismus, kein 3D/Pixar, keine Pseudo-Schrift, kein Wasserzeichen.`;
      return `## Bild 01 — COVER\nÜBERSCHRIFT: "${coverText}"\nBILDPROMPT:\n${body}`;
    }
    const visual=String(scene.visual??scene.visualDescription??anchor).trim();
    const body=`16:9. LEBENDIGE SZENE: ${visual}. ${STICKMAN_ANATOMY_RULE} ${world} ${shot}. Kräftige individuelle Stickman-Figuren mit ausdrucksstarken Gesichtern, Gesten, filmischer Komposition und farbiger Umgebung. KEINE BILDSCHRIFT: absolut keine Buchstaben, Zahlen, Sprechblasen, Etiketten, englischen Wörter oder Pseudozeichen sichtbar. Alle Flächen auf Papier, Schildern oder Kleidung ohne Schrift. Kein Fotorealismus, 3D/Pixar oder Wasserzeichen.`;
    return `## Bild ${String(n).padStart(2,'0')}\nBILDPROMPT:\n${body}`;
  });
  await mkdir(path.dirname(p.prompt),{recursive:true});
  await writeFile(p.prompt,`${header}\n${blocks.join('\n\n')}\n`,'utf8');
  return{materialized:true,scenePlanPath,prompt:p.prompt,mapping:p.mapping,totalImages:scenes.length};
}
