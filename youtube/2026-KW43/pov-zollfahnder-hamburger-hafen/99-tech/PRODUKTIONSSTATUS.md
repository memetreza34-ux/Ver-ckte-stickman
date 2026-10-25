# Produktionsstatus – POV: Du bist Zollfahnder im Hamburger Hafen

Stand: 2026-10-25 · Content Policy V10 · Visual Policy V10

## Fertig

- Thema geprüft (Kanalfit 9/10, Themenqualität 8,7/10)
- Recherche mit 8 Quellen und 7 belegten Aussagen (`RESEARCH.json`)
- Skript: 977 Wörter, ca. 6:00 Minuten bei 163,5 Wörtern/Minute (`01-script/voice-script.txt`)
- Story V10: Du-Perspektive, innere Stimme in 4 Stufen, 6 Wendepunkte, Leitmotiv „Bananenkarton mit Kreidekreuz“
- Bildwelt „Nebelnacht Waltershof“ mit 7 Orten, 6 Figuren und 10 Kapiteln (`SCENE_PLAN.json`)
- 128 Bildprompts in 26 Flow-Blöcken (`00-bildprompts/5er-batches/`)
- Titel, Beschreibung, 12 Tags, Cover „ZU SCHWER“
- `npm run validate:phase1` bestanden, ohne Warnungen

## Offen

1. Skript einmal laut lesen, dann Voice-over aufnehmen → genau eine Datei nach `02-audio/`
2. Google Flow: Block 01 bis 26 jeweils komplett erzeugen und prüfen, danach alles gesammelt herunterladen
3. `npm run import:flow-images -- --dir "youtube/2026-KW43/pov-zollfahnder-hamburger-hafen" --source "/PFAD/ZUM/DOWNLOAD"`
4. `npm run review:images -- --dir "youtube/2026-KW43/pov-zollfahnder-hamburger-hafen"` und Freigabe-JSON mit `--apply` übernehmen
5. `npm run validate:assets -- --dir "youtube/2026-KW43/pov-zollfahnder-hamburger-hafen"`
6. `npm run phase3 -- --dir "youtube/2026-KW43/pov-zollfahnder-hamburger-hafen"`

## Bildprüfung besonders beachten

- Bild 01: Cover-Headline exakt „ZU SCHWER“
- Kreidekreuz-Karton gleich aussehen lassen (Bilder 1, 10, 45, 46, 73, 99, 127), im Container immer unten links
- Zahlen-Labels exakt: „7,8 Millionen“, „34 Tonnen“, „4471882“, „5.000 Euro“
