# Workflow

## Phase 1 — Inhalt individuell planen

1. Projekt anlegen.
2. `00-plan/CONTENT_PLAN.json` **vor dem Skript** individuell ausarbeiten:
   - Zuschauer-Versprechen
   - Kernfrage und Blickwinkel
   - Hook-Typ + exakter Hook-Text
   - Erzählmodus
   - Story-Beats
   - Retention-/Eskalationspunkte
   - Payoff
   - finaler Titel
   - Cover-Konzept
   - Zusammenspiel Titel ↔ Cover
3. Recherche durchführen und Unsicherheiten sauber behandeln.
4. Voice-over-Skript auf Basis des Content-Plans schreiben. Der geplante Hook steht wörtlich am Anfang des Skripts.
5. `plannedImageCount` und `targetDurationSeconds` in `99-tech/video.json` setzen.
6. `IMAGE_AUDIO_MAP.json` vollständig mit exakten Startankern aus dem Skript füllen.
7. Den Bildplan im injizierten Google-Flow-Prompt ausarbeiten. Der Prompt enthält die Content-Policy und Visual-Policy.
8. `npm run validate:phase1 -- --dir "..."`.

### Wichtig

Es gibt **keine starre Skript-Schablone**. Die Kanal-DNA bleibt fest, aber Hook, Story-Architektur, Titel und Cover werden pro Video aus dem Thema entwickelt. Die maschinenlesbaren Regeln stehen in `config/content-policy.json`; die ausführliche Erklärung in `youtube/CONTENT_SYSTEM.md`.

## Phase 2

- Finale Bilder: `03-assets/images/Bild 01.png` bis `Bild NN.png`.
- `Bild 01` ist Cover und erste Videoszene.
- Genau eine finale Voice-over-Datei in `02-audio/`.
- `npm run validate:assets -- --dir "..."`.

## Phase 3

```bash
npm run phase3 -- --dir "..."
```

Die Pipeline optimiert eine Kopie des Audios, richtet die Bildanker mit Whisper aus, baut eine frame-genaue Timeline, wendet Motion-Presets/Overrides an, rendert mit Remotion und prüft das Ergebnis per FFprobe.

### Motion Overrides

In `99-tech/RENDER_PLAN.json`:

```json
{"motionOverrides": [{"imageNumber": 3, "type": "focus-left", "strength": 1.2, "focusX": 35, "focusY": 50}]}
```

Erlaubt: `push-in`, `pull-out`, `pan-left`, `pan-right`, `drift-up`, `drift-down`, `focus-left`, `focus-right`, `still`.
