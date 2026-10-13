## Keine Texttafeln oder englischen Flow-Bildbeschriftungen

- Das **Bild** erzählt mit Mimik, Gestik, Rollenaccessoires und Handlung; das Voice-over nennt Rangnamen und Fakten.
- Bild 01: genau eine kurze gut lesbare deutsche Überschrift, wie im CONTENT_PLAN vorgegeben.
- Ab Bild 02: absolut keine sichtbaren Buchstaben, Zahlen, Zeichen, Rangetiketten, Bildschirmtexte, Sprechblasen oder Pseudo-Schrift. Auch kein englischer oder italienischer Rangname.
- Alle bildgenerierenden Anweisungen sind auf Deutsch; Fachwörter im Prompt dienen nur zur Einordnung, nicht als Bildtext.
- Figuren groß und wiedererkennbar; Blickkontakt, Entscheidungen, unterschiedliche Handlungen und wechselnde Kamera statt identischen kleinen Stickmen auf weißen Charts.
- In jedem 5er-Block mindestens vier lebendige Szenen mit Figuren, höchstens ein textfreies abstrahiertes Schaubild.
- Generierte Bilder visuell prüfen; falsch beschriftete, textlastige, steife oder nicht-stiltreue Bilder neu erzeugen. Das kann nicht allein durch einen Prompt-Texttest garantiert werden.

## Bildwelt V8 – verbindlich

StrichModus bedeutet charaktervolle, lebendige Strichmännchen in echten Szenen – keine Präsentation aus Schaubildern. Jeder Haupt-Stickman muss über kleinen Farbakzent, Gesicht, Pose und wiederkehrende Requisite sofort wiedererkennbar sein. Pro 5er-Block mindestens 4 dramatisierte, figurengetragene Alltagsszenen. Weniger als 15 % textfreie Schema-Metaphern über das Gesamtvideo.

Bild 01: nur 1–4 GROSS lesbare deutsche Wörter. Ab Bild 02: KEINE BILDSCHRIFT, keine englischen Begriffe, keine Zahlen, keine Schildertexte, keine Infografik-Beschriftungen, keine Pseudo-Schrift. Rang/Struktur in Szenen durch Größenunterschied, Haltung, Beziehungen und Requisiten vermitteln. Sprecher erläutert die Inhalte.

Es gilt weiter echte Stickman-Anatomie V7. Google Flow muss nach jedem Fünferblock auf Bilderzahl, Fehler, Figuren, Ausdruck, lebendige Situation und Schriftfreiheit visuell geprüft werden. Fehlerhafte/fehlende Bilder neu erzeugen. Nicht einzeln herunterladen, sondern am Ende gesammelt importieren.

## Bildwelt ab Visual-Policy V7 – verpflichtend

- **StrichModus zeigt nur klassische Strichmännchen.** Ein einfacher Kreis-/Ovalkopf, ein Rumpfstrich, Stricharme, Strichbeine. Kleidung und Requisiten flach, kein voll gezeichneter menschlicher Cartoonkörper.
- In **jedem** Einzelprompt steht die vollständige STICKMAN-ANATOMIE-Anweisung, nicht nur einmal oben in der Masterdatei.
- Der Flow-Compiler lehnt bei neu erstellten V7-Projekten fehlende Strichmännchen-Prompts ab.
- Bei Google Flow nach jedem 5er-Block **jedes tatsächliche Bild anschauen**: erkennbare Strichfigur? keine breiten menschlichen Arme/Beine, kein modelliertes Gesicht? Wenn nicht, falsch und erneut erzeugen. Textprüfung allein kann die Bildqualität nicht sicherstellen.
- Bei der Unsichtbar-Komödie: Hauptfigur bis Mitternacht ohne Kopf/Haut, vereinfachte flache Kleidung statt voluminöser menschlicher Körper; alle sichtbaren Nebenfiguren reine Strichmännchen.

# Workflow V9

## Priorität 1 — Lernen vor Geschwindigkeit

Nach dem fertigen Export erstellt der Finalizer einen Review. Erkenntnisse werden in einem globalen Log gespeichert und vor dem nächsten Video als Lernbrief übernommen. Eine menschliche bzw. tatsächliche audiovisuelle Prüfung ergänzt die Messwerte. Details in `CONTINUOUS_IMPROVEMENT.md`.

## Phase 0 — Thema

1. `npm run topic:video -- --topic "THEMA"`
2. Standard: faszinierende **reale** Rollen/Institutionen/Geschichte/Strukturen; etwa `Ein Tag als FBI-Agent`, `Ein Tag im Bundestag`, `Ein Tag im antiken Rom`, `Die Hierarchie einer Mafia erklärt`.
3. Typ `Ein Tag ...`: glaubwürdige Tagesstationen und typische Aufgaben. Typ `Struktur erklärt`: belegte Ebenen, Funktionen, Entscheidungswege, echte Unterschiede. Keine automatisch erfundene Mission.
4. Fantasie, Unsichtbarkeit und Superkraft-Themen nur mit ausdrücklicher Sonderfreigabe; kein Normalfall.
5. Vor Skripterstellung Land/Zeit, reale Rollen, Quellenlage und Fiktion-gegen-Fakten prüfen. Standardinhalt ist `hybrid` mit Recherchepflicht.


## Phase 0A — Schauplatz und deutsche Lebenswelt

- Standard: Deutschland. Bei Thema ohne ausdrückliches Ausland deutsche Orte, Währung, Alltagsdetails und passende deutsche Rollen bevorzugen
- Behörde und Zuständigkeit vor Skriptbeginn prüfen (z. B. BKA, LKA, Kripo, SEK, Zoll, Bundespolizei)
- Deutsche Gesetze und Dienstregeln nur bei überprüfbaren Angaben als Tatsachen erzählen
- Deutsche Alltagsklischees dosiert als Situationshumor einsetzen
- Bei FBI/CIA den Schauplatz USA beibehalten; keine amerikanische Behörde in eine falsche deutsche Kulisse versetzen
- In Phase 1 die gewählte Institution und die Grenze zwischen Tatsachen/Fiktion dokumentieren

## Phase 1 — Skriptformat wählen

Vor dem Schreiben wird in `99-tech/CONTENT_PLAN.json` `scriptFormat.type` gesetzt:

- `mini-stories`
- `progression`
- `story`

Dazu `reason` und `whyThisFormat` ausfüllen.

### mini-stories
Ideal für `Ein Tag als ...`, `Ein Tag im antiken Rom` oder `Ein Tag im Parlament`, wenn der Tag aus mehreren belegbar typischen Stationen besteht.

Beispiel:

```text
Briefing → Ausrüstung → erste Aufgabe → Überwachung → schwieriger Einsatz → Rückkehr
```

Pflicht: `formatPlan.miniStories.orderingLogic` + mindestens 4 starke `sections`.

### progression
Nutzen für belegte Ränge, reale Hierarchien, Mafia-/Kartell-Aufbau, Verantwortungsebenen und Institutionen.

Pflicht: `axis`, `startState`, `endState` + mindestens 4 echte `stages`.

### story
Nur nutzen, wenn es einen belegten Fall oder eine realistische zusammenhängende Handlung gibt. Illustrative Dramatisierung klar von Tatsachen trennen.

Pflicht: Ziel, Problem, Auslöser, mindestens 4 kausale Wendungen, Midpoint, Finale, Setup/Payoff, Callback + mindestens 6 Beats.

## Phase 1B — Einleitung

- Titel-/Cover-Versprechen sofort bestätigen.
- Bei Rollen-Videos Zuschauer direkt in Rolle, Briefing oder erste Aufgabe setzen.
- Kein langer Berufs-Steckbrief vor der ersten Handlung.
- Kein Begrüßungsblock.
- Cover maximal kurz halten.
- Mindestens 4 Bildmomente in den ersten ~10 Sekunden planen.

## Phase 1C — Hauptteil und Schluss

- gesprochenes natürliches Deutsch
- klare Tätigkeiten und Situationen statt Referat
- Einleitung → Hauptteil → Schluss sichtbar planen
- neue Aufgabe, Ort, Risiko, Entscheidung oder Konsequenz hält das Video in Bewegung
- keine künstliche Dauerdramatik
- keine Produktions-/Quellenhinweise im Voice-over

Qualitätsfragen:

```text
Ein-Tag/mini-stories → Will ich die nächste Station sehen?
progression          → Will ich die nächste Stufe sehen?
story                → Will ich wissen, was als Nächstes passiert?
```

Danach:

```bash
npm run validate:phase1 -- --dir "youtube/..."
```

## Phase 2 — Bilder

- Bild 01 = Cover + erste Szene
- 30–42 Bildmomente pro 100 Sekunden als Richtwert, adaptiv
- neues Bild bei neuer Aufgabe, Information, Stufe, Handlung, Konsequenz, Ort oder Transformation

Flow:

```bash
npm run compile:flow -- --dir "youtube/..."
```

Es entstehen 5er-Batches. Immer einen kompletten 5er-Block erzeugen, dann den nächsten. Nichts einzeln herunterladen oder manuell umbenennen.

Wenn alle Bilder fertig sind: einmal gesammelt herunterladen und importieren:

```bash
npm run import:flow-images -- --dir "youtube/..." --source "/PFAD/ZUM/DOWNLOAD"
```

## Phase 3 — Produktion

Genau eine finale Voice-over-Datei nach `02-audio/`.

```bash
npm run validate:assets -- --dir "youtube/..."
npm run phase3 -- --dir "youtube/..."
```

Whisper erzeugt echte Wortzeiten aus dem finalen optimierten Voice-over. Daraus wird das komplette zeitcodierte Skript erzeugt; Zeiten werden niemals geschätzt.

Danach enthält `04-export/` mindestens:

```text
FINAL_VIDEO.mp4
THUMBNAIL.png
YOUTUBE_CAPTION.txt
UNTERTITEL_SCRIPT.txt
```

`YOUTUBE_CAPTION.txt` enthält Titel + Beschreibung gemeinsam.

Für jedes neue Video: mindestens 450 Zeichen eigentliche Beschreibung in mindestens zwei Absätzen, mit konkretem Inhalt statt Floskeln. Danach genau **5 unterschiedliche, thematisch passende Hashtags** in einer separaten letzten Zeile. Phase-1-QC und Finalizer kontrollieren Länge und Anzahl.

`UNTERTITEL_SCRIPT.txt` enthält das komplette gesprochene Skript in 10-Sekunden-Blöcken, zum Beispiel:

```text
[00:00 - 00:10]
Gesprochener Text ...

[00:10 - 00:20]
Gesprochener Text ...
```
