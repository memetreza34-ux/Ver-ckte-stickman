# Verückte Stickman — Video-Pipeline V2

Schlanke Produktionspipeline für faceless YouTube-Videos mit einer festen grotesk-surrealen Stickman-Bildwelt für einen deutschen Unterhaltungskanal.

## Feste Kanal-DNA

Die visuelle Identität ist verbindlich in `config/visual-policy.json` hinterlegt.

Kernstil:

- grotesk-surrealer Dark-Comic-Stickman-Infotainment-Stil
- bizarre, dunkle, absurde und unterhaltsame Bildsprache
- einfache Stickman-Grundkörper mit stark überzeichneten Gesichtern
- Humor durch Übertreibung, Hierarchien, Verwandlungen, Größenkontraste und unerwartete Reaktionen
- je nach Thema hell, neutral, düster, psychologisch, bedrohlich, chaotisch oder kosmisch
- klare schwarze Konturen, reduzierte Hintergründe und gezielte Akzentfarben
- keine süße Kinder-Clipart, keine sterile Corporate-Optik und keine fotorealistischen Menschen als Hauptstil

### Sprache

Der Kanal ist vollständig deutschsprachig.

- Sprechtext: Deutsch
- Bildplan: Deutsch
- Bildprompts: Deutsch
- sichtbare Schrift im Bild: ausschließlich korrektes Deutsch
- keine englischen Labels oder Überschriften, außer unvermeidbaren offiziellen Eigennamen
- keine Pseudo-Schrift
- Beispiele: `STUFE 1` statt `LEVEL 1`, `WARNUNG` statt `WARNING`

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
- Pro Bild möglichst eine klare visuelle Hauptidee; lieber sinnvoll teilen als überladen.
- Die Bildwelt darf grotesk, surreal oder düster werden, aber nur wenn es zum Inhalt passt.
- Kosmische/Horror-Elemente sind eine optionale Verstärkung, kein Zwang für jede Szene.
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
