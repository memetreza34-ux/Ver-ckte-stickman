# Content-System — Verückte Stickman

## Grundsatz

Die Kanal-DNA bleibt gleich, aber jedes Video wird inhaltlich neu entwickelt. Hook, Story, Titel, Cover und Bildfolge werden nicht blind aus einer Schablone kopiert.

## 1. Kanalfit

Vor dem Skript wird bewertet, ob das Thema zur Kanal-DNA passt. `CONTENT_PLAN.topicFit` braucht:

- mindestens 7/10
- `verdict: "APPROVED"`
- mindestens einen passenden Kanalpfeiler
- eine konkrete Begründung

Die breite Nische umfasst bizarre, dunkle, absurde, psychologische, kriminelle, historische, extreme, mysteriöse oder surreal starke Unterhaltungsthemen.

## 2. Recherche

`RESEARCH.json` ist Pflicht. Zentrale Tatsachenbehauptungen werden mit Quellen verknüpft. Unsicheres wird als `wahrscheinlich` oder `umstritten` markiert. Quellen werden niemals erfunden.

## 3. Hook

Der Hook ist der erste gesprochene Inhalt. Keine Begrüßung und kein generisches Intro. Der Hook muss zum konkreten Thema passen und später eingelöst werden.

## 4. Story und Retention

Mindestens drei individuelle Story-Beats. Retention entsteht aus neuen Informationen, offenen Fragen, Eskalationen, Perspektivwechseln oder bewusst gesetzten Pattern Interrupts. Mindestens zwei konkrete Retention-Signale werden vorab geplant.

## 5. Titel + Cover

Titel und Cover ergänzen sich. Bild 01 ist Cover und erste Szene. Cover meist mit 1–3 großen Motiven, klarer Emotion und wenigen oder keinen deutschen Wörtern.

## 6. Ending

Das Ende löst das Zuschauer-Versprechen ein. Ending-Typ und finale Zeile werden im Content-Plan festgelegt und müssen im Skript auftauchen.

## 7. Übergabe an Google Flow

Der externe Bildgenerator darf keine lokalen Repo-Dateien voraussetzen. Deshalb wird nach fertiger Phase 1 `FLOW_MASTER_PROMPT.txt` erzeugt. Er enthält:

- Content-Policy
- Visual-Policy
- ausgefüllten Content-Plan
- Recherche
- finalen Voice-over-Text
- vollständigen Bildplan

Dieser Masterprompt ist die einzige Übergabedatei an Flow.
