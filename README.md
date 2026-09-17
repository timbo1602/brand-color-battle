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
│   ├── config.example.js
│   └── questions.js
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

Die App speichert die zehn besten Ergebnisse in `localStorage`. Dadurch bleibt die Bestenliste im verwendeten Browser auf dem jeweiligen PC erhalten. Sie wird nicht zwischen Geräten synchronisiert und kann beim Löschen der Browserdaten verloren gehen. Eine beschädigte oder nicht verfügbare lokale Speicherung blockiert das Quiz nicht.

Als nächste Erweiterung ist eine gemeinsame Supabase-Bestenliste für alle Messe-PCs vorgesehen. `supabase-schema.sql` enthält dafür einen vorbereiteten Tabellen- und RLS-Entwurf. In `js/config.example.js` sind die später benötigten öffentlichen Konfigurationswerte dokumentiert. Für die Anbindung werden `SUPABASE_URL` und `SUPABASE_ANON_KEY` benötigt; ein `service_role`-Schlüssel darf niemals im Frontend verwendet werden.
