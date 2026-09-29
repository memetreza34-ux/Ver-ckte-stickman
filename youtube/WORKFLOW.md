# Workflow

## Phase 0 — Thema

1. `npm run topic:video -- --topic "THEMA"`
2. Duplikate werden blockiert.
3. Bevorzugt werden Themen mit einer erlebbaren Rolle, Hierarchie, Lebenswelt, Entwicklung oder Innenperspektive.
4. Offensichtlich fremde Themen werden blockiert.

## Phase 1 — Inhalt planen

1. Projekt anlegen.
2. `99-tech/CONTENT_PLAN.json` ausarbeiten:
   - Kanalfit
   - `formatMode`
   - `viewerRole`
   - `experiencePremise`
   - Zuschauer-Versprechen
   - Hook
   - Reise-/Story-Beats
   - `informationBeats`
   - Retention
   - Payoff und Ending
   - Titel + Cover
3. `99-tech/RESEARCH.json`:
   - mindestens 2 belastbare Quellen
   - mindestens 4 zentrale belegte Claims
   - Unsicherheiten klar markieren
   - offizielle / wissenschaftliche / institutionelle Quellen bevorzugen, wenn verfügbar
4. Voice-over schreiben.
5. Bilddichte nach Inhalt planen. Bei ca. 100 s meist 26–34 Bilder, nicht starr.
6. `IMAGE_AUDIO_MAP.json` lückenlos ausfüllen.
7. `00-bildprompts/99-alle-bildprompts.txt` schreiben.
8. `npm run validate:phase1 -- --dir "..."`.

## Bildplanung

Nicht automatisch ein Bild pro Satz.

```text
neuer Gedanke / neue Handlung / neuer Ort / neuer Status
→ neuer Bildmoment
```

Ein langer Satz darf mehrere Bildmomente besitzen. Mehrere kurze Sätze dürfen zusammenbleiben.

Richtwerte:
- Hook / Action / Enthüllung: 1,8–3,0 s
- normal: 2,8–4,2 s
- bewusster ruhiger Moment: 4,2–5,5 s
- ab 5,2 s Split prüfen
- ab 6,2 s Split stark bevorzugt
- Hard-Maximum: 8,0 s

## Phase 2 — Bilder und Audio

- `Bild 01.png` bis `Bild NN.png` in `03-bilder/`
- `Bild 01` = Cover + erste Szene
- genau eine finale Voice-Datei in `02-audio/`
- `npm run validate:assets -- --dir "..."`

## Phase 3 — Produktion

```bash
npm run phase3 -- --dir "..."
```

Die Pipeline optimiert eine Kopie des Audios, richtet Bildanker mit Whisper aus, baut die frame-genaue Timeline, wendet Motion an, rendert mit Remotion und prüft den Export.

Motion ersetzt keinen notwendigen Bildwechsel. Ein langweiliges Motiv wird nicht dadurch gut, dass es acht Sekunden gezoomt wird.
