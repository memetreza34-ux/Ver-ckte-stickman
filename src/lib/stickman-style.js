// Verbindlicher Stil-Check ab Visual Policy V7. Prüft Texte, nicht generierte Pixel.
export const STICKMAN_POLICY_VERSION=7;
export const STICKMAN_ANATOMY_RULE="STICKMAN-ANATOMIE: ALLE SICHTBAREN PERSONEN SIND KLASSISCHE STRICHMÄNNCHEN. Einfacher Kreis- oder Ovalkopf, Gesicht nur mit Punktaugen und Strichmund. Der Rumpf ist ein einzelner dünner schwarzer Strich. Stricharme und Strichbeine sind jeweils dünne einzelne schwarze Linien, keine anatomisch modellierten Schultern, Arme, Hände, Oberschenkel oder Körper. Kleidung nur flache kleine Farbsymbole an Strichkörpern, NIEMALS als Körpervolumen. KEINE NORMALEN COMIC-MENSCHEN, KEINE VOLUMINÖSEN MENSCHENKÖRPER, kein Anime, keine realistischen Gesichter, keine halb-realistischen Cartoonfiguren. Auch in einem detailreichen Raum müssen Stricharme und Strichbeine eindeutig als Linien erkennbar bleiben.";
export function auditStickmanPrompts(blocks){
  const errors=[];
  for(let i=0;i<blocks.length;i++){
    const body=String(blocks[i].split(/BILDPROMPT:\s*\n/i)[1]??'');
    const number=String(i+1).padStart(2,'0');
    if(!body.includes('STICKMAN-ANATOMIE:'))errors.push('Bild '+number+': verbindliche STICKMAN-ANATOMIE fehlt.');
    for(const token of ['Stricharme','Strichbeine','einzelner dünner schwarzer Strich','KEINE NORMALEN COMIC-MENSCHEN','KEINE VOLUMINÖSEN MENSCHENKÖRPER']){
      if(!body.includes(token))errors.push('Bild '+number+': Stickman-Vorgabe fehlt: '+token);
    }
  }
  return {passed:errors.length===0,errors,total:blocks.length};
}
