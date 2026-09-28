# Verückte Stickman — Video-Pipeline V2

Schlanke Produktionspipeline für faceless YouTube-Videos mit einer konsistenten, ausdrucksstarken Stickman-Bildwelt.

## Ablauf

```text
Thema
→ Projekt anlegen
→ Skript + Bildplan
→ Bilder + Voice-over
→ Asset-QC
→ Audio-Optimierung
→ Whisper-Alignment
→ frame-genaue Timeline
→ Motion-Plan
→ Remotion-Render
→ Post-Render-QC
```

## Wichtig

- Bild 01 ist Cover und erste Videoszene.
- Die Bildzahl ist inhaltsgetrieben, nicht fest.
- Das Nutzer-Voice-over bleibt unverändert; intern wird eine optimierte Kopie erzeugt.
- Bildwechsel werden über echte Wortzeiten aus Whisper ausgerichtet.
- Motion-Overrides aus `99-tech/RENDER_PLAN.json` werden wirklich ausgewertet.
- Finales Video wird nach dem Render mit FFprobe geprüft.

## Voraussetzungen

- Node.js >= 22
- FFmpeg + FFprobe
- Whisper CLI (`whisper`)

## Start

```bash
npm install
npm run create:video -- --topic "THEMA" --title "TITEL" --week "2026-KW40" --slug "mein-video"
```

Danach `youtube/<week>/<slug>/` ausfüllen und Phase 1 prüfen:

```bash
npm run validate:phase1 -- --dir "youtube/<week>/<slug>"
```

Nach Bildern und Voice-over:

```bash
npm run validate:assets -- --dir "youtube/<week>/<slug>"
npm run phase3 -- --dir "youtube/<week>/<slug>"
```

Nur vorbereiten, ohne Render:

```bash
npm run phase3 -- --dir "youtube/<week>/<slug>" --prepare-only
```
