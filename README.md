# StrichModus — Video-Pipeline V2.8

Pipeline für einen deutschsprachigen Faceless-YouTube-Kanal mit klassischen Strichmännchen. Themen: echte spannende Berufe, Kriminalitätsstrukturen, Politik, Geschichte und besondere Lebenswelten – verständlich, unterhaltsam und faktenbewusst erzählt.

## Deutschland als bevorzugte Videowelt

Der Kanal ist **deutschsprachig und standardmäßig in Deutschland angesiedelt**. Für neue Rollen-Videos bevorzugen wir deutsche Schauplätze, real passende Behörden und bekannte Alltagssituationen.

Beispiele: `Ein Tag beim BKA`, `Dein erster Tag beim SEK`, `Ein Tag bei der Kriminalpolizei`, `Ein Tag als Zollfahnder`, `Dein Leben als verdeckter Ermittler in Deutschland`.

Humor durch kleine Alltagsklischees (Papierkram, Behördengänge, Stau, Dienstpläne) ist erlaubt, aber nur situationsbezogen. Deutsche Zuständigkeiten, Vorschriften und Gesetze müssen überprüft werden. **FBI/CIA sind keine deutschen Behörden**: Bei diesen ausdrücklich internationalen Themen bleibt der Schauplatz korrekt in den USA.

Verbindliche Regeln: `config/content-policy.json → localizationPolicy`.

## Aufgeräumte Videoablage

Im Ordner `youtube/` liegen nur Kalenderwochen mit Videoprojekten sowie `_intern/` für systeminterne Vorlagen, Anleitungen und das Lernprotokoll. Ein Videoprojekt enthält weiterhin `00-bildprompts`, `01-script`, `02-audio`, `03-bilder`, `04-export` und `99-tech`. Technische Projektdateien nicht löschen: die Pipeline benötigt sie.

## Oberste Regel: Nach jedem Video besser werden

Nach jedem finalen Video erstellt die Pipeline einen Post-Video-Review mit echten technischen Messwerten. Zusätzlich werden Story, Humor, Bilder, Stimme, Schnitt, Thema und Cover nach tatsächlicher Sichtung überprüft. Alle konkreten Lektionen fließen in das nächste Projekt. Siehe `youtube/_intern/CONTINUOUS_IMPROVEMENT.md`.

## StrichModus-Kern: Realitätsnahes Infotainment

**Nicht Fantasy-Comedy.** Wir erklären und erleben außergewöhnliche echte Welten: Ein Tag beim FBI, ein Tag im Bundestag, ein Tag im antiken Rom, Aufbau einer Mafia, Alltag eines Legionärs oder wie eine Spezialeinheit arbeitet. Spannende Fakten und echte Abläufe werden durch Stickman-Animation, verständliche Beispiele und situativen Humor unterhaltsam. Die Bilder bleiben Strichmännchen; der Inhalt bleibt nachvollziehbar und wo nötig recherchiert.

Themen werden auf reale Verankerung, klare Aufgaben oder Strukturebenen, überraschende Details, nachvollziehbare Szenen und Klickreiz geprüft. Reine Superkraft- und magische Geschichten sind nur auf ausdrücklichen Sonderwunsch erlaubt.


## Bevorzugte Themenrichtung

- **Ein Tag als/im:** FBI-Agent, Abgeordneter, antikes Rom, römischer Legionär, Gefängniswärter
- **Struktur/Hierarchie erklärt:** Mafia, Kartell, Spezialeinheit, Regierung, militärische Ränge
- **Historische Lebenswelten:** antikes Rom, Mittelalter, Wikinger, Ritter
- **Einblicke in Institutionen:** Aufgaben, Entscheidungen, Macht, Risiken, Alltag

Nicht nur FBI oder Polizei. Die Themen sind vielfältig, aber basieren standardmäßig auf einer **erkennbaren realen Welt**.


## Skriptformate

**Erst Format wählen, dann schreiben.**

- `mini-stories` → ideal für einen Tagesablauf mit mehreren Stationen/Aufgaben oder mehrere starke Fälle
- `progression` → Stufen, Ränge, Level, Aufstieg, Hierarchien
- `story` → eine zusammenhängende Mission/Handlung mit Ziel, Problem und Payoff

Ein `Ein Tag als ...`-Video muss nicht künstlich wie ein Film geschrieben werden. Es kann chronologisch als starke Mini-Stories funktionieren: Briefing → erste Aufgabe → Hauptteil → schwierigste Situation → Rückkehr/Schluss.

## Content-Modi

Standard `hybrid`: echte Fakten belegen, illustrative Szenen als Veranschaulichung behandeln und nicht als dokumentierte Tatsachen ausgeben. Bei reinen Strukturerklärungen bevorzugt `real`.

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
