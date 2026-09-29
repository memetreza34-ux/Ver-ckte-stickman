# Content-System — Verückte Stickman

## Grundsatz

Die Kanal-DNA bleibt gleich, aber jedes Video wird individuell entwickelt. Hook, Story, Titel, Cover und Bildfolge werden nicht blind aus einer Schablone kopiert.

## Kanalfit und Recherche

`99-tech/CONTENT_PLAN.json` benötigt mindestens 7/10 Kanalfit und einen konkreten Kanalpfeiler. `99-tech/RESEARCH.json` ist Pflicht; zentrale Tatsachenbehauptungen werden mit echten Quellen verknüpft und Unsicherheiten sauber markiert.

## Hook, Story und Retention

Der Hook ist der erste gesprochene Inhalt. Mindestens drei individuelle Story-Beats und mindestens zwei konkrete Retention-Punkte. Die Erzählform wird passend zum Thema gewählt.

## Titel + Cover

Titel und Cover bilden gemeinsam den Klickgrund. `Bild 01` ist Cover und erste Szene. Das Cover hat immer 1–3 große Motive und **immer eine deutsche Überschrift mit 1–4 Wörtern**. Diese Überschrift ergänzt den Titel, statt ihn vollständig zu wiederholen.

## Google-Flow-Ausgabe

Interne Planung bleibt intern. Flow bekommt weder Recherche noch Content-Policy noch Voice-over als Datenblock. Die einzige Übergabedatei ist:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Wie bei den bewährten Erklär-Reel-Prompts enthält sie zuerst einen globalen Style-Lock. Danach folgt pro Bild ein eigenständiger Prompt, der die konkrete Szene vollständig beschreibt. Dadurch muss das Bildmodell nicht aus Metadaten selbst erraten, was es zeichnen soll.

## Ending

Das Ende löst das Zuschauer-Versprechen ein. Ending-Typ und finale Zeile stehen im internen Content-Plan und müssen im Skript umgesetzt sein.
