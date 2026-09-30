# Workflow V9

## Phase 0 — Thema

1. `npm run topic:video -- --topic "THEMA"`
2. Langweilige oder fremde Themen werden verworfen oder neu gerahmt.
3. Thema muss ein klares Entertainment-Versprechen haben.

## Phase 1 — Skriptformat wählen

Vor dem eigentlichen Schreiben wird in `99-tech/CONTENT_PLAN.json` `scriptFormat.type` gesetzt:

- `mini-stories`
- `progression`
- `story`

Dazu `reason` und `whyThisFormat` ausfüllen.

### mini-stories
Nutzen für mehrere Fälle, Regeln, Kategorien, Orte oder verrückte Beispiele.

Pflicht: `formatPlan.miniStories.orderingLogic` + mindestens 4 starke `sections`.

### progression
Nutzen für Ränge, Level, Stufen, Aufstieg oder Evolution.

Pflicht: `axis`, `startState`, `endState` + mindestens 4 echte `stages`.

### story
Nur nutzen, wenn das Thema wirklich eine zusammenhängende Handlung trägt.

Pflicht: Ziel, Problem, Auslöser, mindestens 4 kausale Wendungen, Midpoint, Finale, Setup/Payoff, Callback + mindestens 6 Beats.

## Phase 1B — Hook + Intro

- Titel-/Cover-Versprechen sofort bestätigen.
- Kein Begrüßungsblock.
- Cover maximal kurz halten.
- Mindestens 4 Bildmomente in den ersten ~10 Sekunden planen.
- `introPlan` vollständig ausfüllen.

Formatabhängig:

```text
mini-stories: Versprechen → erster starker Punkt sofort
progression: Startzustand/Achse → Stufe 1 sofort
story: Situation/Regel → Problem/Ziel sofort
```

## Phase 1C — Voice-over

- gesprochenes Deutsch
- eine Idee pro Absatz
- kurze und mittlere Sätze mischen
- keine künstliche Dauerdramatik
- keine Produktions-/Quellenhinweise
- kein Referat

Qualitätsfrage:

```text
mini-stories → Will ich den nächsten Punkt hören?
progression  → Will ich die nächste Stufe sehen?
story        → Will ich wissen, was als Nächstes passiert?
```

Danach:

```bash
npm run validate:phase1 -- --dir "youtube/..."
```

## Phase 2 — Bilder

- Bild 01 = Cover + erste Szene
- 30–42 Bildmomente pro 100 Sekunden als Richtwert, adaptiv
- neues Bild bei neuer Information, neuem Punkt, neuer Stufe, Handlung, Konsequenz, Ort oder Transformation

Flow:

```bash
npm run compile:flow -- --dir "youtube/..."
```

Es entstehen 5er-Batches. Immer einen kompletten 5er-Block erzeugen, dann den nächsten. Nichts einzeln herunterladen oder manuell umbenennen.

Wenn alle Bilder fertig sind: einmal gesammelt herunterladen und importieren:

```bash
npm run import:flow-images -- --dir "youtube/..." --source "/PFAD/ZUM/DOWNLOAD"
```

## Phase 3 — Produktion

Genau eine finale Voice-over-Datei nach `02-audio/`.

```bash
npm run validate:assets -- --dir "youtube/..."
npm run phase3 -- --dir "youtube/..."
```

Danach enthält `04-export/`:

- `FINAL_VIDEO.mp4`
- `THUMBNAIL.png`
- `YOUTUBE_UPLOAD.txt`
