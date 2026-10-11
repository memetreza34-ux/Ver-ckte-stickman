// Qualitätskontrolle für die gemeinsame YouTube-Caption-Datei.
export function validateYouTubeDescription(description,options={}){
  const minimumBodyCharacters=Number(options.minimumBodyCharacters??450);
  const minimumParagraphs=Number(options.minimumParagraphs??2);
  const requiredHashtags=Number(options.requiredHashtags??5);
  const source=String(description??'').trim();
  const errors=[];
  const lines=source.split(/\r?\n/).map((line)=>line.trim()).filter(Boolean);
  const hashtagLine=lines.at(-1)??'';
  const hashtags=[...source.matchAll(/(?:^|\s)(#[\p{L}\p{N}_]+)/gu)].map((match)=>match[1]);
  const lastLineTokens=hashtagLine.split(/\s+/).filter(Boolean);
  const hasExactLastLine=lastLineTokens.length===requiredHashtags&&lastLineTokens.every((tag)=>/^#[\p{L}\p{N}_]+$/u.test(tag));
  const body=hasExactLastLine?source.slice(0,source.lastIndexOf(hashtagLine)).trim():source;
  const paragraphs=body.split(/\n\s*\n/).map((x)=>x.trim()).filter(Boolean);
  if(body.length<minimumBodyCharacters)errors.push(`YouTube-Beschreibung: mindestens ${minimumBodyCharacters} Zeichen Fließtext ohne Hashtags erforderlich (aktuell ${body.length}).`);
  if(paragraphs.length<minimumParagraphs)errors.push(`YouTube-Beschreibung: mindestens ${minimumParagraphs} inhaltliche Absätze erforderlich.`);
  if(!hasExactLastLine)errors.push(`YouTube-Beschreibung: letzte Zeile muss genau ${requiredHashtags} Hashtags enthalten.`);
  if(hashtags.length!==requiredHashtags)errors.push(`YouTube-Beschreibung: genau ${requiredHashtags} Hashtags insgesamt erforderlich (aktuell ${hashtags.length}).`);
  if(new Set(hashtags.map((tag)=>tag.toLocaleLowerCase('de-DE'))).size!==hashtags.length)errors.push('YouTube-Beschreibung: Hashtags dürfen sich nicht wiederholen.');
  return{passed:errors.length===0,errors,body,hashtags};
}
