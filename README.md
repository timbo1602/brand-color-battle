# Brand Color Battle

Brand Color Battle ist ein interaktives Farbenquiz für die Berufsmesse im Bereich Mediengestaltung Digital und Print. In vier Runden mit insgesamt zwölf Aufgaben werden Markenfarben, Farbpaletten, Farbmischung sowie Grundlagen für digitale und gedruckte Gestaltung getestet. Ein perfekter Durchlauf ergibt 1.200 Punkte.

## Technik

Die Web-App besteht ausschließlich aus HTML, CSS und JavaScript. Sie benötigt kein Framework, keinen Build-Schritt und keinen Server. Sounds werden über die Web Audio API direkt im Browser erzeugt.

## Projektstruktur

```text
.
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── config.js
│   ├── config.example.js
│   ├── questions.js
│   └── supabase.js
├── assets/
│   └── congratulations-chameleon.webp
├── .github/workflows/
│   └── deploy-pages.yml
├── .nojekyll
└── supabase-schema.sql
```

## Lokal starten

Die Datei `index.html` im Browser öffnen. Die App funktioniert vollständig offline. Für die beste Darstellung eignen sich aktuelle Versionen von Chrome, Edge oder Firefox.

## GitHub Pages

Die veröffentlichte App ist unter [https://timbo1602.github.io/brand-color-battle/](https://timbo1602.github.io/brand-color-battle/) erreichbar. Ein Push auf `main` startet den Workflow in `.github/workflows/deploy-pages.yml` und veröffentlicht den Inhalt des Repository-Stammverzeichnisses.

Falls Pages für das Repository noch nicht aktiviert ist, unter **Repository → Settings → Pages → Source** einmalig **GitHub Actions** auswählen.

## Bestenliste

Die App unterstützt eine gemeinsame Supabase-Bestenliste für alle Messe-PCs. Ergebnisse werden zusätzlich lokal gespeichert. Bei fehlender Internetverbindung zeigt die App die lokale Liste, merkt neue Ergebnisse vor und überträgt sie automatisch, sobald Supabase wieder erreichbar ist. Eine eindeutige `submission_id` verhindert doppelte Einträge bei Wiederholungsversuchen. Fehler im Backend blockieren das Quiz nicht.

Ohne Supabase-Konfiguration arbeitet die Bestenliste weiterhin vollständig lokal über `localStorage`.

## Supabase aktivieren

1. Ein Supabase-Projekt anlegen und `supabase-schema.sql` vollständig im SQL Editor ausführen.
2. In `js/config.js` die Project URL als `SUPABASE_URL` und den öffentlichen Anon-Key als `SUPABASE_ANON_KEY` eintragen.
3. Die Änderung auf `main` pushen; GitHub Pages veröffentlicht sie automatisch.

Der Anon-Key ist für die Verwendung im Browser vorgesehen und wird durch Row Level Security eingeschränkt. Niemals einen `service_role`-Schlüssel im Frontend verwenden. Anonyme Besucher dürfen ausschließlich die Bestenliste lesen und gültige Ergebnisse eintragen; Updates und Deletes bleiben gesperrt.
