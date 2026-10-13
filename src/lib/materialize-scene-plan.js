import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { exists, projectPaths, readJson, writeJson } from './pipeline.js';
import { STICKMAN_ANATOMY_RULE } from './stickman-style.js';

const DEFAULT_SHOTS=['Nahaufnahme','Halbtotale','POV','weite Totale','Detail','leichte Untersicht','Seitenansicht','symmetrische Ansicht'];
const DEFAULT_MOTIONS=['push-in','pan-right','focus-left','pull-out','drift-up','focus-right','pan-left','drift-down'];

export async function materializeScenePlan(projectDirectory){
  const p=projectPaths(projectDirectory);
  const scenePlanPath=path.join(p.techDir,'SCENE_PLAN.json');
  if(!(await exists(scenePlanPath)))return{materialized:false};

  const [scenePlan,meta,plan,script]=await Promise.all([
    readJson(scenePlanPath),readJson(p.meta),readJson(p.contentPlan),readFile(p.script,'utf8')
  ]);
  const scenes=Array.isArray(scenePlan.scenes)?scenePlan.scenes:[];
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
  const mapping={schemaVersion:2,images:[]};
  for(let i=0;i<scenes.length;i+=1){
    const n=i+1,scene=scenes[i],anchor=String(scene.anchor??'').trim();
    if(anchor.length<3)throw new Error(`SCENE_PLAN Szene ${n}: anchor fehlt.`);
    if(!script.includes(anchor))throw new Error(`SCENE_PLAN Szene ${n}: Anchor kommt nicht im Skript vor: ${anchor}`);
    const group=String(scene.group??'allgemein');
    mapping.images.push({
      imageNumber:n,
      imageFile:`Bild ${String(n).padStart(2,'0')}.png`,
      startAnchor:anchor,
      visualPurpose:String(groupPurpose[group]??`Bildmoment ${group}`),
      topicAnchor:`${group} – Bildmoment ${String(n).padStart(3,'0')}`,
      visualForm:String(scene.shot??shots[i%shots.length]),
      motionHint:String(scene.motion??motions[i%motions.length]),
      plannedHoldSeconds:Number((n===1?coverHold:otherHold).toFixed(3)),
      actualStartSeconds:null,
      actualEndSeconds:null,
      alignmentConfidence:null
    });
  }
  await writeJson(p.mapping,mapping);

  const title=String(plan.titleCoverSystem?.finalTitle??meta.title??'Video');
  const header=[
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
    if(n===1){
      const body=`16:9. ${STICKMAN_ANATOMY_RULE} ${coverVisual} Überschrift „${coverText}“ exakt einmal groß und kontrastreich, keine weitere Schrift. ${world} Klare schwarze Konturen, starke Silhouetten und reduzierte Umgebung. Kein Fotorealismus, kein 3D/Pixar, keine Pseudo-Schrift, kein Wasserzeichen.`;
      return `## Bild 01 — COVER\nÜBERSCHRIFT: "${coverText}"\nBILDPROMPT:\n${body}`;
    }
    const body=`16:9. ${STICKMAN_ANATOMY_RULE} ${world} Zeige konkret diesen Storymoment: „${anchor}“ als ${shot}. Sichtbare Handlung, passende überzeichnete Reaktion und klare räumliche Situation; Akzente in Rot, Gelb, Cyan oder Violett passend zur Szene. Keine Textkarte und keine zusätzliche Schrift außer wenn der Storymoment sie zwingend benötigt; dann nur korrektes Deutsch. Kein Fotorealismus, 3D/Pixar, Pseudo-Schrift oder Wasserzeichen.`;
    return `## Bild ${String(n).padStart(2,'0')}\nBILDPROMPT:\n${body}`;
  });
  await mkdir(path.dirname(p.prompt),{recursive:true});
  await writeFile(p.prompt,`${header}\n${blocks.join('\n\n')}\n`,'utf8');
  return{materialized:true,scenePlanPath,prompt:p.prompt,mapping:p.mapping,totalImages:scenes.length};
}
