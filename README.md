# Verückte Stickman — Video-Pipeline V2.6

Pipeline für einen deutschen faceless YouTube-Kanal mit grotesk-surrealer Stickman-Bildwelt und **Story-first Entertainment**.

## Kernregel

**Unterhaltung zuerst, Klarheit sofort.** Das Standardvideo darf komplett erfunden sein. Recherche ist nur Pflicht, wenn reale Tatsachen behauptet werden.

Der bevorzugte Modus ist `frei-surreal`:

```text
starke Prämisse
→ klarer Hook
→ Ziel
→ Problem
→ Eskalation
→ Midpoint-Turn
→ Finale
→ Payoff / Callback
```

## Intro-Gate

Die ersten etwa 10 Sekunden müssen verständlich machen:

- Situation
- ungewöhnliche Regel oder Anomalie
- Gefahr/Ziel
- nächsten Handlungsschritt

Zusätzlich:
- mindestens 4 Bildstarts in den ersten 10 Sekunden
- Cover/Bild 01 maximal ca. 2,2 Sekunden
- kein Intro-Bild unnötig lange halten

## Projektstruktur

```text
00-bildprompts/     → fertige Google-Flow-Bildprompts + 5er-Batches
01-script/          → finales Voice-over-Skript
02-audio/           → finale Voice-over-Datei
03-bilder/          → Bild 01.png bis Bild NN.png
04-export/          → Video + Thumbnail + YouTube-Uploadtext
99-tech/            → interne Storyplanung, Mapping und Renderdaten
```

## Google Flow

```bash
npm run compile:flow -- --dir "youtube/<week>/<slug>"
```

Erzeugt 5er-Blöcke:

```text
00-bildprompts/5er-batches/
01-bilder-01-05.txt
02-bilder-06-10.txt
...
BATCH_MANIFEST.json
```

Bilder erst komplett erzeugen, danach einmal gesammelt herunterladen und automatisch importieren:

```bash
npm run import:flow-images -- --dir "youtube/<week>/<slug>" --source "/PFAD/ZUM/DOWNLOAD-ORDNER"
```

Kein einzelnes Downloaden, kein manuelles Umbenennen.

## Bilddichte

Richtwert: etwa **30–42 Bildmomente pro 100 Sekunden**.

Mehr Bilder nicht pauschal, sondern gezielt an Hook, Action, schwierigen Erklärstellen, Twists, Regelwechseln und Transformationen.

## Cover

`Bild 01` ist Cover + erste Szene. Immer eine kurze deutsche Überschrift mit 1–4 Wörtern.

## YouTube-Export

Nach erfolgreichem Finalisieren enthält `04-export/`:

```text
FINAL_VIDEO.mp4
THUMBNAIL.png
YOUTUBE_UPLOAD.txt
```

`YOUTUBE_UPLOAD.txt` enthält den finalen YouTube-Titel und die fertige Videobeschreibung.

## Start

```bash
npm install
npm run topic:video -- --topic "THEMA"
npm run create:video -- --topic "THEMA" --title "ARBEITSTITEL" --week "2026-KW40" --slug "mein-video"
npm run validate:phase1 -- --dir "youtube/<week>/<slug>"
```

Nach Bildern + Audio:

```bash
npm run validate:assets -- --dir "youtube/<week>/<slug>"
npm run phase3 -- --dir "youtube/<week>/<slug>"
```

Details: `youtube/WORKFLOW.md`.
