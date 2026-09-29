# Workflow

## Phase 0 — Thema

Thema auf Duplikat und Kanalfit prüfen. Offensichtlicher Fremdcontent wird blockiert; unklare Themen brauchen später mindestens 7/10 Kanalfit im Content-Plan.

## Phase 1 — intern planen, extern sauber ausgeben

1. Projekt anlegen.
2. `99-tech/CONTENT_PLAN.json` ausarbeiten: Kanalfit, Zuschauer-Versprechen, Hook, Erzählmodus, Story-Beats, Retention, Payoff, Ending, Titel und Cover.
3. `99-tech/RESEARCH.json` mit mindestens zwei belastbaren Quellen und zwei belegten Claims auf `READY` setzen.
4. `01-script/voice-script.txt` schreiben; Hook steht am Anfang, geplante Schlusszeile am Ende.
5. `99-tech/video.json` mit Zielzeit und Bildanzahl füllen.
6. `99-tech/IMAGE_AUDIO_MAP.json` lückenlos ausfüllen.
7. `00-bildprompts/99-alle-bildprompts.txt` ausarbeiten.
8. `npm run validate:phase1 -- --dir "..."`.

### Google Flow

Flow erhält **nur** `00-bildprompts/99-alle-bildprompts.txt`.

Die Datei besteht aus:

```text
kurzer globaler Style-Lock
→ Bild 01 — COVER + Pflichtüberschrift
→ Bild 02 — eigenständiger Prompt
→ Bild 03 — eigenständiger Prompt
→ ... bis Bild NN
```

Keine Policy-JSONs, keine Recherche, kein Voice-over-Dump. Immer genau ein Bild seriell erzeugen, prüfen, als `Bild NN.png` in `03-bilder/` ablegen und erst dann das nächste Bild erzeugen.

## Cover

Bild 01 hat immer eine deutsche Überschrift mit 1–4 Wörtern. Exakter Wortlaut steht in `CONTENT_PLAN.coverConcept.visibleText` und im Coverblock unter `ÜBERSCHRIFT:`. Titel und Überschrift ergänzen sich.

## Phase 2 — Bilder + Audio

- `Bild 01.png` bis `Bild NN.png` direkt in `03-bilder/`.
- genau eine finale Voice-over-Datei in `02-audio/`.
- `npm run validate:assets -- --dir "..."`.

## Phase 3 — Produktion

```bash
npm run phase3 -- --dir "..."
```

Die Pipeline optimiert das Audio, richtet Bildanker mit Whisper aus, baut die frame-genaue Timeline, wendet Motion an, rendert mit Remotion und prüft den Export per FFprobe.
