# Kontinuierliche Verbesserung – Kanalpriorität Nummer 1

**Das nächste Video soll aus den wirklichen Ergebnissen des letzten Videos lernen.**

Nach jedem fertigen Export werden `99-tech/POST_VIDEO_REVIEW.json` und `99-tech/POST_VIDEO_REVIEW.md` erstellt. Der Review misst reale technische Eigenschaften, darunter tatsächliche Laufzeit, Sprechtempo, Bilddichte, Einleitung und zu lange Standbilder.

Zusätzlich das fertige Video tatsächlich ansehen und anhören: Themenattraktivität, Hook, Skript, Humor, Stimme, Bild-Text-Passung, wiederkehrende Figuren, Schnitt und Thumbnail sind keine zuverlässig aus reinen Zahlen messbaren Qualitätsurteile.

Feedback kann optional in `99-tech/POST_VIDEO_FEEDBACK.json` ergänzt werden. Format:

    {
      "observations": [
        {"area":"Skript","observation":"Der Einstieg war zu kompliziert.","action":"Die Situation im ersten Satz klar erklären.","priority":"high"}
      ]
    }

Dann `npm run review:video -- --dir "youtube/<week>/<slug>"` erneut ausführen, damit die neuen Erkenntnisse in `youtube/LEARNING_LOG.json` landen. Diese Datei und den Review ins Repository committen.

Beim Erstellen des nächsten Projekts übernimmt `create:video` den `config/learning-playbook.json` und die jüngsten Review-Erkenntnisse automatisch in `99-tech/LEARNING_BRIEF.md` und `CONTENT_PLAN.learningFromPreviousVideos`.

Keine Behauptung automatischer Kreativqualität oder unsichtbarer Dauerüberwachung: Der Review läuft beim lokalen Export. Echte YouTube-Analytics werden erst nach einem separaten Import berücksichtigt. Jede bedeutende Änderung wird getestet.
