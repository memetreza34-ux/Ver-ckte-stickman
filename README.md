# Verückte Stickman — Video-Pipeline V2.7

Pipeline für einen deutschen faceless YouTube-Kanal mit grotesk-surrealer Stickman-Bildwelt und **formatbewusstem Entertainment-Scripting**.

## Neue Kernregel

**Erst Skriptformat wählen, dann schreiben.**

Es gibt drei Formate:

- `mini-stories` → mehrere verrückte Fälle, Regeln, Kategorien oder Orte
- `progression` → Stufen, Ränge, Level, Aufstieg, Evolution
- `story` → eine zusammenhängende Handlung mit Ziel, Problem und Payoff

Nicht jedes Video wird in eine große Story gezwängt.

Details: `youtube/CONTENT_SYSTEM.md`.

## Content-Modi

- `frei-surreal` → freie Unterhaltung, keine Recherchepflicht
- `hybrid` → reale Kulisse + Erfindung; nur reale Behauptungen intern belegen
- `real` → reale Tatsachen; Recherche Pflicht

## Projektstruktur

```text
00-bildprompts/     → fertige Google-Flow-Bildprompts + 5er-Batches
01-script/          → finales Voice-over-Skript
02-audio/           → finale Voice-over-Datei
03-bilder/          → Bild 01.png bis Bild NN.png
04-export/          → Video + Thumbnail + YouTube-Uploadtext
99-tech/            → interne Formatplanung, Mapping und Renderdaten
```

## Produktionslogik

1. Thema prüfen
2. Projekt erstellen
3. `scriptFormat` wählen und begründen
4. passendes `formatPlan` ausfüllen
5. Hook + Intro + Voice-over schreiben
6. Titel/Cover + YouTube-Beschreibung planen
7. Bildprompts erzeugen
8. Flow in 5er-Batches
9. Bilder gesammelt importieren
10. Audio → Alignment → Timeline → Render → QC

## Bilddichte

Richtwert: etwa **30–42 Bildmomente pro 100 Sekunden**, adaptiv. Mehr Bilder besonders bei neuer Information, neuer Stufe, neuem Fall, Action, Konsequenz, Regelwechsel oder Transformation.

## Cover

`Bild 01` ist Cover + erste Szene. Immer kurze deutsche Überschrift mit 1–4 Wörtern. Im Intro nur kurz halten.

## Export

```text
04-export/FINAL_VIDEO.mp4
04-export/THUMBNAIL.png
04-export/YOUTUBE_UPLOAD.txt
```

## Start

```bash
npm install
npm run topic:video -- --topic "THEMA"
npm run create:video -- --topic "THEMA" --title "ARBEITSTITEL" --week "2026-KW40" --slug "mein-video"
# CONTENT_PLAN: scriptFormat + passendes formatPlan ausfüllen
npm run validate:phase1 -- --dir "youtube/<week>/<slug>"
npm run compile:flow -- --dir "youtube/<week>/<slug>"
```

Nach Sammeldownload der Bilder:

```bash
npm run import:flow-images -- --dir "youtube/<week>/<slug>" --source "/PFAD/ZUM/DOWNLOAD-ORDNER"
npm run validate:assets -- --dir "youtube/<week>/<slug>"
npm run phase3 -- --dir "youtube/<week>/<slug>"
```
