# Brand Color Battle

**Brand Color Battle** ist ein interaktives Browser-Quiz für eine Berufsmesse im Bereich **Mediengestaltung Digital und Print**. Die Teilnehmenden testen in vier Runden ihr Wissen über Markenfarben, Farbpaletten, Farbmischung sowie digitale und gedruckte Gestaltung.

Das Quiz umfasst zwölf Aufgaben mit insgesamt maximal 1.200 Punkten. Die Ergebnisse werden lokal gespeichert und bei bestehender Internetverbindung zusätzlich in einer gemeinsamen Supabase-Bestenliste veröffentlicht.

## Projektlinks

- [Quiz auf GitHub Pages](https://timbo1602.github.io/brand-color-battle/)
- [Globales Live-Dashboard](https://timbo1602.github.io/brand-color-battle/dashboard.html)
- [GitHub-Repository](https://github.com/timbo1602/brand-color-battle)

## Funktionen

- vier Runden mit jeweils drei Aufgaben
- verschiedene Fragetypen zu Farben, Marken und Gestaltung
- interaktiver Farbmischer
- Punktevergabe mit maximal 1.200 Punkten
- lokale Top-10-Bestenliste auf jedem Gerät
- gemeinsame Bestenliste über Supabase
- Offline-Warteschlange für noch nicht übertragene Ergebnisse
- Sounds für Spielstart, Antworten, Rundenwechsel und Abschluss
- Sound-Schalter, Neustart und Vollbildmodus
- separates Live-Dashboard für große Messe-Displays
- responsive Darstellung für Desktop, Tablet und Smartphone

## Bedienung

1. Auf der Startseite einen Spitznamen eingeben und das Battle starten.
2. Die zwölf Aufgaben in vier Runden beantworten.
3. Nach dem letzten Ergebnis die eigene Punktzahl und Bestenliste ansehen.
4. Über **Globales Dashboard** die gemeinsame Rangliste aller Geräte öffnen.
5. Das Dashboard über den Button **Vollbild** oder die Taste `F` für einen großen Bildschirm aktivieren.

## Technik

Die Anwendung besteht aus reinem **HTML, CSS und JavaScript**. Sie verwendet kein Framework und benötigt weder einen Build-Schritt noch einen eigenen App-Server.

- Hosting: GitHub Pages
- Datenbank und REST-API: Supabase
- Audio: Web Audio API
- lokale Speicherung: Web Storage API (`localStorage`)
- Veröffentlichung: GitHub Actions

Das Quiz bleibt auch ohne Internetverbindung nutzbar. Das globale Dashboard und die geräteübergreifende Bestenliste benötigen eine Internetverbindung.

## Projektstruktur

```text
.
├── index.html                      # Quiz
├── dashboard.html                  # globales Live-Dashboard
├── css/
│   ├── dashboard.css
│   └── style.css
├── js/
│   ├── app.js                      # Spiellogik und Benutzeroberfläche
│   ├── config.js                   # öffentliche Supabase-Konfiguration
│   ├── config.example.js           # Konfigurationsvorlage
│   ├── dashboard.js                # Daten und Anzeige des Dashboards
│   ├── questions.js                # Runden und Fragen
│   └── supabase.js                 # globale Bestenliste und Offline-Sync
├── assets/
│   └── congratulations-chameleon.webp
├── .github/workflows/
│   └── deploy-pages.yml
├── .nojekyll
└── supabase-schema.sql
```

## Lokal starten

Für einen einfachen Test genügt es, `index.html` in einem aktuellen Browser zu öffnen. Alternativ kann im Projektordner ein lokaler Webserver gestartet werden:

```bash
python3 -m http.server 4173
```

Das Quiz ist danach unter `http://127.0.0.1:4173/` erreichbar.

## Bestenliste und Datenschutz

Die lokale Top 10 wird ausschließlich im jeweiligen Browser gespeichert. Bei aktiver Supabase-Verbindung werden folgende Angaben in der gemeinsamen Bestenliste gespeichert:

- der eingegebene Spitzname mit maximal 18 Zeichen
- die erreichte Punktzahl
- der Zeitpunkt des Ergebnisses
- eine zufällige Übertragungs-ID zur Vermeidung doppelter Einträge

Es gibt keine Benutzerkonten und die Anwendung fragt keine E-Mail-Adresse oder weiteren persönlichen Angaben ab. Spitznamen werden gekürzt und ausschließlich als Text ausgegeben.

Falls die Internetverbindung ausfällt, merkt die App neue Ergebnisse lokal vor und überträgt sie später automatisch. Backend-Fehler blockieren das Quiz nicht.

## Supabase-Konfiguration

1. Ein Supabase-Projekt anlegen und `supabase-schema.sql` vollständig im SQL Editor ausführen.
2. In `js/config.js` die Project URL als `SUPABASE_URL` und den öffentlichen Publishable Key als `SUPABASE_PUBLISHABLE_KEY` eintragen.
3. Die Änderung auf `main` pushen; GitHub Pages veröffentlicht sie automatisch.

Der Publishable Key ist für die Verwendung im Browser vorgesehen. Row Level Security erlaubt anonymen Besuchern ausschließlich das Lesen der Bestenliste und das Eintragen gültiger Ergebnisse. Updates und Deletes sind gesperrt. Ein Secret- oder `service_role`-Schlüssel darf niemals im Frontend verwendet werden.

## Veröffentlichung

Jeder Push auf `main` startet den Workflow in `.github/workflows/deploy-pages.yml`. GitHub Actions veröffentlicht anschließend den Inhalt des Repository-Stammverzeichnisses auf GitHub Pages.

Falls GitHub Pages in einer neuen Kopie des Repositorys noch nicht aktiviert ist, muss unter **Repository → Settings → Pages → Source** einmalig **GitHub Actions** ausgewählt werden.

## Hinweis zu Marken

Das Projekt entstand für einen schulischen Messe-Einsatz. Genannte Marken, Namen und Farben gehören ihren jeweiligen Rechteinhabern und werden ausschließlich im Rahmen des Quiz verwendet.
