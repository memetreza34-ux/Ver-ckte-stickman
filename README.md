# Verückte Stickman — Video-Pipeline V2.1

Produktionspipeline für einen deutschen faceless YouTube-Unterhaltungskanal mit fester grotesk-surrealer Stickman-Bildwelt und individueller Content-Planung pro Video.

## Feste Systeme

- `config/visual-policy.json`: verbindliche Bildwelt und Sprachregeln.
- `config/content-policy.json`: Kanalfit, Recherche, Hook, Story, Retention, Titel/Cover und Ending.
- `config/topic-registry.json`: Duplikat- und Produktionsstatus.

## Kanalfit

Neue Themen werden zuerst auf Duplikate und groben Kanalfit geprüft. Offensichtlich fremde Themen werden blockiert. Unklare Themen dürfen zur Planung weiter, müssen im `CONTENT_PLAN.json` aber mindestens **7/10 Kanalfit** erreichen und mit einem passenden Kanalpfeiler begründet werden.

## Produktionsablauf

```text
Thema
→ Themen-/Kanalfit-Check
→ Projekt anlegen
→ CONTENT_PLAN
→ RESEARCH
→ Hook + Skript
→ Titel + Cover
→ Bildplan
→ FLOW_MASTER_PROMPT kompilieren
→ Bilder + Voice-over
→ Asset-QC
→ Audio-Optimierung
→ Whisper-Alignment
→ frame-genaue Timeline
→ Motion
→ Remotion-Render
→ Post-Render-QC
```

## Phase 1

Vor der Freigabe müssen vollständig sein:

- Kanalfit
- Zuschauer-Versprechen, Kernfrage und Blickwinkel
- Hook als erster gesprochener Inhalt
- mindestens 3 Story-Beats
- konkrete Retention-Punkte
- Payoff und Ending
- finaler Titel + Cover-Konzept
- `RESEARCH.json` mit mindestens 2 Quellen und 2 belegten Claims
- lückenloser Bildplan ohne Platzhalter
- ausgefüllte deutsche Bildprompts
- `IMAGE_AUDIO_MAP.json`

`validate:phase1` erzeugt bei Erfolg automatisch `00-plan/FLOW_MASTER_PROMPT.txt`. Diese Datei enthält die vollständige Content-Policy, Visual-Policy, den ausgefüllten Content-Plan, die Recherche und das finale Voice-over. Google Flow muss dadurch keine lokale Repo-Datei kennen.

## Bildwelt

- grotesk-surrealer Dark-Comic-Stickman-Infotainment-Stil
- vollständig deutscher Kanal
- Bildprompts auf Deutsch
- sichtbare Schrift ausschließlich korrektes Deutsch
- Bild 01 = Cover + erste Videoszene
- meist 1–3 große Cover-Motive
- keine sterile Corporate-Optik, keine süße Kinder-Clipart
- kosmische/Horror-Elemente nur wenn inhaltlich passend

## Start

```bash
npm install
npm run topic:video -- --topic "THEMA"
npm run create:video -- --topic "THEMA" --title "ARBEITSTITEL" --week "2026-KW40" --slug "mein-video"
```

Dann `00-plan/CONTENT_PLAN.json`, `00-plan/RESEARCH.json`, Skript, Bildplan und Mapping ausarbeiten.

```bash
npm run validate:phase1 -- --dir "youtube/<week>/<slug>"
```

Optional den Masterprompt separat neu bauen:

```bash
npm run compile:flow -- --dir "youtube/<week>/<slug>"
```

Nach Bildern und Voice-over:

```bash
npm run validate:assets -- --dir "youtube/<week>/<slug>"
npm run phase3 -- --dir "youtube/<week>/<slug>"
```

## Technische Voraussetzungen

- Node.js >= 22
- FFmpeg + FFprobe
- Whisper CLI (`whisper`)
