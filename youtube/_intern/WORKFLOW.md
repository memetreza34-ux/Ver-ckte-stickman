# Bildwelt V9 – verbindlich für neue StrichModus-Videos

**Immer zuerst das Skript und die konkrete Aussage verstehen.** Passender Bildtyp statt erzwungener Figuren: szenische Illustration, Hierarchiepyramide, Organigramm, Vergleich, Ablaufgrafik, Zeitleiste, Karte, Infografik, Symbolbild oder Detailaufnahme. Es gibt keine Figuren- oder Diagrammquoten.

Jede V9-Szene in `99-tech/SCENE_PLAN.json` enthält `anchor` (echter Skriptwortlaut), `message` (genaue Kernaussage), `visualType`, `visual` (konkrete kreative Darstellung), mindestens zwei `elements` und ggf. `labels` (max. sieben kurze überprüfte Begriffe). Die Beschriftung ist auch ab Bild 02 **erlaubt**, wenn sie Fakten, Beziehungen oder Reihenfolgen erklärt. Das Cover trägt weiterhin eine 1–4-Wort-Headline.

Die gemeinsame Bildwelt besteht aus handgezeichneten dunklen Tuschekonturen, klarem Comic-Editorial-Design und wiederkehrenden Petrol-, Creme-, Ocker- und Rotakzenten. Wiederkehrende Strichfiguren bleiben konsistent, **müssen jedoch nicht in jedem Bild vorkommen**. Rangfolge, Orte, Karten, Rollen und konkrete Bildaussage vor Freigabe prüfen. Bilder mit falschem Text, falscher Struktur oder bloßer Dekoration neu generieren. Google-Flow-Ausgaben weiterhin als vollständige Fünferblöcke prüfen und sicher importieren.

**Entscheidungsregeln, Beispiele und Qualitätschecks:** `youtube/_intern/SCENE_VISUAL_GUIDE_V9.md`. Neue Projektordner erhalten automatisch `99-tech/VISUAL_BRIEF.md`. Frühere V8-Projekte werden nicht automatisch verändert.

---

# Workflow V9

## Priorität 1 — Lernen vor Geschwindigkeit

Nach dem fertigen Export erstellt der Finalizer einen Review. Erkenntnisse werden in einem globalen Log gespeichert und vor dem nächsten Video als Lernbrief übernommen. Eine menschliche bzw. tatsächliche audiovisuelle Prüfung ergänzt die Messwerte. Details in `CONTINUOUS_IMPROVEMENT.md`.

## Phase 0 — Thema

1. `npm run topic:video -- --topic "THEMA"`
2. Standard: faszinierende **reale** Rollen/Institutionen/Geschichte/Strukturen; etwa `Ein Tag als FBI-Agent`, `Ein Tag im Bundestag`, `Ein Tag im antiken Rom`, `Die Hierarchie einer Mafia erklärt`.
3. Typ `Ein Tag ...`: glaubwürdige Tagesstationen und typische Aufgaben. Typ `Struktur erklärt`: belegte Ebenen, Funktionen, Entscheidungswege, echte Unterschiede. Keine automatisch erfundene Mission.
4. Fantasie, Unsichtbarkeit und Superkraft-Themen nur mit ausdrücklicher Sonderfreigabe; kein Normalfall.
5. Vor Skripterstellung Land/Zeit, reale Rollen, Quellenlage und Fiktion-gegen-Fakten prüfen. Standardinhalt ist `hybrid` mit Recherchepflicht.


## Phase 0A — Schauplatz und deutsche Lebenswelt

- Standard: Deutschland. Bei Thema ohne ausdrückliches Ausland deutsche Orte, Währung, Alltagsdetails und passende deutsche Rollen bevorzugen
- Behörde und Zuständigkeit vor Skriptbeginn prüfen (z. B. BKA, LKA, Kripo, SEK, Zoll, Bundespolizei)
- Deutsche Gesetze und Dienstregeln nur bei überprüfbaren Angaben als Tatsachen erzählen
- Deutsche Alltagsklischees dosiert als Situationshumor einsetzen
- Bei FBI/CIA den Schauplatz USA beibehalten; keine amerikanische Behörde in eine falsche deutsche Kulisse versetzen
- In Phase 1 die gewählte Institution und die Grenze zwischen Tatsachen/Fiktion dokumentieren

## Phase 1 — Skriptformat wählen

Vor dem Schreiben wird in `99-tech/CONTENT_PLAN.json` `scriptFormat.type` gesetzt:

- `mini-stories`
- `progression`
- `story`

Dazu `reason` und `whyThisFormat` ausfüllen.

### mini-stories
Ideal für `Ein Tag als ...`, `Ein Tag im antiken Rom` oder `Ein Tag im Parlament`, wenn der Tag aus mehreren belegbar typischen Stationen besteht.

Beispiel:

```text
Briefing → Ausrüstung → erste Aufgabe → Überwachung → schwieriger Einsatz → Rückkehr
```

Pflicht: `formatPlan.miniStories.orderingLogic` + mindestens 4 starke `sections`.

### progression
Nutzen für belegte Ränge, reale Hierarchien, Mafia-/Kartell-Aufbau, Verantwortungsebenen und Institutionen.

Pflicht: `axis`, `startState`, `endState` + mindestens 4 echte `stages`.

### story
Nur nutzen, wenn es einen belegten Fall oder eine realistische zusammenhängende Handlung gibt. Illustrative Dramatisierung klar von Tatsachen trennen.

Pflicht: Ziel, Problem, Auslöser, mindestens 4 kausale Wendungen, Midpoint, Finale, Setup/Payoff, Callback + mindestens 6 Beats.

## Phase 1B — Einleitung

- Titel-/Cover-Versprechen sofort bestätigen.
- Bei Rollen-Videos Zuschauer direkt in Rolle, Briefing oder erste Aufgabe setzen.
- Kein langer Berufs-Steckbrief vor der ersten Handlung.
- Kein Begrüßungsblock.
- Cover maximal kurz halten.
- Mindestens 4 Bildmomente in den ersten ~10 Sekunden planen.

## Phase 1C — Hauptteil und Schluss

- gesprochenes natürliches Deutsch
- klare Tätigkeiten und Situationen statt Referat
- Einleitung → Hauptteil → Schluss sichtbar planen
- neue Aufgabe, Ort, Risiko, Entscheidung oder Konsequenz hält das Video in Bewegung
- keine künstliche Dauerdramatik
- keine Produktions-/Quellenhinweise im Voice-over

Qualitätsfragen:

```text
Ein-Tag/mini-stories → Will ich die nächste Station sehen?
progression          → Will ich die nächste Stufe sehen?
story                → Will ich wissen, was als Nächstes passiert?
```

Danach:

```bash
npm run validate:phase1 -- --dir "youtube/..."
```

## Phase 2 — Bilder

- Bild 01 = Cover + erste Szene
- 30–42 Bildmomente pro 100 Sekunden als Richtwert, adaptiv
- neues Bild bei neuer Aufgabe, Information, Stufe, Handlung, Konsequenz, Ort oder Transformation

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

Whisper erzeugt echte Wortzeiten aus dem finalen optimierten Voice-over. Daraus wird das komplette zeitcodierte Skript erzeugt; Zeiten werden niemals geschätzt.

Danach enthält `04-export/` mindestens:

```text
FINAL_VIDEO.mp4
THUMBNAIL.png
YOUTUBE_CAPTION.txt
UNTERTITEL_SCRIPT.txt
```

`YOUTUBE_CAPTION.txt` enthält Titel + Beschreibung gemeinsam.

Für jedes neue Video: mindestens 450 Zeichen eigentliche Beschreibung in mindestens zwei Absätzen, mit konkretem Inhalt statt Floskeln. Danach genau **5 unterschiedliche, thematisch passende Hashtags** in einer separaten letzten Zeile. Phase-1-QC und Finalizer kontrollieren Länge und Anzahl.

`UNTERTITEL_SCRIPT.txt` enthält das komplette gesprochene Skript in 10-Sekunden-Blöcken, zum Beispiel:

```text
[00:00 - 00:10]
Gesprochener Text ...

[00:10 - 00:20]
Gesprochener Text ...
```
