# Verückte Stickman — Video-Pipeline V2.2

Produktionspipeline für einen deutschen faceless YouTube-Unterhaltungskanal mit fester grotesk-surrealer Stickman-Bildwelt und individueller Planung pro Video.

## Klare Projektstruktur

```text
00-bildprompts/     → nur die fertigen Google-Flow-Bildprompts
01-script/          → finales Voice-over-Skript
02-audio/           → genau eine finale Voice-over-Datei
03-bilder/          → Bild 01.png bis Bild NN.png
04-export/          → finales Video + Thumbnail
99-tech/            → interne Planung, Recherche, Mapping und Renderdaten
```

Die einzige Datei, die für Google Flow gedacht ist, lautet:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Sie enthält **keine** Content-Policy, Recherche, JSON-Dumps oder das Voice-over. Flow bekommt nur einen kurzen verbindlichen Style-Lock und danach pro Bild einen selbstständigen, konkreten deutschen Prompt.

## Cover-Regel

`Bild 01` ist Cover und erste Videoszene. Jedes Cover hat immer eine kurze deutsche Überschrift mit 1–4 Wörtern. Die Überschrift wird im Coverprompt wortgenau festgelegt, erscheint genau einmal, ist groß und kontrastreich und ergänzt den Videotitel.

## Bildprompt-Regel

Jeder Einzelprompt nennt konkret Motiv, Handlung, Komposition, Mimik/Körpersprache, Umgebung, Licht/Farbe und relevante Requisiten. Keine abstrakten Planungsanweisungen im finalen Flow-Prompt. Alle Prompts sind Deutsch, alle Bilder 16:9.

## Interne Phase 1

`99-tech/CONTENT_PLAN.json` enthält Kanalfit, Hook, Story, Retention, Titel/Cover und Ending. `99-tech/RESEARCH.json` enthält Quellen, Claims und Unsicherheiten. `99-tech/IMAGE_AUDIO_MAP.json` enthält die feste Bild↔Audio-Reihenfolge.

Ablauf:

```text
Thema → Kanalfit → Recherche → Hook/Skript → Titel/Cover
→ Bild↔Audio-Struktur → 00-bildprompts/99-alle-bildprompts.txt
→ Bilder + Audio → Whisper → Timeline → Motion → Remotion → QC
```

## Start

```bash
npm install
npm run topic:video -- --topic "THEMA"
npm run create:video -- --topic "THEMA" --title "ARBEITSTITEL" --week "2026-KW40" --slug "mein-video"
npm run validate:phase1 -- --dir "youtube/<week>/<slug>"
```

`npm run compile:flow -- --dir "..."` prüft nur noch, ob die eine Flow-Bildpromptdatei sauber und frei von internen Planungsdaten/Platzhaltern ist. Es erzeugt keine zweite Promptdatei mehr.

Nach Bildern und Voice-over:

```bash
npm run validate:assets -- --dir "youtube/<week>/<slug>"
npm run phase3 -- --dir "youtube/<week>/<slug>"
```

Technische Voraussetzungen: Node.js >= 22, FFmpeg/FFprobe und Whisper CLI.
