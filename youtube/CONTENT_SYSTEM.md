# Content-System — Verückte Stickman

Dieses Dokument beschreibt die verbindliche inhaltliche Produktionslogik. Die vollständigen maschinenlesbaren Regeln stehen in `config/content-policy.json`.

## Grundsatz

Die **Kanal-DNA bleibt gleich**, aber jedes Video wird inhaltlich neu entwickelt. Es gibt keine starre Hook-, Skript- oder Cover-Schablone, die blind auf jedes Thema gelegt wird.

Für jedes Video werden individuell festgelegt:

- Zuschauer-Versprechen
- konkreter Blickwinkel
- Hook-Typ und Hook-Text
- Erzählmodus
- Story-Beats und Eskalation
- Retention-Punkte
- Payoff / Auflösung
- finaler Titel
- Cover-Konzept
- Zusammenspiel von Titel und Cover

## 1. Vor dem Skript

Zuerst beantworten:

1. Was ist an diesem Thema wirklich sehenswert?
2. Was ist daran verrückt, absurd, überraschend, düster oder ungewöhnlich?
3. Welche konkrete Frage oder Neugier soll der Zuschauer bis zum Ende verfolgen?
4. Welche Information ist der Payoff?
5. Welche Erzählform passt genau zu diesem Thema?

Das Ergebnis wird in `00-plan/CONTENT_PLAN.json` festgehalten.

## 2. Hook

Der Hook startet sofort. Keine Begrüßung und kein generisches Kanal-Intro.

Mögliche Hook-Arten sind zum Beispiel:

- Schock-Behauptung
- bizarre Frage
- Mini-Szene
- Kontrast
- versteckte Wahrheit
- Eskalations-Vorschau
- Konsequenz-Hook
- unmöglich klingender Fakt

Es wird **nicht automatisch immer derselbe Hook-Typ** gewählt.

## 3. Skript und Dramaturgie

Das Skript ist keine lose Faktenliste. Jeder Abschnitt hat eine Funktion.

Je nach Thema kann die Geschichte z. B. als Eskalationsleiter, Mysterium, chronologischer Absturz, Rangreise, Figurenreise, Hierarchie-Erklärung, Ursache-Wirkung-Kette oder Rabbit-Hole aufgebaut werden.

Typischer Spannungsverlauf kann sein:

```text
Hook
→ notwendiger Kontext
→ erste interessante Entwicklung
→ neue Ebene / Konsequenz
→ Wendepunkt oder stärkere Eskalation
→ stärkster / absurdester Teil
→ Payoff und Einordnung
```

Das ist **kein Pflichtschema**. Wenn ein Thema anders besser funktioniert, wird die Struktur angepasst.

## 4. Retention

Retention entsteht aus Inhalt, nicht aus künstlichem Dauer-Schnitt.

- neue Information statt Wiederholung
- offene Frage später beantworten
- Perspektivwechsel, neue Figur oder neue Stufe nur wenn sinnvoll
- stärkste Information nicht komplett am Anfang verbrauchen
- ruhige Momente sind erlaubt, wenn sie etwas vorbereiten oder erklären

## 5. Titel + Cover

Titel und Cover werden als **gemeinsames System** geplant.

Der Titel transportiert das Versprechen oder die Neugier. Das Cover zeigt den stärksten visuellen Konflikt, die Transformation, Hierarchie, absurde Situation oder Reaktion.

Sie sollen sich **ergänzen**, nicht dieselbe Aussage doppelt wiederholen.

### Cover-Regeln

- `Bild 01` = Cover + erste Videoszene
- meist 1–3 große Motive
- sofort verständlicher Fokus
- starke Emotion oder visueller Konflikt
- einfacher, kontrastreicher Hintergrund
- sichtbarer Text optional und nur auf Deutsch
- wenn Text: wenige große Wörter
- keine Informationsüberladung
- visuell zugespitzt, aber inhaltlich ehrlich

## 6. Verbindung zur Bildwelt

Erst wenn Hook, Story, Titel und Cover-Konzept feststehen, wird der Bildplan erstellt. Die visuelle DNA aus `config/visual-policy.json` bleibt fest; ihre konkrete Anwendung wird an das jeweilige Video angepasst.
