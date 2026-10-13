# Produktionsstand: Mafia-Hierarchie

VOLLSTÄNDIG im GitHub-Projekt: 1.214 gesprochene Wörter, geplante 6:42 Minuten (nur Schätzung), 125 nummerierte Einzelbild-Prompts im Master, 125 Audio-Bild-Anker, Quellenprüfung von 5 FBI/US-Justiz-Dokumenten mit 9 belegten Aussagen, vollständige YouTube-Caption mit exakt fünf Hashtags und Planungsdateien.

Die 25 Google-Flow-5er-Dateien werden **automatisch** aus dem vorhandenen Master erstellt. Nach dem `git pull` im Repository ausführen:

```bash
npm run validate:phase1 -- --dir "youtube/2026-KW42/mafia-hierarchie-erklaert"
```

Das validiert das fertige Projekt und schreibt automatisch alle 25 Batches in `00-bildprompts/5er-batches/`, also Bild 01–125. Alternativ: `npm run compile:flow -- --dir "youtube/2026-KW42/mafia-hierarchie-erklaert"`.

**Nicht fertig und nicht behauptet:** echte Flow-Bilder, Sprecher-Audio, Thumbnail-PNG, zeitgenaue Untertitel oder gerendertes MP4. Nach fertigem Audio tatsächliche Laufzeit und Timeline prüfen. Google Flow pro Block visuell prüfen: jede Figur muss Kreis-/Ovalkopf, Strichrumpf, Stricharme, Strichbeine besitzen; falsche oder fehlende Bilder erneut generieren, am Ende gesammelt importieren.
