# CTRL + CREATE ARCADE

**CTRL + CREATE ARCADE** ist ein browserbasierter Spiele- und Quiz-Hub für die Berufsmesse im Bereich **Mediengestaltung Digital und Print**. Die Plattform verbindet kurze, hochwertige Challenges aus Design, Medien, Gaming und Allgemeinwissen – ohne Framework, Build-Schritt oder externe Bibliotheken.

Während des Messe-Specials ist **Brand Color Battle** das regulär freigeschaltete Hauptspiel. Weitere Spielkarten geben bereits einen Ausblick auf die spätere Arcade. Ein geheimes, vollständig spielbares Minigame wartet außerdem auf alle, die klassische Arcade-Easter-Eggs kennen.

## Projektlinks

- [CTRL + CREATE ARCADE auf GitHub Pages](https://timbo1602.github.io/brand-color-battle/)
- [Brand Color Battle direkt öffnen](https://timbo1602.github.io/brand-color-battle/games/brand-color-battle/)
- [Globales Live-Dashboard](https://timbo1602.github.io/brand-color-battle/games/brand-color-battle/dashboard.html)
- [GitHub-Repository](https://github.com/timbo1602/brand-color-battle)

## Spiele

### Brand Color Battle · verfügbar

Das bestehende Farbenquiz bleibt inhaltlich und technisch erhalten:

- vier Runden mit jeweils drei Aufgaben
- maximal 1.200 Punkte
- Markenfarben, Farbpaletten, Farbmischung und Produktionswissen
- lokale Top-10-Bestenliste und optionale gemeinsame Supabase-Bestenliste
- Offline-Warteschlange für noch nicht übertragene Ergebnisse
- Auswahl-, Richtig-, Falsch-, Runden- und Abschluss-Sounds
- Sound-Schalter, Vollbildmodus, Neustart und Ergebnis-Chamäleon
- separates Live-Dashboard für Messe-Displays

### The Big Pub Quiz · geplant

Das geplante Pub Quiz bekommt Kategorien für Allgemeinwissen, Musik, Film, Internet, Gaming und unnützes Wissen. Die technische Platzhalterstruktur trennt Fragen bereits von der Benutzeroberfläche und ist auf Multiple Choice, Medienfragen, Zeitbonus sowie Solo- und Teammodus vorbereitet. Es werden noch keine erfundenen Fragen ausgeliefert.

### Logo Detective · geplant

Eine weitere spätere Challenge rund um Formen, Markendetails und schrittweise visuelle Hinweise. Die Karte ist im Hub sichtbar, während des Messemodus aber gesperrt.

### Geheimes Minigame

**Color Catch – The Forbidden Print Run** ist nicht als normale Spielkarte sichtbar. Das Easter Egg lässt sich auf der Hub-Seite über eine bekannte klassische Arcade-Tastenfolge öffnen. Auf Touchscreens steht ein unauffälliges Signal-Pad bereit.

Im Spiel werden CMYK-Farben mit einem Druckkopf gesammelt, während graue Print Errors vermieden werden müssen. Eine Runde dauert 40 Sekunden. Geschwindigkeit, Punkte, Leben und lokaler Highscore werden vollständig im Browser verwaltet.

## Messemodus und Freischaltung

Die zentrale Konfiguration liegt in [`js/hub-config.js`](./js/hub-config.js):

```javascript
window.HUB_CONFIG = {
  fairMode: true,
  unlockAllGames: false,
  games: {
    // ...
  }
};
```

- `fairMode: true`: Nur dauerhaft freigegebene Spiele wie Brand Color Battle sind sichtbar spielbar.
- Nach der Messe: `fairMode` auf `false` setzen. Alle Spiele mit `ready: true` werden automatisch freigeschaltet.
- `unlockAllGames: true`: optionale Vorschau-Freischaltung, ohne den Messemodus dauerhaft zu ändern.
- Ein noch unfertiges Spiel behält `ready: false` und bleibt dadurch auch außerhalb des Messemodus gesperrt.
- Das geheime Minigame ist unabhängig vom Messemodus weiterhin über das Easter Egg erreichbar.

Damit nach der Messe tatsächlich nur ein Wert geändert werden muss, werden fertiggestellte Spiele bereits bei ihrer Entwicklung auf `ready: true` gesetzt. Zum öffentlichen Freischalttermin wird anschließend nur `fairMode` umgestellt.

## Projektstruktur

```text
.
├── index.html                         # Arcade-Hub
├── css/
│   ├── hub.css                        # Hub-Layout und Arcade-Design
│   └── shared.css                     # gemeinsame Grundstile
├── js/
│   ├── hub-config.js                  # Messemodus und Spielstatus
│   └── hub.js                         # Hub, Locks, Sound und Easter Egg
├── games/
│   ├── brand-color-battle/
│   │   ├── index.html                 # bestehendes Hauptquiz
│   │   ├── dashboard.html             # globale Live-Bestenliste
│   │   ├── assets/
│   │   ├── css/
│   │   └── js/                        # Quizfragen, Logik und Supabase
│   ├── color-catch/
│   │   ├── index.html                 # geheimes Minigame
│   │   ├── game.css
│   │   └── game.js
│   └── pub-quiz/
│       ├── index.html                 # technische Platzhalterseite
│       ├── pub-quiz.css
│       ├── pub-quiz.js
│       └── data/questions.js          # erweiterbare Fragedaten
├── .github/workflows/deploy-pages.yml
├── .nojekyll
└── supabase-schema.sql
```

Alle internen Ressourcen und Links verwenden relative Pfade. Dadurch funktionieren Hub und Spiele sowohl unter dem GitHub-Pages-Unterpfad `/brand-color-battle/` als auch lokal.

## Lokal starten

Die statischen Seiten können direkt im Browser geöffnet werden. Für realistischere Pfad-, Storage- und Navigationstests empfiehlt sich ein lokaler Webserver im Repository-Stamm:

```bash
python3 -m http.server 4173
```

Danach sind die wichtigsten Seiten erreichbar unter:

- Hub: `http://127.0.0.1:4173/`
- Brand Color Battle: `http://127.0.0.1:4173/games/brand-color-battle/`
- Color Catch: `http://127.0.0.1:4173/games/color-catch/`

Für den Kernbetrieb werden keine Netzwerkressourcen geladen. Hub, Quiz und Secret Game bleiben deshalb auch ohne Internetverbindung bedienbar. Nur das globale Dashboard und die gemeinsame Bestenliste benötigen Supabase.

## Bestenlisten und Datenschutz

Brand Color Battle speichert eine lokale Top 10 im jeweiligen Browser. Bei aktiver Supabase-Verbindung werden Spitzname, Punktzahl, Zeitpunkt und eine zufällige Übertragungs-ID an die gemeinsame Bestenliste gesendet. Backend-Fehler blockieren das Quiz nicht; Ergebnisse werden lokal vorgemerkt.

Color Catch verwendet vorerst ausschließlich einen lokalen Highscore. Eine spätere gemeinsame Bestenliste kann ergänzt werden, ohne den Spielablauf an ein Backend zu koppeln.

## Supabase-Konfiguration

1. Ein Supabase-Projekt anlegen und `supabase-schema.sql` im SQL Editor ausführen.
2. In `games/brand-color-battle/js/config.js` die Project URL und den öffentlichen Publishable Key eintragen.
3. Die Änderung auf `main` pushen; GitHub Pages veröffentlicht sie automatisch.

Im Frontend darf ausschließlich ein öffentlicher Publishable- beziehungsweise Anon-Key verwendet werden. Ein Secret- oder `service_role`-Schlüssel gehört niemals in diese Dateien.

## Barrierefreiheit und Eingabe

- semantische Überschriften, Statusmeldungen und ARIA-Beschriftungen
- gut sichtbare Tastatur-Fokusrahmen
- Hub und Quiz vollständig mit Tastatur bedienbar
- Color Catch mit Pfeiltasten, `A`/`D`, großen Touch-Schaltflächen oder Ziehen im Spielfeld
- reduzierte Animationen über `prefers-reduced-motion`
- responsive Darstellung für Messe-PCs, Tablets und Smartphones

## Veröffentlichung

Jeder Push auf `main` startet `.github/workflows/deploy-pages.yml`. Der Workflow kann zusätzlich über `workflow_dispatch` manuell gestartet werden und veröffentlicht den gesamten statischen Repository-Inhalt auf GitHub Pages.

Falls Pages in einer neuen Kopie noch nicht aktiviert ist, muss unter **Repository → Settings → Pages → Source** einmalig **GitHub Actions** ausgewählt werden.

## Hinweis zu Marken

Das Projekt entstand für einen schulischen Messe-Einsatz. Genannte Marken, Namen und Farben gehören ihren jeweiligen Rechteinhabern und werden ausschließlich im Rahmen des Quiz verwendet.
