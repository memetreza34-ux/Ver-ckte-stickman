# Verückte Stickman — Video-Pipeline V2.4

Produktionspipeline für einen deutschen faceless YouTube-Unterhaltungskanal mit fester grotesk-surrealer Stickman-Bildwelt und **verrücktem Story-/Infotainment**.

## Kanalrichtung

**Unterhaltung zuerst.** Videos dürfen real, hybrid oder komplett erfunden/surreal sein.

Geeignet sind zum Beispiel:

- ein Spion, der merkt, dass seine Wohnung ihn abhört
- eine Stadt, in der Schlaf verboten ist
- ein Gefängnis mit endlosen Stockwerken
- eine Raumstation, auf der jede Stunde eine neue Regel erscheint
- Mafia-, Sekten-, Unterwelt- und Hierarchiegeschichten
- groteske historische oder moderne Was-wäre-wenn-Szenarien
- kosmische, absurde und dunkle Comedy-Geschichten

Nicht jedes Video braucht eine feste Hauptfigur, eine reale Person oder eine dokumentarische Struktur.

## Content-Modi

`99-tech/CONTENT_PLAN.json` legt `contentMode` fest:

- `real` → reale Tatsachen, Recherche Pflicht
- `hybrid` → reale Elemente + erfundene Story; nur echte Tatsachenbehauptungen werden belegt
- `frei-surreal` → freie Story; keine Recherchepflicht, solange keine realen Behauptungen als Fakten verkauft werden

Interne Hinweise wie Wahrheitsgrenzen oder Quellen gehören **nicht automatisch ins Voice-over**. Sätze wie „unsere Hauptfigur ist erfunden“ sind im Sprechertext unerwünscht.

## Themen-Gate

Ein Thema muss nicht nur zur Nische passen, sondern mindestens 8/10 Themenqualität erreichen:

- Neugier
- Verrücktheit
- visuelles Potenzial
- Eskalationspotenzial
- Unterhaltungspotenzial

Generische Lexikon-Themen werden neu gerahmt oder blockiert.

## Projektstruktur

```text
00-bildprompts/     → fertige Google-Flow-Bildprompts
01-script/          → finales Voice-over-Skript
02-audio/           → genau eine finale Voice-over-Datei
03-bilder/          → Bild 01.png bis Bild NN.png
04-export/          → finales Video + Thumbnail
99-tech/            → interne Planung, Wahrheitsebene, Recherche, Mapping und Renderdaten
```

Für Google Flow wird nur diese Datei verwendet:

```text
00-bildprompts/99-alle-bildprompts.txt
```

## Story- und Retention-Regeln

- Story vor Erklärung
- Hook ist der erste gesprochene Inhalt
- keine Meta-Erklärung über erfundene Figuren
- mindestens 5 geplante `entertainmentBeats`
- ungefähr alle 8–16 Sekunden ein neuer Twist, Gag, Statuswechsel, eine Regel, Gefahr, Enthüllung oder Konsequenz
- keine trockenen Faktenketten
- ein Satz darf mehrere Bilder bekommen
- ungefähr 28–38 Bildmomente pro 100 Sekunden als Richtwert

## Cover

`Bild 01` ist Cover + erste Videoszene. Das Cover besitzt immer eine kurze deutsche Überschrift mit 1–4 Wörtern und 1–3 großen Hauptmotiven.

## Ablauf

```text
Thema
→ Kanalfit + Themenqualität
→ Content-Modus wählen
→ Story planen
→ falls nötig Recherche/Wahrheitsgrenze
→ Hook + Skript
→ Entertainment-Beats
→ Titel + Cover
→ Bildfolge + Bildprompts
→ Bilder + Voice-over
→ Asset-QC
→ Whisper-Alignment
→ Timeline + Motion
→ Remotion
→ finales QC
```

## Start

```bash
npm install
npm run topic:video -- --topic "THEMA"
npm run create:video -- --topic "THEMA" --title "ARBEITSTITEL" --week "2026-KW40" --slug "mein-video"
npm run validate:phase1 -- --dir "youtube/<week>/<slug>"
```

Nach Bildern und Voice-over:

```bash
npm run validate:assets -- --dir "youtube/<week>/<slug>"
npm run phase3 -- --dir "youtube/<week>/<slug>"
```

Technische Voraussetzungen: Node.js >= 22, FFmpeg/FFprobe und Whisper CLI.
