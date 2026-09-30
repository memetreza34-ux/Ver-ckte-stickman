# Verückte Stickman — Video-Pipeline V2.5

Pipeline für einen deutschen faceless YouTube-Kanal mit grotesk-surrealer Stickman-Bildwelt und **Story-first Entertainment**.

## Kernregel

**Unterhaltung zuerst.** Das Standardvideo darf komplett erfunden sein. Recherche ist nur Pflicht, wenn reale Tatsachen behauptet werden.

Der bevorzugte Modus ist `frei-surreal`:

```text
starke Prämisse → Hook → Ziel → Problem → Eskalation → Midpoint-Turn → Finale → Payoff
```

Keine Produktionshinweise im Sprechertext. Keine trockenen Faktenketten. Keine Pflicht für reale Personen oder historische Ereignisse.

## Script-Gate

Jedes neue Projekt plant in `99-tech/CONTENT_PLAN.json`:

- Themenqualität
- Hook
- `storyEngine`
- mindestens 6 Story-Beats
- mindestens 6 `entertainmentBeats`
- `scriptQuality`
- Payoff / Callback
- Titel + Cover

`storyEngine` erzwingt Ziel, zentrales Problem, kausale Wendungen, Midpoint-Turn, finale Eskalation sowie Setup/Payoff.

Details: `youtube/CONTENT_SYSTEM.md`.

## Content-Modi

- `frei-surreal` → freie Story, keine Recherchepflicht
- `hybrid` → reale Kulisse + Erfindung; nur reale Behauptungen intern belegen
- `real` → reale Tatsachen; Recherche Pflicht

## Projektstruktur

```text
00-bildprompts/     → fertige Google-Flow-Bildprompts
01-script/          → finales Voice-over-Skript
02-audio/           → finale Voice-over-Datei
03-bilder/          → Bild 01.png bis Bild NN.png
04-export/          → Video + Thumbnail
99-tech/            → interne Storyplanung, Mapping und Renderdaten
```

Für Google Flow nur:

```text
00-bildprompts/99-alle-bildprompts.txt
```

## Bilddichte

Richtwert: etwa **30–40 Bildmomente pro 100 Sekunden**. Nicht mehrere weiße Infografikbilder hintereinander. Twist, Action und Transformation dichter schneiden.

## Cover

`Bild 01` ist Cover + erste Szene. Immer eine kurze deutsche Überschrift mit 1–4 Wörtern.

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
