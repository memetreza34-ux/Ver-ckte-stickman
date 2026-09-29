# Workflow

## Phase 0 — Thema

1. `npm run topic:video -- --topic "THEMA"`
2. Duplikate und offensichtlich fremde Themen werden blockiert.
3. Generische oder langweilige Themen werden als `REVIEW_TOPIC_QUALITY` zurückgegeben.
4. Ziel ist keine Dokumentation um jeden Preis, sondern eine starke Story-Idee mit Neugier, Verrücktheit, visueller Stärke und Eskalation.

## Phase 1 — Story planen

1. Projekt anlegen.
2. In `99-tech/CONTENT_PLAN.json` einen `contentMode` wählen:
   - `real`
   - `hybrid`
   - `frei-surreal`
3. Themenqualität ausarbeiten.
4. Hook, Story-Beats, `entertainmentBeats`, Retention, Payoff, Titel und Cover planen.
5. `truthBoundary` intern verwenden, wenn reale und erfundene Elemente gemischt werden.
6. Nur bei `real` und `hybrid` reale Tatsachenbehauptungen in `99-tech/RESEARCH.json` belegen.
7. Bei `frei-surreal` darf `RESEARCH.json` leer/DRAFT bleiben.
8. Voice-over schreiben: direkt in die Geschichte, keine Produktionshinweise wie „unsere Hauptfigur ist erfunden“.
9. `plannedImageCount` und `targetDurationSeconds` setzen.
10. `IMAGE_AUDIO_MAP.json` lückenlos ausfüllen.
11. `00-bildprompts/99-alle-bildprompts.txt` mit fertigen deutschen Einzelprompts schreiben.
12. `npm run validate:phase1 -- --dir "..."`.

## Story-Regeln

- Story vor Erklärung.
- Mindestens 5 Unterhaltungsbeats.
- ungefähr alle 8–16 Sekunden neue Regel, Gefahr, Twist, Gag, Transformation, Enthüllung oder Konsequenz.
- frei-surreal darf kosmisch, absurd, albtraumhaft oder komplett erfunden sein.
- reale Personen dürfen keine erfundenen Handlungen oder Zitate als Tatsachen zugeschrieben bekommen.
- interne Wahrheitsgrenzen gehören nicht automatisch ins Voice-over.

## Phase 2 — Bilder + Audio

- `Bild 01.png` bis `Bild NN.png` in `03-bilder/`.
- `Bild 01` ist Cover und erste Videoszene.
- genau eine finale Voice-over-Datei in `02-audio/`.
- `npm run validate:assets -- --dir "..."`.

## Phase 3 — Produktion

```bash
npm run phase3 -- --dir "..."
```

Die Pipeline optimiert eine Kopie des Audios, richtet Bildanker mit Whisper aus, baut eine frame-genaue Timeline, wendet Motion an, rendert mit Remotion und prüft den Export.

### Bilddichte

Richtwert: etwa 28–38 Bildmomente pro 100 Sekunden. Nicht mechanisch ein Bild pro Satz. Action, Transformationen und Twists dichter; ruhige Momente nur bewusst länger.

### Motion Overrides

```json
{"motionOverrides": [{"imageNumber": 3, "type": "focus-left", "strength": 1.2, "focusX": 35, "focusY": 50}]}
```

Erlaubt: `push-in`, `pull-out`, `pan-left`, `pan-right`, `drift-up`, `drift-down`, `focus-left`, `focus-right`, `still`.
