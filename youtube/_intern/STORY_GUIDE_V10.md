# Story-Guide V10: So schreibt StrichModus

Grundlage: `KONKURRENZ_ANALYSE_2026-10.md`. Geprüft wird automatisch über `npm run validate:phase1` (Projekte mit `contentPolicyVersion` 10).

## Der Kern in einem Satz

**Du erlebst eine echte Welt als Hauptfigur, die sich verändert, und jede Information kommt als Moment mit Folge.**

## 1. Vor dem Schreiben: die Story-Maschine planen

Fülle `CONTENT_PLAN.storyEngine` aus, bevor du den ersten Satz schreibst.

| Feld | Frage | Beispiel (Zollfahnder im Hafen) |
|---|---|---|
| `perspective` | Wer ist die Hauptfigur? | `du` |
| `protagonist.start` | Wo stehst du am Anfang? | Neuer Zollfahnder, glaubt an Papiere und Stempel |
| `protagonist.want` | Was willst du? | Den einen Container finden, bevor er den Hafen verlässt |
| `protagonist.belief` | Welche Überzeugung wird getestet? | „Wer die Papiere kennt, kennt die Ladung.“ |
| `stakes` | Was geht verloren, wenn du scheiterst? | 400 Kilo Kokain verschwinden in 6 Stunden in der Stadt |
| `clock` | Gibt es eine Uhr? | Das Schiff legt um 4:00 Uhr ab |
| `innerVoice` | Welcher Satz kehrt wieder und verändert sich? | Regel → Zweifel → Einsicht → Wandel |
| `turns` | Wo ändert sich Lage, Status oder Risiko? | mindestens 4, jeweils mit konkretem Detail |
| `callbackMotif` | Welches Bild vom Anfang kehrt am Ende zurück? | Ein Bananenkarton mit einem Kreidekreuz |

## 2. Die acht Schreibregeln

1. **Erster Satz = Bild.** Ort, Gegenstand oder Uhrzeit, höchstens 18 Wörter. Kein Überblick, keine Frage ans Publikum.
   - Schwach: „Bei der Mafia steht oben ein Boss.“
   - Stark: „Hamburg, Waltershof, 2:14 Uhr. Ein Container summt.“
2. **Vorahnung früh.** Spätestens im zweiten Absatz andeuten, was passieren wird: „Du hältst das für Routine. Noch.“
3. **Innere Stimme in mindestens drei Stufen.** Derselbe Satz, jedes Mal mit neuer Bedeutung. Die Sätze stehen wörtlich im Skript und in `storyEngine.innerVoice`.
4. **Ein Moment pro Station.** Jede Station braucht einen Gegenstand, einen Betrag, eine Uhrzeit oder einen Satz einer Nebenfigur, den man nach dem Video noch weiß.
5. **Wendepunkte statt Liste.** Nicht „Die nächste Stufe ist …“, sondern: Was ändert sich für dich? Mehr Macht, mehr Risiko, neue Lüge?
6. **Fakten erleben lassen.** Statt „Laut Behörden werden Container gescannt“: „Der Scanner färbt den Container blau. Zwischen den Bananen: ein Rechteck, das zu schwer ist.“
7. **Höchstens eine kurze Einordnung im Skript.** Quellen, Fiktionshinweis und Hotline gehören in die Beschreibung.
8. **Ende = Anfang verwandelt.** Das Eröffnungsbild kehrt mit neuer Bedeutung zurück. Danach höchstens ein Satz.

## 3. Rhythmus

- Mischung: normale Sätze (10–16 Wörter) plus harte Kurzsätze (2–6 Wörter). Mindestens 12 % Kurzsätze, sonst klingt es vorgelesen monoton.
- Kurzsätze an Wendepunkten: „Er klingelt.“ / „Nie.“ / „Noch nicht.“
- Laut vorlesen. Wo die Stimme stockt, umbauen.

## 4. Verboten und unerwünscht

Verboten (Phase 1 schlägt fehl): „In diesem Video“, „Heute schauen wir …“, „Wir steigen …“, „Als Erstes musst du verstehen“, „Damit kommen wir zu“, „Und jetzt wird es interessant“, „Ein interessanter Gedanke“, „Wichtig ist:“, „Kurz gesagt“, „Wusstest du“, „Willkommen …“.

Absicherungen, höchstens 3 pro 1000 Wörter: „beweist noch nicht“, „natürlich kein …“, „das bedeutet aber nicht“, „nicht automatisch“, „laut Unterlagen“.

Warnung: „Stell dir vor“, „eigentlich“, „übrigens“, „spannend“.

## 5. Bildwelt pro Video (`SCENE_PLAN.visualWorld`)

- `look`: Stimmung und Material genau dieses Videos, z. B. „Nebelnacht im Containerhafen, Natriumlicht, nasser Asphalt, Rost“.
- `palette`: 3–6 Farben, `lighting`: Licht je Ort oder Akt.
- `locations`: mindestens 3 wiederkehrende Schauplätze mit festen Details (der gleiche Kran, das gleiche Büro).
- `cast`: Figuren mit `look` und `stages`. **Der Status steht in der Kleidung:** Warnweste → Zivil → Einsatzjacke.
- `motif`: das Leitmotiv, sichtbar im ersten und letzten Zehntel der Bilder (`motif: true`).
- Jede Szene vom Typ `szene` oder `detail` hat `location`. Figuren stehen in `cast`, die Stufe in `stage` (Text oder `{figur: stufe}`).
- `chapter` an der ersten Szene jedes Abschnitts, das erste Kapitel an Bild 01.

## 6. Titel, Cover, Beschreibung

- Titel nach einer Formel aus `content-policy.titleCoverPolicy.titleFormulas`: „POV: Du bist …“, „Dein Leben auf jeder Stufe …“, „Alle Ränge …“, „So jagt/fühlt/funktioniert …“, „Ein Tag als …“. 25–70 Zeichen.
- Cover: 1–3 Wörter, eine bis zwei Figuren mit extremer Emotion oder ein bildfüllendes Symbolobjekt, Statuskontrast.
- Beschreibung: Absatz 1 als Teaser mit 2–3 konkreten Momenten, Absatz 2 mit Einordnung echt/dramatisiert und Quellen. Die Kapitel setzt der Export automatisch ein. Danach genau 5 Hashtags. `youtubeUpload.tags`: 8–20 Suchbegriffe.

## 7. Checkliste vor Flow

- [ ] `storyEngine` vollständig, innere Stimme und Callback wörtlich im Skript
- [ ] `npm run validate:phase1` ohne Fehler und Warnungen gelesen
- [ ] Skript einmal laut vorgelesen
- [ ] `visualWorld` beschreibt eine Welt, die es nur in diesem Video gibt
- [ ] Titel und Cover ergänzen sich, Cover ≤ 3 Wörter
