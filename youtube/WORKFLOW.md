# Workflow

## Phase 1
1. Projekt anlegen.
2. Recherche/Skript erstellen.
3. `plannedImageCount` und `targetDurationSeconds` in `99-tech/video.json` setzen.
4. `IMAGE_AUDIO_MAP.json` vollständig mit exakten Startankern aus dem Skript füllen.
5. Den Bildplan im injizierten Google-Flow-Prompt ausarbeiten.
6. `npm run validate:phase1 -- --dir "..."`.

## Phase 2
- Finale Bilder: `03-assets/images/Bild 01.png` bis `Bild NN.png`.
- Genau eine finale Voice-over-Datei in `02-audio/`.
- `npm run validate:assets -- --dir "..."`.

## Phase 3
`npm run phase3 -- --dir "..."`

Die Pipeline optimiert eine Kopie des Audios, richtet die Bildanker mit Whisper aus, baut eine frame-genaue Timeline, wendet Motion-Presets/Overrides an, rendert mit Remotion und prüft das Ergebnis per FFprobe.

### Motion Overrides
In `99-tech/RENDER_PLAN.json`:

```json
{"motionOverrides": [{"imageNumber": 3, "type": "focus-left", "strength": 1.2, "focusX": 35, "focusY": 50}]}
```

Erlaubt: `push-in`, `pull-out`, `pan-left`, `pan-right`, `drift-up`, `drift-down`, `focus-left`, `focus-right`, `still`.
