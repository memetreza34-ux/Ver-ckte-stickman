# StrichModus — Video-Pipeline V2.8

Pipeline für einen deutschsprachigen Faceless-YouTube-Kanal mit klassischen Strichmännchen. Themen: echte spannende Berufe, Kriminalitätsstrukturen, Politik, Geschichte und besondere Lebenswelten – verständlich, unterhaltsam und faktenbewusst erzählt.

## Deutschland als bevorzugte Videowelt

Der Kanal ist **deutschsprachig und standardmäßig in Deutschland angesiedelt**. Für neue Rollen-Videos bevorzugen wir deutsche Schauplätze, real passende Behörden und bekannte Alltagssituationen.

Beispiele: `Ein Tag beim BKA`, `Dein erster Tag beim SEK`, `Ein Tag bei der Kriminalpolizei`, `Ein Tag als Zollfahnder`, `Dein Leben als verdeckter Ermittler in Deutschland`.

Humor durch kleine Alltagsklischees (Papierkram, Behördengänge, Stau, Dienstpläne) ist erlaubt, aber nur situationsbezogen. Deutsche Zuständigkeiten, Vorschriften und Gesetze müssen überprüft werden. **FBI/CIA sind keine deutschen Behörden**: Bei diesen ausdrücklich internationalen Themen bleibt der Schauplatz korrekt in den USA.

Verbindliche Regeln: `config/content-policy.json → localizationPolicy`.

## Aufgeräumte Videoablage

Im Ordner `youtube/` liegen nur Kalenderwochen mit aktiven Videoprojekten, `_intern/` für systeminterne Vorlagen, Anleitungen und das Lernprotokoll sowie `_archiv/` für frühere Test- und Lernvideos, die nicht mehr der Kanalrichtung entsprechen. Archivierte Projekte bleiben unter `youtube/`, damit `topic:video` sie weiterhin als bekannte Themen erkennt; ihr Archivpfad steht in `config/topic-registry.json` (`archivedPath`). Ein Videoprojekt enthält weiterhin `00-bildprompts`, `01-script`, `02-audio`, `03-bilder`, `04-export` und `99-tech`. Technische Projektdateien nicht löschen: die Pipeline benötigt sie.

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

Die Zeiten stammen aus Whisper-Wortzeiten des finalen optimierten Audios und werden nicht geschätzt. Zusätzlich wird `UNTERTITEL.srt` mit zeitlich passenden YouTube-Untertiteln erstellt.

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
npm run review:images -- --dir "youtube/<week>/<slug>"
npm run validate:assets -- --dir "youtube/<week>/<slug>"
npm run phase3 -- --dir "youtube/<week>/<slug>"
```

## Sichere Google-Flow-Bildzuordnung und Sichtprüfung

Der automatische Import akzeptiert nur vollständig und lückenlos (01 bis NN) nummerierte Dateien. Bei generischen Google-Flow-Dateinamen vor dem Import ein geprüftes `FLOW-ORDER.json` anlegen:

```json
{
  "images": [
    {"imageNumber": 1, "source": "download-cover.png"},
    {"imageNumber": 2, "source": "download-szene-zwei.png"}
  ]
}
```

Dann `npm run import:flow-images -- --dir "youtube/<week>/<slug>" --source "/DOWNLOAD" --manifest "/PFAD/FLOW-ORDER.json"`. Das Mapping muss exakt jede erwartete Bilddatei einmal zuordnen; der Import ersetzt finale Bilder erst nach erfolgreicher Vorbereitung. Bei bewusstem Ersatz bestehender Bilder `--force` hinzufügen.

Mit `npm run review:images -- --dir "youtube/<week>/<slug>"` wird `99-tech/IMAGE_REVIEW.html` erzeugt: eine lokale Bildübersicht mit Skriptanker, Szenenidee und Auswahl für jede Szene. Im Browser alle Bilder anhand der konkreten Skriptaussage, Bildtypwahl, Fakten, Struktur und der tatsächlichen Labels kontrollieren; nur wenn Figuren erscheinen, zusätzlich ihre Stickman-Anatomie und Accessoires prüfen. Den JSON-Prüfbericht herunterladen und mit `npm run review:images -- --dir "youtube/<week>/<slug>" --apply "/PFAD/IMAGE_REVIEW_APPROVED.json"` übernehmen. Geänderte Bilddateien verlieren ihre Freigabe automatisch anhand des SHA-256-Fingerabdrucks. **Die Sichtprüfung ist manuell; die Software behauptet keine automatische visuelle oder semantische KI-Prüfung.**

## Bildgestaltung V9: szenengenau statt austauschbar

Bei **neu erstellten Videoprojekten** gilt `config/visual-policy.json` V9. Der Kanal bleibt eine durchgängige handgezeichnete 2D-Editorial-Comicwelt, nutzt aber für jede Sprecher-Aussage die beste Darstellung: Stickman-Szene, Hierarchie-Pyramide, Organigramm, Vergleich, Prozess, Zeitachse, Karte, Infografik, Symbolbild oder Detail. Auch auf Bildern nach dem Cover sind kurze, überprüfte deutsche Labels erlaubt, sofern sie das Verständnis verbessern. Keine Figurenzwangquote und keine textfreien Diagramm-Quoten.

`99-tech/SCENE_PLAN.json` muss zu **jedem** Bild den echten Skriptanker, eine präzise Kernaussage (`message`), den geeigneten `visualType`, die eigene konkrete Darstellung (`visual`), mindestens zwei spezielle `elements` und bei Erklärbildern 2–7 kurze `labels` enthalten. Der Flow-Compiler erzeugt daraus vollständige deutsche Bildanweisungen und prüft diesen Vertrag. Die visuelle Qualität, korrekte Schreibweise und Szenenpassung müssen zusätzlich an echten Flow-Bildern kontrolliert werden. Für V9 ist die Freigabe aller Bilder verbindlich vor `validate:assets` und `phase3`: `npm run review:images -- --dir "youtube/<week>/<slug>"` ausführen, `99-tech/IMAGE_REVIEW.html` öffnen, Szene für Szene die tatsächlichen Bildpixel prüfen, JSON der Freigaben herunterladen und mit `npm run review:images -- --dir "youtube/<week>/<slug>" --apply "/PFAD/IMAGE_REVIEW_APPROVED.json"` übernehmen. Ein nicht passendes, geändertes oder nicht freigegebenes Bild verhindert den Renderstart; wenn sich das Briefing ändert, verfällt die alte Freigabe.

Details mit Beispielen: `youtube/_intern/SCENE_VISUAL_GUIDE_V9.md`. Der neue `VISUAL_BRIEF.md` im Projekt erinnert an das Nutzerfeedback. Vorhandene Projekte mit V8 behalten ihre Regeln und Dateien – **kein erzwungener rückwirkender Neurender**.
