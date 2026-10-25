import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { auditChapters, auditStoryCraft, auditTitle, storyMetrics } from '../src/lib/story-craft.js';
import { buildChapters } from '../src/cli/finalize.js';
import { composeWorldText, sceneWorldLines, validateVisualWorld } from '../src/lib/stickman-style.js';

const policy=JSON.parse(await readFile('config/content-policy.json','utf8'));

const goodScript=[
  'Auf deinem Schreibtisch liegt ein Ein-Dollar-Schein.',
  'Seine Seriennummer endet auf 4417. Um 7:10 Uhr ruft die Bank an. Eine Kundin, 81 Jahre alt, will 180.000 Dollar abheben. Bar. Du lachst. Noch.',
  'Du fährst los. Deine Regel lautet: Wer klingelt, ist nie der Kopf. Dein Partner hält dir zwei Kaffee hin. Du nimmst beide.',
  'Um 9 Uhr sitzt du in ihrer Küche. Sie zeigt dir die Nummer, die sie seit 3 Tagen anruft. Der Anrufer sagt, er sei vom FBI. Du bist vom FBI. Du warst es nicht.',
  'Um 13 Uhr ändert sich alles. Ein Kurier soll um 15 Uhr das Gold abholen. Du denkst: Wer klingelt, ist nie der Kopf. Aber vielleicht ist er die Tür.',
  'Um 15 Uhr klingelt es. Der Kurier ist 19. Er hält einen Ein-Dollar-Schein in der Hand. 4417. Du weißt jetzt: Wer klingelt, ist nie der Kopf – aber er hat dessen Nummer.',
  'Am Abend liegt der Ein-Dollar-Schein wieder auf deinem Schreibtisch. Diesmal in einer Beweistüte. Dein Telefon klingelt. Unterdrückte Nummer.'
].join('\n\n');

const goodPlan={
  storyEngine:{
    perspective:'du',
    protagonist:{start:'Routinierter Agent im Betrugsdezernat',want:'Das Gold der Frau retten',belief:'Nur der Kopf einer Bande zählt'},
    stakes:'Die Lebensersparnisse einer 81-jährigen Frau gehen um 15 Uhr verloren.',
    innerVoice:[{stage:'Start',line:'Deine Regel lautet: Wer klingelt, ist nie der Kopf'},{stage:'Zweifel',line:'Aber vielleicht ist er die Tür'},{stage:'Erkenntnis',line:'aber er hat dessen Nummer'}],
    turns:[
      {label:'Anruf',whatChanges:'Aus Routine wird ein Fall',concreteDetail:'180.000 Dollar in bar'},
      {label:'Küche',whatChanges:'Die Täter benutzen deinen Ausweis',concreteDetail:'Anrufer behauptet FBI zu sein'},
      {label:'Plan',whatChanges:'Ein Termin macht Druck',concreteDetail:'Kurier um 15 Uhr'},
      {label:'Übergabe',whatChanges:'Der Kurier ist ein Kind',concreteDetail:'19 Jahre, Dollarschein 4417'}
    ],
    callbackMotif:'Ein-Dollar-Schein'
  }
};

test('Story V10: Kennzahlen messen Du-Perspektive, Zahlen und Kurzsätze',()=>{
  const m=storyMetrics(goodScript);
  assert.ok(m.duPer100>=3,String(m.duPer100));
  assert.ok(m.numbersPer1000>=8,String(m.numbersPer1000));
  assert.ok(m.shortSentenceShare>=0.12,String(m.shortSentenceShare));
});

test('Story V10: gutes Skript mit innerer Stimme, Wendepunkten und Callback besteht',()=>{
  const r=auditStoryCraft(goodScript,goodPlan,policy);
  assert.equal(r.passed,true,r.errors.join(' | '));
});

test('Story V10: Vortragsfloskeln, Absicherungen und fehlender Callback fallen durch',()=>{
  const lecture='In diesem Video steigen wir durch die Hierarchie. Das ist natürlich kein Beweis. Das beweist aber noch nicht viel. Das bedeutet aber nicht, dass er schuldig ist. Ein Associate ist nicht automatisch ein Mitglied, und laut Unterlagen kann er trotzdem Einfluss haben.';
  const r=auditStoryCraft(lecture,{storyEngine:{...goodPlan.storyEngine,callbackMotif:'Goldbarren'}},policy);
  assert.equal(r.passed,false);
  const all=r.errors.join(' | ');
  assert.match(all,/Erklärfloskel/);
  assert.match(all,/Absicherungen/);
  assert.match(all,/Callback-Motiv/);
  assert.match(all,/innerVoice/);
});

test('Story V10: innere Stimme muss in Skript-Reihenfolge stehen',()=>{
  const reversed={storyEngine:{...goodPlan.storyEngine,innerVoice:[...goodPlan.storyEngine.innerVoice].reverse()}};
  assert.match(auditStoryCraft(goodScript,reversed,policy).errors.join(' | '),/Reihenfolge/);
});

test('Titel V10 folgt bewährten Formeln',()=>{
  for(const ok of ['POV: Du bist ein FBI-Agent und jemand benutzt deinen Namen','Dein Leben auf jeder Stufe beim SEK','Alle Ränge der Mafia erklärt – vom Laufburschen zum Boss','Ein Tag als FBI-Agent: Das Gold an der Haustür'])
    assert.equal(auditTitle(ok,policy).passed,true,ok);
  assert.equal(auditTitle('Die Hierarchie der Mafia erklärt – vom Außenstehenden bis zum Boss',policy).passed,false);
  assert.equal(auditTitle('In diesem Video: FBI',policy).passed,false);
});

const world={
  name:'Gold an der Haustür',
  look:'Spätherbst in einer Vorstadt von Phoenix: staubige Sonne, Jalousienschatten, abgegriffenes Papier und kaltes Neon im Büro.',
  palette:['Wüstenocker','Nachtblau','Goldgelb','Signalrot'],
  lighting:'Harte Mittagssonne draußen, grünliches Neon drinnen',
  locations:{
    buero:'Großraumbüro des FBI-Außenbüros mit grauen Trennwänden, Aktenstapeln und einer Wanduhr über der Tür.',
    kueche:'Kleine Küche mit gelben Fliesen, Kuckucksuhr, Teekanne und einem Stapel Kontoauszüge auf dem Tisch.',
    strasse:'Ruhige Vorstadtstraße mit Kakteen, Briefkästen und einem weißen Mietwagen am Bordstein.'
  },
  cast:{
    agent:{look:'Weißer runder Kopf, kurze schwarze Haare, dunkelblaues Sakko, Dienstmarke am Gürtel, müde Augen.',stages:{morgen:'Krawatte sauber gebunden, zwei Kaffeebecher',abend:'Krawatte offen, Hemd zerknittert'}},
    kurier:{look:'Sehr junger, schmaler Stickman mit Basecap, Kapuzenpulli und zu großem Rucksack.'}
  },
  motif:{object:'Ein-Dollar-Schein mit rot umkreister Seriennummer',meaning:'Erkennungscode der Bande, am Ende Beweismittel'}
};
const scenes=[
  {visualType:'detail',location:'buero',cast:[],motif:true,chapter:'Der Anruf'},
  {visualType:'szene',location:'kueche',cast:['agent'],stage:'morgen'},
  {visualType:'karte'},
  {visualType:'szene',location:'strasse',cast:['agent','kurier'],stage:'abend'},
  {visualType:'detail',location:'buero',motif:true,chapter:'Die Übergabe'}
];

test('Bildwelt V10: vollständige Welt mit Orten, Figurenstufen und Leitmotiv besteht',()=>{
  const r=validateVisualWorld(world,scenes);
  assert.equal(r.passed,true,r.errors.join(' | '));
  assert.match(composeWorldText(world),/BILDWELT „Gold an der Haustür“/);
  const lines=sceneWorldLines(world,scenes[3]).join('\n');
  assert.match(lines,/ORT: Ruhige Vorstadtstraße/);
  assert.match(lines,/agent – .*Jetzt: Krawatte offen/);
  assert.match(lines,/kurier – Sehr junger/);
  assert.match(sceneWorldLines(world,scenes[0]).join('\n'),/LEITMOTIV SICHTBAR/);
});

test('Bildwelt V10: fehlende Orte, unbekannte Figuren und fehlender Callback werden gemeldet',()=>{
  const broken=[{visualType:'szene',cast:['agent']},{visualType:'szene',location:'mond',cast:['geist']},{visualType:'detail',location:'buero',cast:['agent'],stage:'nacht'}];
  const all=validateVisualWorld({...world,locations:{buero:world.locations.buero}},broken).errors.join(' | ');
  assert.match(all,/mindestens 3 wiederkehrende Schauplätze/);
  assert.match(all,/braucht location/);
  assert.match(all,/unbekannte location „mond“/);
  assert.match(all,/unbekannte Figur „geist“/);
  assert.match(all,/keine Figur in cast hat die Stufe „nacht“/);
  assert.match(all,/motif muss im ersten und im letzten Zehntel/);
});

test('Kapitel V10: Plan verlangt Start bei Bild 01, Export nutzt echte Bildstarts',()=>{
  assert.equal(auditChapters(scenes,{minimum:2}).passed,true);
  assert.equal(auditChapters([{},{chapter:'Später'},{chapter:'Noch später'},{chapter:'Ende'}]).passed,false);
  const timeline=[{imageNumber:1,startFrame:0,endFrame:600},{imageNumber:2,startFrame:600,endFrame:1500},{imageNumber:3,startFrame:1500,endFrame:1560},{imageNumber:4,startFrame:1560,endFrame:3600}];
  const mapping=[{imageNumber:1,chapter:'Der Anruf'},{imageNumber:2,chapter:'Die Küche'},{imageNumber:3,chapter:'Zu kurz'},{imageNumber:4,chapter:'Die Übergabe'}];
  assert.deepEqual(buildChapters(mapping,timeline,30),['00:00 Der Anruf','00:20 Die Küche','00:50 Zu kurz']);
  assert.throws(()=>buildChapters(mapping.slice(1),timeline,30),/0:00/);
});

test('Google Flow V10 baut jedes Bild aus eigener Videowelt, sichtbaren Figuren und Mimik',async()=>{
  const { mkdtemp, mkdir, writeFile, rm }=await import('node:fs/promises');
  const os=await import('node:os'),path=await import('node:path');
  const { compileFlowPrompt }=await import('../src/cli/compile-flow-prompt.js');
  const tmp=await mkdtemp(path.join(os.tmpdir(),'stickman-world-v10-'));
  const planned=[
    {anchor:'Ein Schein liegt auf dem Tisch.',message:'Ein Schein ist das zentrale Beweisstück.',visualType:'detail',visual:'Nahaufnahme eines zerknitterten Ein-Dollar-Scheins auf gelbem Wachstuch im Morgenlicht',elements:['zerknitterter Schein','gelbes Wachstuch'],labels:[],location:'buero',motif:true,chapter:'Der Schein'},
    {anchor:'Du kommst ins Büro.',message:'Der Agent beginnt seinen Tag im Büro.',visualType:'szene',visual:'Der Agent balanciert zwei Kaffeebecher durch das neonbeleuchtete Großraumbüro',elements:['zwei Kaffeebecher','neonbeleuchtete Trennwände'],labels:[],location:'buero',cast:['agent'],stage:'morgen',chapter:'Das Büro'},
    {anchor:'Der Kurier klingelt.',message:'Der Kurier steht an der Haustür.',visualType:'szene',visual:'Ein junger Kurier mit Basecap drückt nervös auf eine Messingklingel neben einer grünen Tür',elements:['Messingklingel','grüne Haustür'],labels:[],location:'strasse',cast:['kurier']},
    {anchor:'Am Ende liegt der Schein in der Tüte.',message:'Der Schein wird zum Beweismittel.',visualType:'detail',visual:'Der Schein steckt in einer durchsichtigen Beweistüte mit rotem Siegelstreifen auf dem Schreibtisch',elements:['Beweistüte','roter Siegelstreifen'],labels:[],location:'buero',motif:true,chapter:'Die Tüte'}
  ];
  try{
    const tech=path.join(tmp,'99-tech');
    await mkdir(tech,{recursive:true});await mkdir(path.join(tmp,'01-script'),{recursive:true});
    await writeFile(path.join(tech,'video.json'),JSON.stringify({videoId:'test-v10',visualPolicyVersion:10,plannedImageCount:planned.length,targetDurationSeconds:12,title:'Test'}));
    await writeFile(path.join(tech,'CONTENT_PLAN.json'),JSON.stringify({titleCoverSystem:{finalTitle:'Test',coverConcept:{visibleText:'FALSCHES FBI'}}}));
    await writeFile(path.join(tmp,'01-script','voice-script.txt'),planned.map(s=>s.anchor).join(' '));
    await writeFile(path.join(tech,'SCENE_PLAN.json'),JSON.stringify({visualWorld:world,coverVisual:'Schein im Scheinwerferlicht.',scenes:planned}));
    await compileFlowPrompt(tmp);
    const prompt=await readFile(path.join(tmp,'00-bildprompts','99-alle-bildprompts.txt'),'utf8');
    const blocks=prompt.split(/\n(?=## Bild \d{2,3}\b)/).filter(x=>/^## Bild/.test(x));
    assert.match(prompt,/StrichModus Visual V10/);
    assert.doesNotMatch(prompt,/feste Grundpalette/);
    assert.match(blocks[1],/ORT: Großraumbüro/);
    assert.match(blocks[1],/FIGUREN: agent – .*Jetzt: Krawatte sauber gebunden/);
    assert.match(blocks[1],/MIMIK V10/);
    assert.doesNotMatch(blocks[1],/kurier – /);
    assert.match(blocks[2],/FIGUREN: kurier – /);
    assert.match(blocks[3],/LEITMOTIV SICHTBAR: Ein-Dollar-Schein/);
    const map=JSON.parse(await readFile(path.join(tech,'IMAGE_AUDIO_MAP.json'),'utf8'));
    assert.deepEqual(map.images.map(x=>x.chapter??null),['Der Schein','Das Büro',null,'Die Tüte']);
    await writeFile(path.join(tech,'SCENE_PLAN.json'),JSON.stringify({visualWorld:{...world,locations:{}},coverVisual:'x',scenes:planned}));
    await assert.rejects(compileFlowPrompt(tmp),/Bildwelt V10 verletzt/);
  }finally{await rm(tmp,{recursive:true,force:true});}
});

test('Themencheck V10 kennt POV- und Stufenformeln der Vorbilder',async()=>{
  const { evaluateTopicQuality,evaluateChannelFit }=await import('../src/cli/check-topic.js');
  for(const t of ['POV: Du bist Zollfahnder im Hamburger Hafen','POV: Du wirst Finanzagent und wäschst Geld, ohne es zu merken','So jagt dich das BKA bei jedem Verbrechen','Dein Leben auf jeder Stufe beim SEK']){
    assert.equal((await evaluateTopicQuality(t)).decision,'APPROVED_TOPIC_QUALITY',t);
    assert.equal((await evaluateChannelFit(t)).decision,'APPROVED_CHANNEL_FIT',t);
  }
  assert.equal((await evaluateTopicQuality('POV: Du bist ein Drache')).decision,'REVIEW_TOPIC_QUALITY');
});
