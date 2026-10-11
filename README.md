# Verückte Stickman — Video-Pipeline V2.8

Pipeline für einen deutschen faceless YouTube-Kanal mit grotesk-surrealer Stickman-Bildwelt und **rollenbasiertem Entertainment-Scripting**.

## Deutschland als bevorzugte Videowelt

Der Kanal ist **deutschsprachig und standardmäßig in Deutschland angesiedelt**. Für neue Rollen-Videos bevorzugen wir deutsche Schauplätze, real passende Behörden und bekannte Alltagssituationen.

Beispiele: `Ein Tag beim BKA`, `Dein erster Tag beim SEK`, `Ein Tag bei der Kriminalpolizei`, `Ein Tag als Zollfahnder`, `Dein Leben als verdeckter Ermittler in Deutschland`.

Humor durch kleine Alltagsklischees (Papierkram, Behördengänge, Stau, Dienstpläne) ist erlaubt, aber nur situationsbezogen. Deutsche Zuständigkeiten, Vorschriften und Gesetze müssen überprüft werden. **FBI/CIA sind keine deutschen Behörden**: Bei diesen ausdrücklich internationalen Themen bleibt der Schauplatz korrekt in den USA.

Verbindliche Regeln: `config/content-policy.json → localizationPolicy`.

## Bevorzugte Themenrichtung

Standard sind konkrete Rollen, Lebenswelten und Hierarchien, zum Beispiel:

- `Ein Tag als CIA-Agent`
- `Ein Tag als FBI-Agent`
- `Ein Tag als SWAT-Mitglied`
- `Dein Leben als Undercover-Agent`
- `Vom Rekruten bis zum Boss`
- `Dein Leben auf jeder Stufe einer Mafia`

Surreale Regelwelten bleiben möglich, sind aber **nicht mehr die bevorzugte Standardrichtung**.

Bei realen Institutionen wie CIA, FBI oder SWAT startet ein neues Projekt automatisch im Modus `hybrid`: reale Tatsachen werden recherchiert, dramatische Verbindungsszenen dürfen erfunden sein.

## Skriptformate

**Erst Format wählen, dann schreiben.**

- `mini-stories` → ideal für einen Tagesablauf mit mehreren Stationen/Aufgaben oder mehrere starke Fälle
- `progression` → Stufen, Ränge, Level, Aufstieg, Hierarchien
- `story` → eine zusammenhängende Mission/Handlung mit Ziel, Problem und Payoff

Ein `Ein Tag als ...`-Video muss nicht künstlich wie ein Film geschrieben werden. Es kann chronologisch als starke Mini-Stories funktionieren: Briefing → erste Aufgabe → Hauptteil → schwierigste Situation → Rückkehr/Schluss.

## Content-Modi

- `frei-surreal` → freie Unterhaltung, keine Recherchepflicht
- `hybrid` → reale Institution/Kulisse + dramatisierte Story; reale Behauptungen intern belegen
- `real` → reale Tatsachen; Recherche Pflicht

## Projektstruktur

```text
00-bildprompts/     → fertige Google-Flow-Bildprompts + 5er-Batches
01-script/          → finales Voice-over-Skript
02-audio/           → finale Voice-over-Datei
03-bilder/          → Bild 01.png bis Bild NN.png
04-export/          → fertige Upload-Dateien
99-tech/            → interne Formatplanung, Mapping, Alignment und Renderdaten
```

## Export — verbindlicher Standard

Nach erfolgreicher Phase 3 liegen im Export mindestens:

```text
04-export/
├── FINAL_VIDEO.mp4
├── THUMBNAIL.png
├── YOUTUBE_CAPTION.txt
└── UNTERTITEL_SCRIPT.txt
```

`YOUTUBE_CAPTION.txt` enthält **YouTube-Titel + Beschreibung in einer Datei**.

Die Videobeschreibung wird ausführlicher geschrieben: **mindestens 450 Zeichen in mindestens zwei sinnvollen Absätzen**, dazu **exakt fünf unterschiedliche, videorelevante Hashtags als letzte eigene Zeile**. Keine pauschalen Copy-Paste-Beschreibungen, keine unnötige Streckung. Beide Vorgaben werden in Phase 1 und beim Finalisieren geprüft.

`UNTERTITEL_SCRIPT.txt` enthält das **komplette tatsächlich gesprochene Voice-over mit echten Zeitdaten** in 10-Sekunden-Blöcken:

```text
[00:00 - 00:10]
...

[00:10 - 00:20]
...
```

Die Zeiten stammen aus Whisper-Wortzeiten des finalen optimierten Audios und werden nicht geschätzt.

## Produktionslogik

1. Thema prüfen
2. Projekt erstellen
3. Rolle/Lebenswelt bzw. Progression konkret planen
4. `scriptFormat` wählen und begründen
5. Einleitung, Hauptteil und Schluss ausarbeiten
6. finales Voice-over schreiben
7. Titel/Cover + YouTube-Beschreibung planen
8. Bildprompts erzeugen
9. Flow immer in 5er-Batches
10. Bilder gesammelt importieren
11. Audio → Whisper-Alignment → Timeline → Render → Export-QC

## Bilddichte

Richtwert: etwa **30–42 Bildmomente pro 100 Sekunden**, adaptiv. Zusätzliche Bilder besonders bei neuer Aufgabe, neuem Ort, neuer Information, Risiko, Entscheidung, Konsequenz oder Statuswechsel.

## Cover

`Bild 01` ist Cover + erste Szene. Kurze deutsche Überschrift mit 1–4 Wörtern. Im Intro nur kurz halten.

## Start

```bash
npm install
npm run topic:video -- --topic "Ein Tag als FBI-Agent"
npm run create:video -- --topic "Ein Tag als FBI-Agent" --title "Ein Tag als FBI-Agent" --week "2026-KW41" --slug "ein-tag-als-fbi-agent"
# CONTENT_PLAN ausarbeiten
npm run validate:phase1 -- --dir "youtube/<week>/<slug>"
npm run compile:flow -- --dir "youtube/<week>/<slug>"
```

Nach Sammeldownload der Bilder:

```bash
npm run import:flow-images -- --dir "youtube/<week>/<slug>" --source "/PFAD/ZUM/DOWNLOAD-ORDNER"
npm run validate:assets -- --dir "youtube/<week>/<slug>"
npm run phase3 -- --dir "youtube/<week>/<slug>"
```
