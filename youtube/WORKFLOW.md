# Workflow V9

## Phase 0 — Thema

1. `npm run topic:video -- --topic "THEMA"`
2. Bevorzugt konkrete Rollen-/Lebenswelt-Themen wie `Ein Tag als FBI-Agent`, `Ein Tag als CIA-Agent`, SWAT, Geheimdienst, Undercover oder echte Hierarchien/Progressionen.
3. Reine surreale Regelwelten sind optional, aber nicht mehr Standard.
4. Langweilige Referats-Themen werden verworfen oder in eine Rolle, einen Tag, einen Einsatz oder eine Progression umgebaut.

Bei realen Institutionen startet das Projekt im Modus `hybrid`: reale Tatsachen intern belegen, dramatische Verbindungsszenen dürfen erfunden sein.

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
Ideal für `Ein Tag als ...`, wenn der Tag aus mehreren klaren Stationen besteht.

Beispiel:

```text
Briefing → Ausrüstung → erste Aufgabe → Überwachung → schwieriger Einsatz → Rückkehr
```

Pflicht: `formatPlan.miniStories.orderingLogic` + mindestens 4 starke `sections`.

### progression
Nutzen für Ränge, Level, Stufen, Aufstieg oder Hierarchien.

Pflicht: `axis`, `startState`, `endState` + mindestens 4 echte `stages`.

### story
Nur nutzen, wenn das Thema wirklich eine zusammenhängende Mission/Handlung trägt.

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

`UNTERTITEL_SCRIPT.txt` enthält das komplette gesprochene Skript in 10-Sekunden-Blöcken, zum Beispiel:

```text
[00:00 - 00:10]
Gesprochener Text ...

[00:10 - 00:20]
Gesprochener Text ...
```
