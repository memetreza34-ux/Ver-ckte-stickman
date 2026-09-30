# Workflow

## Phase 0 — Story-Idee

1. `npm run topic:video -- --topic "THEMA"`
2. Duplikate und klar fremde Themen werden blockiert.
3. Generische Themen wie „Die Geschichte von ...“ oder „Fakten über ...“ werden zurückgewiesen.
4. Bevorzugt wird eine Prämisse, die schon als Einzeiler eine Geschichte öffnet: unmögliche Situation, absurde Regel, Gefahr, Twist oder starke Konsequenz.

## Phase 1 — Story Engine

1. Projekt anlegen.
2. In `99-tech/CONTENT_PLAN.json` den `contentMode` wählen. Standard ist `frei-surreal`.
3. Hook und Story Engine ausarbeiten.
4. In `storyEngine` festlegen: Fokus, Ziel, Problem, Auslöser, mindestens 4 kausale Wendungen, Midpoint-Turn, finale Eskalation, Setup/Payoff und Ending-Callback.
5. Mindestens 6 Story-Beats und 6 `entertainmentBeats` planen.
6. `scriptQuality` bewerten. Unter 8/10 wird vor der Bildproduktion neu geschrieben.
7. Nur bei `real` bzw. bei echten Behauptungen im `hybrid`-Modus recherchieren.
8. Voice-over schreiben. Der erste Satz ist bereits Story. Kein Disclaimer, kein Produktionskommentar, kein Referat.
9. Bilder nicht nach Sätzen, sondern nach sichtbaren Veränderungen planen.
10. `00-bildprompts/99-alle-bildprompts.txt` fertig schreiben.
11. `npm run validate:phase1 -- --dir "youtube/..."`.
12. Danach `npm run compile:flow -- --dir "youtube/..."` ausführen. Dadurch entstehen automatisch die verbindlichen 5er-Dateien unter `00-bildprompts/5er-batches/`.

## Script-Regeln

```text
HOOK
→ ZIEL
→ ABER Problem
→ DESHALB Handlung
→ ABER neue Konsequenz
→ Midpoint-Turn
→ stärkste Eskalation
→ Setup wird bezahlt
→ Callback / Twist
```

- Nicht „und dann, und dann, und dann“.
- Nach spätestens zwei erklärenden Sätzen passiert wieder etwas.
- Der Zuschauer soll ständig wissen wollen, was als Nächstes passiert.
- Frei-surreal darf eigene Regeln, Orte, Organisationen, Zahlen und Ereignisse erfinden.
- Keine erfundenen konkreten Behauptungen über reale Personen als reale Fakten ausgeben.

## Phase 2 — Google Flow: immer in 5er-Blöcken

**Verbindlicher Standard:** Bilder niemals einzeln als Produktionsworkflow abarbeiten.

1. `00-bildprompts/5er-batches/01-bilder-01-05.txt` in Flow abarbeiten.
2. Innerhalb des Blocks alle fünf Bilder erzeugen, prüfen und erst dann mit dem nächsten Block weitermachen.
3. Danach `02-bilder-06-10.txt`, `03-bilder-11-15.txt` usw.
4. Der letzte Block darf weniger als fünf Bilder enthalten, wenn die Gesamtzahl nicht durch fünf teilbar ist.
5. Während der Generierung **keine Bilder einzeln herunterladen** und **keine Dateien manuell umbenennen**.
6. Erst wenn sämtliche Blöcke fertig sind, alle Bilder **einmal gesammelt herunterladen**.
7. Den Sammeldownload automatisch importieren:

```bash
npm run import:flow-images -- --dir "youtube/..." --source "/PFAD/ZUM/DOWNLOAD-ORDNER"
```

Der Import verlangt exakt die geplante Bildanzahl, erkennt eine sichere Reihenfolge, wandelt JPG/WEBP bei Bedarf nach PNG um und legt die Dateien lückenlos als `Bild 01.png` bis `Bild NN.png` in `03-bilder/` ab. Wenn die Reihenfolge nicht sicher erkannt werden kann, bricht der Import ab, statt Bilder still falsch zuzuordnen. Manuelles Umbenennen ist kein Produktionsschritt mehr.

Danach:

```bash
npm run validate:assets -- --dir "youtube/..."
```

Weitere Bildregeln:
- `Bild 01` ist Cover + erste Videoszene.
- Cover: deutsche Überschrift mit 1–4 Wörtern.
- Richtwert: etwa 30–40 Bildmomente pro 100 Sekunden.
- Keine Serie aus statischen weißen Infografiken.
- Perspektiven bewusst wechseln: Nahaufnahme, POV, Detail, Totale, Transformation, Größenvergleich, surrealer Wechsel.
- Genau eine finale Voice-over-Datei in `02-audio/`.

## Phase 3 — Produktion

```bash
npm run phase3 -- --dir "youtube/..."
```

Whisper richtet die Bildanker am Audio aus. Danach: frame-genaue Timeline, Motion, Remotion-Render und finales QC.
