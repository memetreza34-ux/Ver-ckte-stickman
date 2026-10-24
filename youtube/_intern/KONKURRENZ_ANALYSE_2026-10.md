# Konkurrenzanalyse Oktober 2026

Ziel: Verstehen, warum zwei Stickman-Kanäle mit ähnlichem Format deutlich mehr Reichweite holen als StrichModus. Daraus abgeleitet wurden Content-Policy V10, Visual-Policy V10 und `src/lib/story-craft.js`.

## Untersuchte Kanäle

| | POV; This Is You (@povthisisyouu) | Te lo Pinto (@TeloPintoFacil) |
|---|---|---|
| Abonnenten | 16.300 | 581.000 |
| Videos | 126 | 300 |
| Originalsprache | Englisch, KI-Synchronisation in über 20 Sprachen | Spanisch, deutsche Tonspur und deutscher Titel |
| Länge | 13–21 Minuten | 17–36 Minuten |
| Format | „Your Life as Every Rank/Level of …“ | „POV: Du bist …“, „Dein Leben auf jeder Stufe …“, Lebensgeschichten |
| Bestes Video (Stichprobe) | YouTuber nach Monetarisierung: 194.000 Aufrufe | Bestie von Omaha: 2,5 Mio., Mad Jack: 1,7 Mio. |

Detailanalyse: „Your Life as Every Rank of a Special Forces Soldier“ (POV, 12:53, ca. 2.200 Wörter) und „POV: Du bist ein internationaler Waffenhändler“ (Te lo Pinto, 17:15, 937.000 Aufrufe, ca. 2.500 Wörter).

Thematisch nah an StrichModus mit hohen Aufrufen bei Te lo Pinto: „So jagt dich das FBI bei jedem Verbrechen“ (340.000), „So fühlt sich jede Stufe als Auftragskiller an“ (283.000), „Alle Ränge der ALBANISCHEN MAFIA erklärt“ (157.000), „Dein Leben auf jeder Stufe des MI6“ (161.000).

## 1. Wie die Skripte geschrieben sind

**Der Zuschauer ist die Hauptfigur und verändert sich.** Beide Skripte sind konsequent in der zweiten Person geschrieben. Der Waffenhändler startet als harmloser Logistik-Absolvent und endet als fallengelassener Sündenbock. Der Soldat startet als 19-Jähriger, der eine Doku dreimal schaut, und endet als Veteran, der selbst junge Rekruten mustert. Jede Stufe verändert Status, Risiko oder Selbstbild.

**Eine innere Stimme trägt das Video.** Beim Waffenhändler kehrt ein Rechtfertigungssatz („ist doch nur Logistik“) in jeder Stufe wieder und wird von Mal zu Mal fadenscheiniger. Beim Soldaten sind es wiederkehrende Motive (die Doku, die zwei Worte eines Aufgebenden, „die 12“). Diese Wiederholung ist der rote Faden, kein Erzähler-Satz wie „Damit kommen wir zur nächsten Stufe“.

**Fakten werden erlebt, nicht vorgetragen.** Endnutzerzertifikate, Briefkastenfirmen oder die Durchfallquote der Auswahl kommen als Moment im Leben der Figur vor. Kein „laut Unterlagen“, keine wiederholten Absicherungen.

**Konkrete Details statt Allgemeinplätze.** Eine Uhr, die mehr wert ist als dein Auto; ein Pilot, der Wodka frühstückt; 04:30 Uhr Wecken; 23.000 Dollar Sold; 42 Prozent Durchfallquote. Pro Stufe gibt es mindestens einen erinnerbaren Gegenstand, einen Betrag oder einen Satz.

**Rhythmus.** Normale Sätze wechseln mit sehr kurzen Sätzen, oft aus zwei bis vier Wörtern. Vorahnungen kündigen die Fallhöhe an („Du bist kein Bösewicht. Noch nicht.“, sinngemäß).

**Ende = Anfang verwandelt.** Der Waffenhändler endet mit derselben Regel wie am Anfang im Hafen (Container mit korrekten Papieren öffnet niemand), jetzt auf ihn selbst angewendet. Der Soldat endet mit einem neuen 19-Jährigen, der dieselbe Doku schaut. Danach folgt höchstens ein kurzer Abo-Satz.

## 2. Bildwelt

- **Te lo Pinto:** weiße runde Köpfe, sehr ausdrucksstarke Gesichter (rote Augen, Sonnenbrille, Schweißlinien), farbige detaillierte Kulissen (Lagerhalle mit Kisten, Hotelbar, Weltkarte mit Flugzeugen). Der **Status zeigt sich über Kleidung**: Hut, Anzug und Zylinder kommen mit dem Aufstieg. Objekte werden als Heldenbild inszeniert (ein goldener Stempel auf einem Dokument).
- **POV:** gleiche Figur mit Meme-Gesicht (überhebliches Grinsen, Panik), filmisches Licht, Innenräume mit Lampenstimmung.
- **Gemeinsam:** Jedes Video hat eigene Schauplätze, die wiederkehren. Karten und Schaubilder gibt es nur, wo sie die Handlung erklären.

## 3. Thumbnails

- Te lo Pinto: 1–3 Wörter in riesiger Schrift („NAVY SEALS“, „ALLE WAREN HIGH“), eine bis zwei große Figuren mit extremer Emotion oder ein Symbolobjekt, das das ganze Bild füllt (Tisch voller Waffen).
- POV: oft ganz ohne Text, dafür ein Vorher/Nachher-Kontrast derselben Figur (abgerissen gegen erfolgreich) oder eine Panik-gegen-Grinsen-Gegenüberstellung.

## 4. Titel und Beschreibung

- Titel versprechen ein **Erlebnis** (POV, Du, Dein Leben) oder eine **vollständige Struktur** (jede Stufe, alle Ränge), nicht ein Thema („Die Hierarchie der Mafia erklärt“).
- Te lo Pinto lokalisiert Titel und Beschreibung ins Deutsche und hat eine deutsche Tonspur.
- POV-Beschreibung: ein Absatz mit konkreten Teasern aus dem Video, danach **Kapitelmarken pro Level**, Hashtags und ein langes Keyword-Set.

## 5. Vergleich mit StrichModus (Mafia KW42, FBI KW41)

Gemessen mit `auditStoryCraft` (V10):

| Kennzahl | Mafia KW42 | FBI KW41 | V10-Mindestwert |
|---|---|---|---|
| Du-Formen pro 100 Wörter | 0,16 | 4,23 | 3 |
| Zahlen/Uhrzeiten/Beträge pro 1000 Wörter | 1,65 | 5,8 | 8 |
| Anteil Kurzsätze (≤ 6 Wörter) | 1 % | 1 % | 12 % |
| Erklärfloskeln („wir steigen …“, „damit kommen wir zu …“) | 6 | 0 | 0 |
| Absicherungen („natürlich kein Beweis“, „nicht automatisch“) | 6 | 5 | ≤ 3 pro 1000 Wörter |

Weitere Befunde:

- Die bisherige Phase-1-Prüfung war rein formal. Beide Projekte bestanden, das FBI-Skript mit selbst vergebenen 9/10 Punkten.
- Fast jeder Satz hat 10–11 Wörter. Vorgelesen klingt das gleichförmig.
- Das Mafia-Skript ist ein Lexikoneintrag in der dritten Person. Das FBI-Skript nutzt „Du“, nimmt aber die Spannung mit wiederholten Hinweisen wie „das ist natürlich noch kein Beweis“ heraus. Außerdem ist der Einsatz klein (Spendenbetrug), und es gibt keine innere Entwicklung.
- Die FBI-Bildprompts waren Vorlagen mit fünf ausgetauschten Wörtern und identischem Restblock. Eine eigene Welt mit Orten, wiederkehrenden Figuren und Leitmotiv fehlte.
- Titel: „Die Hierarchie der Mafia erklärt – vom Außenstehenden bis zum Boss“ beschreibt ein Thema, verspricht aber kein Erlebnis. Keine Kapitelmarken, keine Tags.
- Länge: 6–7,5 Minuten gegenüber 13–36 Minuten bei den Vorbildern.

## 6. Was V10 daraus macht

| Bereich | Umsetzung |
|---|---|
| Skript | `CONTENT_PLAN.storyEngine` (Perspektive, Ausgangslage/Ziel/Überzeugung, Einsatz, innere Stimme ≥ 3 Stufen, Wendepunkte ≥ 4, Callback-Motiv) und automatische Prüfung `auditStoryCraft` |
| Bildwelt | `SCENE_PLAN.visualWorld` pro Video (Look, Palette, Licht, Orte, Figuren mit Statusstufen, Leitmotiv); jede Szene nennt Ort, Figuren und Stufe; Flow-Prompts enthalten ORT, FIGUREN, LEITMOTIV und MIMIK |
| Thumbnail | Regeln aus der Analyse in `visual-policy.thumbnailDNA.learnedFromCompetitors` |
| Titel | Titelformeln in `content-policy.titleCoverPolicy.titleFormulas`, Prüfung `auditTitle` |
| Beschreibung | Kapitel aus `SCENE_PLAN.chapter`, beim Export mit echten Bildzeiten; 8–20 Tags |

## Offene Punkte (bewusst nicht automatisiert)

- **Länge:** Die Vorbilder sind zwei- bis fünfmal so lang. Längere Videos brauchen proportional mehr Flow-Bilder (30 pro 100 Sekunden). Entscheidung über 10+ Minuten erst, wenn die Bildproduktion mithält.
- **Mehrsprachige Tonspuren:** Beide Vorbilder erreichen über Synchronisation zusätzliche Märkte. Für StrichModus wäre der umgekehrte Weg denkbar: eine englische Tonspur über YouTubes automatische Synchronisation.
- **Echte Wirkung:** Ob V10 Klicks und Zuschauerbindung verbessert, zeigt erst YouTube Analytics nach Veröffentlichung. Die Regeln sind Hypothesen aus zwei Kanälen, keine Garantie.
