# Workflow

## Phase 0 — Thema

1. `npm run topic:video -- --topic "THEMA"`
2. Duplikate werden blockiert.
3. Offensichtlich fremde Themen werden als `BLOCKED_CHANNEL_FIT` blockiert.
4. `REVIEW_CHANNEL_FIT` ist nur eine Vorwarnung; im Content-Plan muss der Kanalfit später mindestens 7/10 erreichen.

## Phase 1 — Inhalt planen und belegen

1. Projekt anlegen.
2. `00-plan/CONTENT_PLAN.json` individuell ausarbeiten:
   - Kanalfit + Kanalpfeiler
   - Zuschauer-Versprechen
   - Kernfrage und Blickwinkel
   - Hook-Typ + exakter Hook
   - Erzählmodus
   - Story-Beats
   - Retention-/Eskalationspunkte
   - Payoff
   - Ending
   - finaler Titel
   - Cover-Konzept
3. `00-plan/RESEARCH.json` ausarbeiten:
   - Status `READY`
   - mindestens 2 belastbare Quellen
   - mindestens 2 zentrale Claims
   - Confidence: `gesichert`, `wahrscheinlich` oder `umstritten`
   - Unsicherheiten und Dinge, die nicht behauptet werden dürfen, dokumentieren
4. Voice-over-Skript schreiben. Der geplante Hook ist der erste gesprochene Inhalt; die geplante finale Zeile steht am Ende.
5. `plannedImageCount` und `targetDurationSeconds` in `99-tech/video.json` setzen.
6. `IMAGE_AUDIO_MAP.json` lückenlos ausfüllen.
7. Den Bildplan in `00-plan/google-flow-prompt.txt` vollständig ausarbeiten und alle Platzhalter entfernen.
8. `npm run validate:phase1 -- --dir "..."`.

Bei erfolgreicher Phase 1 wird automatisch `00-plan/FLOW_MASTER_PROMPT.txt` erzeugt. Dieser Masterprompt enthält Content-Plan, Recherche, Voice-over, Content-Policy und Visual-Policy vollständig eingebettet und kann direkt an Google Flow übergeben werden.

## Phase 2 — Assets

- `Bild 01.png` bis `Bild NN.png` in `03-assets/images/`.
- `Bild 01` ist Cover und erste Videoszene.
- Genau eine finale Voice-over-Datei in `02-audio/`.
- `npm run validate:assets -- --dir "..."`.

## Phase 3 — Produktion

```bash
npm run phase3 -- --dir "..."
```

Die Pipeline optimiert eine Kopie des Audios, richtet Bildanker mit Whisper aus, baut eine frame-genaue Timeline, wendet Motion-Presets/Overrides an, rendert mit Remotion und prüft den Export per FFprobe.

### Motion Overrides

```json
{"motionOverrides": [{"imageNumber": 3, "type": "focus-left", "strength": 1.2, "focusX": 35, "focusY": 50}]}
```

Erlaubt: `push-in`, `pull-out`, `pan-left`, `pan-right`, `drift-up`, `drift-down`, `focus-left`, `focus-right`, `still`.
