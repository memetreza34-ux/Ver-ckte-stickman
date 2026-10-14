# StrichModus – Visual Guide V9 (verbindlich für NEUE Videoprojekte)

## Warum die Bildwelt geändert wurde

Das Nutzerfeedback zum Mafia-Hierarchie-Video vom 14.10.2026 ist eindeutig: Zu viele nahezu austauschbare Strichfiguren in Zimmern, zu wenig Bilder, die die konkrete gesprochene Information veranschaulichen. Das ist **kein** Aufruf zu beliebigem Stilwechsel. Die Markenidentität bleibt als konsistente handgezeichnete 2D-Editorial-Comicwelt erhalten – nur die Bildgestaltung wird intelligenter.

**Oberster Grundsatz: Erst Erkenntnisabsicht, dann Bildidee.** Für *jeden* Audiomoment exakt klären, was der Zuschauer anschließend versteht. Nur dann die passende grafische Form entscheiden. Weder Stickman noch Infografik haben eine Mindest-/Maximalquote.

## Bildtypen bewusst wählen

| Was im Skript gerade erklärt wird | visualType | Gute Bildidee |
|---|---|---|
| Eine Handlung, Situation, Entscheidung oder Emotion | `szene` | Strichfiguren mit erkennbarer Tätigkeit, konkreter Umgebung, Aktion und Konsequenz |
| Ein Machtgefälle oder Ränge | `hierarchie` | Klar beschriftete, schöne, themenspezifische Pyramide; korrekte Rangfolge |
| Befehlskette, Beratung oder Zuständigkeiten | `organigramm` | Rollen, Linien, gerichtete Verbindungen und getrennte Beratungs-/Kommandowege |
| Zwei Gruppen, Ränge, Zustände, Vorher/Nachher | `vergleich` | Deutlicher Split-Screen mit exakt den wesentlichen Unterschieden |
| Ablauf, Verfahren, Entscheidung | `ablauf` | 3–6 klare Stationen und Pfeile mit richtiger Reihenfolge |
| Geschichte, Wandel, zeitliche Abfolge | `zeitleiste` | Lesbare Zeitachse mit geprüften Jahreszahlen/Ereignissen |
| Schauplatz, Zuständigkeit oder räumliche Beziehung | `karte` | Illustrierte geografisch richtige Karte |
| Tatsächlich recherchierte Mengen oder Zusammenhänge | `infografik` | Wenige korrekt bemessene Größen, Kreise, Balken oder illustrative Symbole |
| Eine zentrale Idee atmosphärisch zeigen | `symbolbild` | Ein markantes spezifisches Symbol, keine dekorative Figurengruppe |
| Ein Gerät, Dokument, Beweisstück, Ausrüstungsdetail | `detail` | Detailansicht mit klarer Aussage |

**Die Bildtyp-Entscheidung folgt dem Inhalt.** Auch vier aufeinanderfolgende Organigrammbilder wären richtig, *wenn* vier unterschiedliche Zusammenhänge aufeinander aufbauen. Fünf unterschiedliche Typen sind falsch, wenn sie willkürlich wechseln. Lebendige Figuren und Grafiken dürfen innerhalb *derselben* Szene kombiniert werden, wenn die Hauptidee klar bleibt.

## In allen Varianten dieselbe visuelle Marke

- Handgezeichnete dunkle Tuschelinien, große Formen, Comic-Editorial-Illustration mit wenig Papiertextur.
- Basisfarben: Creme, Petrol/Nachtblau, Anthrazit, warmes Ocker, gedämpftes Rot. Pro Motiv wenige funktionale Akzente (z. B. Cyan oder Gelb).
- Filmisches Licht und plastische Tiefe bei Spielszenen. Grafiken nicht als weiße PowerPoint-Folien, sondern stilisiert mit Papier-/Tuschelook, passenden Symbolen und klaren Kontrasten.
- Wenn Menschen vorkommen: klassische lebendige Strichmännchen mit wiedererkennbarem Accessoire. Bei Pyramiden/Karten/Prozessen müssen überhaupt keine Figuren vorkommen.
- Deutsche Beschriftungen im gesamten Video **erlaubt und erwünscht, wenn sie Wissen vermitteln**. Echte ausländische Eigennamen und etablierte Funktionsbezeichnungen nicht willkürlich übersetzen.
- Pro Grafik maximal sieben kurze, große, überprüfte Labels (je max. vier Wörter). Kein Fließtext, keine Fantasieschrift. Fehlerhafte Flow-Schrift neu generieren bzw. nachbearbeiten.
- Das erste Bild bleibt zugleich Cover mit **einer einzigen 1–4-Wort-Headline**.

## Jedes Bild braucht ein konkretes Briefing

Der Producer erstellt vor der ersten Flow-Generierung `99-tech/SCENE_PLAN.json` mit `world`, `coverVisual` und `scenes`. Jede Szene:

- `anchor`: **exakte Wortfolge aus dem fertigen Voice-Skript**, in derselben Reihenfolge; Bild 01 beginnt mit dem Skriptanfang.
- `message`: Die **eine** konkrete gesprochene Kernaussage; kein generisches „Mafia erklärt“.
- `visualType`: Die inhaltlich passendste Darstellung aus der Tabelle.
- `visual`: Ein klares, auf die Aussage maßgeschneidertes Arrangement; nicht „mehrere Männer stehen in einem Raum“.
- `elements`: Mindestens zwei spezifische visuelle Bestandteile, die genau zur Aussage gehören.
- `labels`: Exakte, überprüfte Bildbeschriftungen (bei Erklärgrafiken 2–7), sonst `[]`. Bei Cover kein zusätzliches Label einfügen.
- Optional: `group`, `shot`, `motion`. Bei Karten/Infografiken Zahlen und geografische Namen vor Verwendung anhand der Recherche verifizieren.

### Beispielauszug: Mafia-Hierarchie

Die folgenden Anker sind **nur Beispiele** und müssen beim echten Video durch wörtliche Anker aus dessen Skript ersetzt werden. Keine beispielhaften Formulierungen als historische Belege behandeln.

```json
{
  "world": "Eine einheitliche handgezeichnete 2D-Editorial-Comicwelt rund um das New Yorker Mafia-Milieu: Creme-Papierflächen, Tuschekonturen, dunkles Petrol, warmes Ocker, Akzente in Bordeauxrot. Karten, Prozessbilder und Figuren teilen dieselbe Linienführung, typografische Hierarchie und Kolorierung.",
  "coverVisual": "Eine klar erkennbare Rangpyramide ragt bedrohlich über eine kleine charaktervolle Strichfigur. Die Spitze rot illuminiert; ein starkes visuelles Rätsel statt vielen Personen im Zimmer.",
  "scenes": [
    {
      "anchor": "Bei der Mafia steht oben",
      "message": "Die Familie ist hierarchisch aufgebaut und der Boss steht oben.",
      "visualType": "hierarchie",
      "visual": "Große maßgeschneiderte Rangpyramide auf leicht texturierter, dunkelpetrolfarbener Papierfläche mit rotem Licht an der Spitze. Nur real passende Stufen und keine unnötigen Figuren.",
      "elements": ["Rot illuminierte Pyramidenspitze", "Darunter abgestufte, präzise getrennte Rangfelder"],
      "labels": []
    },
    {
      "anchor": "Ganz unten stehen Außenstehende",
      "message": "Außenstehende sind nicht dasselbe wie offiziell aufgenommene Mitglieder.",
      "visualType": "vergleich",
      "visual": "Links Kontakte außerhalb des inneren Rings, rechts Mitglieder im markierten Ring; visuell ein sofort lesbarer Statusunterschied, klare Trenngrenze und dieselbe grafische Welt.",
      "elements": ["Außenring in Ocker", "Innenring in Bordeauxrot"],
      "labels": ["Außenstehende", "Mitglieder"]
    },
    {
      "anchor": "Jede Ebene hat andere Aufgaben",
      "message": "Die Verantwortung und die Befehlswege unterscheiden sich je Hierarchiestufe.",
      "visualType": "organigramm",
      "visual": "Beschriftete Hierarchieboxen mit klaren durchgezogenen Kommandolinien und optional gestrichelter beratender Verbindung. Fachlich korrekte Zuordnung prüfen.",
      "elements": ["Vertikale Kommandolinien", "Seitliche beratende Verbindung"],
      "labels": ["Boss", "Underboss", "Consigliere", "Capo"]
    },
    {
      "anchor": "Wir steigen diese Struktur",
      "message": "Wir erklären jetzt die einzelnen Ebenen von unten nach oben.",
      "visualType": "szene",
      "visual": "Ein erkennbarer Strichmann mit grüner Kappe steigt auf einer illustrativen Treppe aus kühlen in warme Lichtzonen. Jede Stufe hat Bezug zur Rangfolge statt beliebiger Gangszene.",
      "elements": ["Grün bekappter Erzähler", "Aufsteigende Stufen mit deutlicher Perspektive"],
      "labels": []
    },
    {
      "anchor": "Dabei geht es um die amerikanische",
      "message": "Die folgende Erklärung bezieht sich auf eine amerikanische Organisation und nicht auf jede Mafia weltweit.",
      "visualType": "karte",
      "visual": "Handgezeichnete, geografisch richtige Karte von New York/USA mit präzisem Fokus auf den behandelten Ort. Keine erfundenen Standorte oder Zuständigkeiten.",
      "elements": ["Kartenumriss der USA", "Hervorgehobener Bereich New York"],
      "labels": ["USA", "New York"]
    }
  ]
}
```

**Hinweis:** In diesem Auszug benötigt die erste Grafik außerhalb des Covers mindestens zwei Labels. Das Cover zeigt ausschließlich die aus `CONTENT_PLAN.titleCoverSystem.coverConcept.visibleText` übernommene 1–4-Wort-Headline; bei echten SCENE_PLAN-Dateien muss auch das erste Scene-Briefing den korrekten visuellen `visualType` nutzen. Alle fünf exemplarischen `anchor`-Texte müssen vor Verwendung gegen das echte Skript geprüft werden.

## Produktionskontrollen

1. **Redaktionell planen:** Skript abschnittsweise verstehen, Bildtyp pro Kernaussage wählen, echte Fakten und Begriffe verifizieren, wiederholte generische Figurenbilder aktiv ersetzen.
2. `npm run compile:flow -- --dir "youtube/<week>/<slug>"`: V9 kontrolliert verpflichtende Felder und bildet fünf vollständige Flow-Batches.
3. **In Flow** alle Bilder tatsächlich erzeugen und einzeln ansehen: passt Bild *zu genau diesem gesprochenen Moment*, ist es im gleichen Stil, stimmen Pyramiden/Beziehungen/Orte und Labels? Fehlende/falsche Bilder erneut generieren. Eine Prompt-Textprüfung kann das NICHT sehen.
4. **Exakt zuordnen**: nach dem gemeinsamen Download sicher importieren; bei nicht nummerierten Dateien den geprüften `FLOW-ORDER.json`-Manifestmodus verwenden.
5. `npm run review:images -- --dir "youtube/<week>/<slug>"` und jedes Bild ansehen; visuelle Freigaben durch SHA-256 an die Bilddatei binden. Ein geändertes Bild muss erneut geprüft werden.
6. **Erst dann rendern und fertiges Video ansehen.** Besonders prüfen, ob der Bildtyp zum gesprochenen Satz passt – im Sekundentakt und nicht nur anhand hübscher Standbilder.

V8-Bestandsvideos dürfen weiter ihren bisherigen Stand behalten. Neue Videos nutzen Version 9.
