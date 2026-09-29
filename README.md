# Verückte Stickman — Video-Pipeline V2.3

Produktionspipeline für einen deutschen faceless YouTube-Unterhaltungskanal mit fester grotesk-surrealer Stickman-Bildwelt und **immersivem Fakten-Entertainment**.

## Kanalrichtung

Der Standard ist nicht mehr „historischer Bericht + ein Bild pro Satz“.

Der Zuschauer soll eine ungewöhnliche Welt **von innen erleben**:

- ein Leben / Alltag in einer geheimen oder extremen Rolle
- Eintritt und Aufstieg in einer Hierarchie
- ein Tag in einem gefährlichen System
- ein historisches Ereignis aus einer konkreten Innenperspektive
- Rabbit-Hole-, Aufstiegs-, Abstiegs- oder Überlebensreisen

Beispiele für die Richtung: Geheimdienst-Agent, Mafia-Neuling, Gladiator, Gefangener, Kult-Mitglied, historische Rolle oder eine Person mitten in einer absurden Katastrophe. Nicht jedes Video muss dieselbe „Dein Leben als ...“-Titelformel benutzen.

**Wichtig:** Die Erlebnis-Perspektive ist nur die Erzählform. Reale Fakten, Zahlen, Anforderungen, Ränge, Abläufe und Konsequenzen müssen weiterhin recherchiert und belegt sein.

## Projektstruktur

```text
00-bildprompts/     → fertige Google-Flow-Bildprompts
01-script/          → finales Voice-over-Skript
02-audio/           → genau eine finale Voice-over-Datei
03-bilder/          → Bild 01.png bis Bild NN.png
04-export/          → finales Video + Thumbnail
99-tech/            → interne Planung, Recherche, Mapping und Renderdaten
```

Für Google Flow wird ausschließlich verwendet:

```text
00-bildprompts/99-alle-bildprompts.txt
```

## Bilddichte

Die Bildanzahl ist adaptiv. Kein künstlicher Schnitt nur um „mehr Bilder“ zu haben.

Richtwerte:

- normale Erklärung: meist 2,8–4,2 s pro Bild
- Hook, Action, Rangwechsel, Enthüllung: oft 1,8–3,0 s
- bewusster ruhiger Moment: etwa 4,2–5,5 s
- ab ca. 5,2 s aktiv prüfen, ob ein echter zusätzlicher Bildmoment nötig ist
- über 6,2 s ist ein Split stark bevorzugt
- 8,0 s ist technisches Hard-Maximum
- bei ca. 100 s Video meist ungefähr 26–34 Bilder

Ein längerer gesprochener Satz darf zwei oder drei Bilder bekommen, wenn sich Handlung, Ort, Objekt, Status oder Kernaussage sichtbar ändert. Kurze zusammengehörige Sätze dürfen ein Bild teilen.

## Fakten statt Fülltext

`99-tech/RESEARCH.json` ist Pflicht. Zentrale Aussagen werden belegt. Wenn vorhanden, werden offizielle, wissenschaftliche oder institutionelle Quellen bevorzugt.

Im Skript sollen regelmäßig konkrete Informationswerte vorkommen, z. B.:

- echte Anforderungen
- Zahlen und Zeitspannen
- Ränge und Aufgaben
- Regeln und Verbote
- reale Orte
- Konsequenzen und Risiken

Diese Fakten werden in die Reise eingebaut und nicht als trockener Infoblock vorgelesen.

## Cover

`Bild 01` ist Cover und erste Videoszene. Jedes Cover hat eine kurze deutsche Überschrift mit 1–4 Wörtern. Sie erscheint genau einmal, groß, kontrastreich und ergänzt den Videotitel.

## Ablauf

```text
Thema → Kanalfit → Erlebnis-Perspektive → Recherche
→ Hook + Reise/Dramaturgie → Titel/Cover
→ Informationsbeats + Bild↔Audio-Struktur
→ Bildprompts → Bilder + Audio
→ Whisper → Timeline → Motion → Remotion → QC
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
