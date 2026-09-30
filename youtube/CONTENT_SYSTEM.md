# Content-System — Verückte Stickman V8

## 1. Kanalprinzip

Der Kanal ist **verrücktes Story-Entertainment**. Unterhaltung steht vor Dokumentation, aber der Einstieg muss sofort verständlich sein.

Ein Video darf real, hybrid oder komplett erfunden sein. Recherche ist **kein Standard-Zwang**. Der bevorzugte Modus ist `frei-surreal`.

Die feste Klammer lautet:

```text
starke Prämisse
→ klarer Hook
→ unmittelbares Ziel
→ Problem
→ kausale Eskalation
→ Midpoint-Turn
→ stärkste Eskalation
→ Payoff / Callback
```

## 2. Was die Tests gezeigt haben

### Bierflut-Test
Zu dokumentarisch, zu wenige visuelle Wechsel, zu lange statische Motive.

### Spion-Test
Bilddichte besser, aber das Skript kippt nach dem Hook wieder in ein Referat.

### Spiegel-Test
Bildwelt und Bildmenge deutlich besser. Das Hauptproblem war der **Einstieg**: Cover zu lange sichtbar und zu viele Informationen gleichzeitig, bevor die Zehn-Minuten-Regel wirklich klar war.

Daraus folgt V8:

> Ein Hook darf geheimnisvoll sein, aber niemals so kryptisch, dass der Zuschauer erst später versteht, was die Grundregel überhaupt ist.

## 3. Intro-DNA

In den ersten ungefähr 10 Sekunden müssen vier Fragen beantwortet werden:

```text
WO BIN ICH?
→ WAS IST DIE SELTSAME REGEL?
→ WARUM IST DAS WICHTIG?
→ WAS MUSS JETZT PASSIEREN?
```

Regeln:

- Situation sofort klar machen.
- Regel/Anomalie in einfacher Sprache erklären oder eindeutig zeigen.
- Gefahr oder Ziel spätestens im dritten Satz.
- Nach dem Hook sofort Klarheit statt Hintergrundwissen.
- Mindestens 4 Bildmomente in den ersten 10 Sekunden.
- Cover nur kurz zeigen; Ziel maximal ca. 2,2 Sekunden.
- Kein Intro-Bild länger als ca. 3,2 Sekunden.
- Lange erste Sätze in mehrere visuelle Momente zerlegen.

## 4. Drei Content-Modi

### `frei-surreal` — bevorzugter Standard
Komplett freie Story. Keine Recherchepflicht. Orte, Regeln, Organisationen, Zahlen und Ereignisse dürfen erfunden werden.

### `hybrid`
Reale Kulisse oder Institution plus erfundene Story. Nur reale Behauptungen brauchen intern Belege.

### `real`
Wenn das Video bewusst reale Tatsachen erklären will, wird recherchiert.

## 5. Script-DNA

Nicht:

```text
Das passiert.
Dann passiert das.
Dann passiert noch etwas.
```

Sondern:

```text
Das passiert.
DESHALB musst du X tun.
ABER dadurch entsteht Y.
DESHALB bleibt nur Z.
DOCH Z macht alles schlimmer.
```

### Midpoint-Turn
Zwischen ungefähr 40 und 65 Prozent verändert sich Wahrheit, Regel, Ziel oder Risiko.

### Setup / Payoff
Ein frühes Detail bekommt später eine neue Bedeutung.

### Ende
Kein Fazit. Das Ende zahlt etwas aus, dreht die Story oder greift den Anfang wieder auf.

## 6. Unterhaltungsdichte

Für 1–2 Minuten:

- mindestens 6 Story-Beats
- mindestens 6 Unterhaltungsbeats
- ungefähr alle 6–14 Sekunden eine relevante Veränderung

Mögliche Impulse:

- neue Regel
- Twist
- Gefahr
- visueller Gag
- Transformation
- falsche Sicherheit
- Statuswechsel
- Perspektivwechsel
- absurde Konsequenz

## 7. Sprache

- natürliches gesprochenes Deutsch
- kurze und mittlere Sätze mischen
- konkrete Verben
- keine Produktions- oder Quellenhinweise im Voice-over
- keine Referatssprache
- nicht jeden Witz erklären
- kurze Punch-Sätze gezielt einsetzen

## 8. Themen

Schwach:
- Die Geschichte der CIA
- Fakten über Gefängnisse
- Wie funktionieren Sekten?

Stark:
- Ein Spion bekommt Befehle von seiner eigenen Stimme aus der Zukunft
- Ein Gefängnis bekommt jede Nacht ein neues Stockwerk
- Du wachst in einer Stadt auf, in der Schlaf illegal ist
- Dein Schatten steigt in der Mafia höher auf als du
- Jeder Spiegel zeigt dir, was zehn Minuten später passiert

## 9. Bildplanung

Richtwert: **30–42 Bildmomente pro 100 Sekunden**.

Nicht pauschal immer mehr Bilder. Zusätzliche Bilder besonders an:

- Hook
- schwieriger Erklärung
- Action
- Twist
- Regelwechsel
- Transformation
- starker Reaktion

Bewusst wechseln zwischen Nahaufnahme, Totale, Detail, POV, Größenvergleich, Transformation, surrealem Wechsel und Reaktionsbild.

## 10. Cover

`Bild 01` ist Cover + erste Szene.

- 1–3 Hauptmotive
- deutsche Überschrift mit 1–4 Wörtern
- starke Gefahr, Reaktion oder unmögliche Situation
- Titel und Cover ergänzen sich
- im fertigen Video nur kurz halten

## 11. YouTube-Upload

Vor dem Render werden in `CONTENT_PLAN.json` geplant:

```text
youtubeUpload.title
youtubeUpload.description
```

Nach dem Finalisieren liegt in `04-export/` automatisch:

```text
YOUTUBE_UPLOAD.txt
```

mit finalem Titel und fertiger Beschreibung.

## 12. Qualitätsfrage vor Produktion

Vor der Bildproduktion müssen zwei Fragen mit **Ja** beantwortet werden:

> „Verstehe ich nach 10 Sekunden die Grundsituation?“

> „Will ich wissen, was als Nächstes passiert?“

Wenn nur eine davon Nein ist, wird das Skript zuerst neu geschrieben.
