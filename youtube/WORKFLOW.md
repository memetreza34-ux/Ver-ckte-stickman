# Workflow V8

## Phase 0 — Story-Idee

1. `npm run topic:video -- --topic "THEMA"`
2. Duplikate und klar fremde Themen werden blockiert.
3. Generische Themen wie „Die Geschichte von ...“ oder „Fakten über ...“ werden zurückgewiesen.
4. Ziel ist eine Prämisse, die schon als Einzeiler eine Geschichte öffnet: unmögliche Situation, absurde Regel, Gefahr, Twist oder starke Konsequenz.

## Phase 1 — Story + klarer Einstieg

1. Projekt anlegen.
2. `contentMode` ist standardmäßig `frei-surreal`.
3. Hook, Story Engine, Payoff und Cover planen.
4. `introPlan` ausfüllen:
   - Situation
   - ungewöhnliche Regel/Anomalie
   - Gefahr oder unmittelbares Ziel
   - Klarheitssatz
   - mindestens 4 Bildmomente in den ersten ~10 Sekunden
5. `storyEngine` mit Ziel, Problem, mindestens 4 kausalen Wendungen, Midpoint-Turn, finaler Eskalation, Setup/Payoff und Ending-Callback ausarbeiten.
6. Mindestens 6 Story-Beats und 6 `entertainmentBeats`.
7. `scriptQuality` muss mindestens 8/10 erreichen; `introClarity` ist eine eigene Pflichtdimension.
8. Voice-over schreiben: sofort verständlich, natürlich gesprochen, keine Referatssprache.
9. Bilder nach sichtbaren Veränderungen planen. Hook, Twist, Action und schwierige Erklärstellen bekommen bei Bedarf zusätzliche Bildmomente.
10. `youtubeUpload.title` und `youtubeUpload.description` fertig schreiben.
11. `npm run validate:phase1 -- --dir "youtube/..."`.

## Intro-Regeln

In den ersten ungefähr 10 Sekunden muss der Zuschauer verstehen:

```text
WO BIN ICH?
→ WAS IST DIE SELTSAME REGEL?
→ WARUM IST DAS JETZT WICHTIG?
→ WAS MUSS ALS NÄCHSTES PASSIEREN?
```

- Cover/Bild 01 nur kurz zeigen; Ziel maximal ca. 2,2 Sekunden.
- Mindestens 4 Bildstarts in den ersten 10 Sekunden.
- Kein Intro-Bild länger als ca. 3,2 Sekunden.
- Ein komplizierter Satz darf mehrere Bilder bekommen.
- Ein mysteriöser Hook darf offen sein, aber nicht verwirrend.

## Phase 2 — Google Flow in 5er-Blöcken

1. `npm run compile:flow -- --dir "youtube/..."`
2. Unter `00-bildprompts/5er-batches/` entstehen `01-bilder-01-05.txt`, `02-bilder-06-10.txt` usw.
3. Immer einen vollständigen 5er-Block erzeugen; letzter Block darf kleiner sein.
4. Nicht einzeln herunterladen oder manuell umbenennen.
5. Erst wenn alle Bilder fertig sind, einmal gesammelt herunterladen.
6. Danach: `npm run import:flow-images -- --dir "youtube/..." --source "/PFAD/ZUM/DOWNLOAD-ORDNER"`
7. Der Import ordnet automatisch `Bild 01.png` bis `Bild NN.png` zu.
8. Genau eine finale Voice-over-Datei in `02-audio/`.

## Phase 3 — Produktion

```bash
npm run phase3 -- --dir "youtube/..."
```

Die Pipeline optimiert Audio, richtet Bildanker mit Whisper aus, baut die Timeline, prüft die Intro-Dichte, rendert mit Remotion und führt finales QC durch.

## Export

`04-export/` enthält am Ende:

```text
FINAL_VIDEO.mp4
THUMBNAIL.png
YOUTUBE_UPLOAD.txt
```

`YOUTUBE_UPLOAD.txt` enthält genau den finalen YouTube-Titel und die fertige Beschreibung.

## Bilddichte

Richtwert: etwa 30–42 Bildmomente pro 100 Sekunden.

Nicht mechanisch mehr Bilder erzeugen. Zusätzliche Bilder besonders bei Hook, schwieriger Erklärung, Action, Twist, Regelwechsel, Transformation und überraschender Reaktion. Ruhige Momente dürfen länger stehen, wenn das dramaturgisch gewollt ist.
