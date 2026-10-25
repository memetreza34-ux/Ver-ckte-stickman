# Szenenbasierte Bildplanung – StrichModus V9

Lies youtube/_intern/SCENE_VISUAL_GUIDE_V9.md und die aktuelle config/visual-policy.json.
Niemals pauschal fünf Figurenbilder pro Batch generieren: Jede gesprochene Aussage bekommt ihren idealen Bildtyp.
Jede SCENE_PLAN.json-Szene braucht exakten Skriptanker, Kernaussage (message), visualType, konkrete Komposition (visual), mindestens zwei wichtige elements und bei Erklärgrafiken 2–7 exakte kurze labels.
Für Handlungen: szene oder detail. Für Rangstufen: hierarchie. Für Beziehungen: organigramm. Für Unterschiede: vergleich. Für Folge: ablauf. Für Geschichte: zeitleiste. Für Orte: karte. Für belegte Größen: infografik.
Keine Bild- oder Diagrammquoten. Ein durchgängiger handgezeichneter Editorial-Comic-Stil. Kurze deutsche Schrift nur bei tatsächlichem Informationsgewinn. Fakten prüfen.
Danach npm run compile:flow -- --dir "youtube/<week>/<slug>" ausführen, alle echten Bilder visuell prüfen und fehlerhafte Versionen neu generieren.

## V10: eigene Bildwelt für dieses Video
Fülle SCENE_PLAN.json → visualWorld: name, look (Stimmung/Material genau dieses Videos), palette (3–6 Farben), lighting, mindestens 3 locations mit festen Details, cast mit look und stages (Status über Kleidung/Requisiten), motif (Leitmotiv für Anfang und Ende).
Jede Szene vom Typ szene/detail nennt location; Figuren über cast, Statusstufe über stage; motif: true im ersten und letzten Zehntel; chapter markiert YouTube-Kapitel (erstes bei Bild 01).
Story und Titel: youtube/_intern/STORY_GUIDE_V10.md, CONTENT_PLAN.storyEngine, Titelformeln in config/content-policy.json.
