# Verückte Stickman — Video-Pipeline V2

Produktionspipeline für einen deutschen faceless YouTube-Unterhaltungskanal mit fester grotesk-surrealer Stickman-Bildwelt und **individueller Content-Planung pro Video**.

## Zwei feste Systeme

### 1. Content-DNA

Verbindlich in `config/content-policy.json` und ausführlich in `youtube/CONTENT_SYSTEM.md`.

Die Kanal-DNA bleibt gleich, aber pro Video werden neu entwickelt:

- Zuschauer-Versprechen und Blickwinkel
- Hook-Typ und Hook-Text
- Erzählmodus und Story-Beats
- Retention / Eskalation / Payoff
- finaler Titel
- Cover-Konzept
- Zusammenspiel von Titel und Cover

**Keine starre Einheits-Schablone:** Ein Mafia-Hierarchie-Video darf anders erzählt werden als eine bizarre historische Geschichte, ein Psychologie-Thema oder ein kosmisch-surrealer Stoff.

### 2. Visuelle DNA

Verbindlich in `config/visual-policy.json`.

Kernstil:

- grotesk-surrealer Dark-Comic-Stickman-Infotainment-Stil
- bizarre, dunkle, absurde und unterhaltsame Bildsprache
- einfache Stickman-Grundkörper mit stark überzeichneten Gesichtern
- Humor durch Übertreibung, Hierarchien, Verwandlungen, Größenkontraste und unerwartete Reaktionen
- je nach Thema hell, neutral, düster, psychologisch, bedrohlich, chaotisch oder kosmisch
- klare schwarze Konturen, reduzierte Hintergründe und gezielte Akzentfarben
- keine süße Kinder-Clipart, keine sterile Corporate-Optik und keine fotorealistischen Menschen als Hauptstil

## Sprache

Der Kanal ist vollständig deutschsprachig.

- Sprechtext: Deutsch
- Content-Plan: Deutsch
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
→ individueller CONTENT_PLAN
→ Recherche
→ Hook + Skript
→ finaler Titel + Cover-Konzept
→ Bildplan
→ Bilder + Voice-over
→ Asset-QC
→ Audio-Optimierung
→ Whisper-Alignment
→ frame-genaue Timeline
→ Motion-Plan
→ Remotion-Render
→ Post-Render-QC
```

## Phase-1-Gate

`validate:phase1` prüft nicht mehr nur Skript und Bildmapping, sondern auch:

- individuelles Zuschauer-Versprechen
- konkreten Blickwinkel
- gültigen Hook-Typ und Hook am Skriptanfang
- passenden Erzählmodus
- mindestens drei ausgearbeitete Story-Beats
- Payoff
- finalen Titel
- Cover mit 1–3 Hauptmotiven
- maximal kurzen optionalen Cover-Text
- dass Titel und Cover sich ergänzen statt identisch zu sein
- injizierte Content- und Visual-Policy

## Weitere Produktionsregeln

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
npm run create:video -- --topic "THEMA" --title "ARBEITSTITEL" --week "2026-KW40" --slug "mein-video"
```

Danach zuerst `00-plan/CONTENT_PLAN.json` ausarbeiten, anschließend Skript und Bildplan erstellen.

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
