# CTRL + CREATE ARCADE

**Play. Compete. Repeat.**

CTRL + CREATE ARCADE ist ein statischer, responsiver Browser-Arcade-Hub mit neun regulären Spielen und einem versteckten Minigame. Das Projekt läuft ohne Framework, Bundler oder Laufzeit-Abhängigkeiten auf GitHub Pages. Spielstände und Einstellungen werden lokal im Browser gespeichert.

- Live: [timbo1602.github.io/brand-color-battle](https://timbo1602.github.io/brand-color-battle/)
- Repository: [github.com/timbo1602/brand-color-battle](https://github.com/timbo1602/brand-color-battle)

## Spiele

| Spiel | Inhalt |
| --- | --- |
| Brand Color Battle | 12 Aufgaben in vier Runden, Color Lab, lokale und optionale Supabase-Bestenliste sowie QR-Einstieg vom Live-Dashboard |
| The Big Pub Quiz | 75 Fragen, fünf Kategorien, drei Spielmodi, 20-Sekunden-Timer und Zeitbonus |
| Higher or Lower | 50 Vergleichswerte aus sieben Kategorien, Endlosserie und lokaler Rekord |
| Satire oder Schlagzeile? | 45 paraphrasierte Meldungen: echt, Satire oder erfunden; Quellen nach Auflösung |
| Guess the Year | 60 Ereignisse in sechs Kategorien, Jahres-Slider und Präzisionswertung |
| Type Rush | 12 Lektionen, 30 Texte, Bildschirmtastatur, WPM/CPM, Genauigkeit und Fehler |
| JS Quest | 30 JavaScript-Aufgaben in zehn Themen; Nutzercode läuft ausschließlich im kurzlebigen Web Worker |
| Impostor | Pass-the-Phone für 3–12 Personen, 120 Begriffe, fünf Chaosmodi und eigene Kategorien |
| Geo Sprint | 80 Länder, lokale Vektorumrisse und sechs Modi für Flaggen, Hauptstädte, Kontinente, Distanzen und Nachbarn |
| Color Catch | Verstecktes 45-Sekunden-Minispiel mit CMYK-Combos, drei Leben und lokalem Highscore |

Color Catch erscheint nicht als Karte. Es wird über die klassische Konami-Sequenz auf dem Hub freigeschaltet; für Touchscreens gibt es im Footer ein Signal-Pad. Der Zugriff gilt nur für die aktuelle Browsersitzung.

## Fair Mode und Admin Preview

Die zentrale Konfiguration liegt in `js/config.js`:

```js
window.ARCADE_CONFIG = Object.freeze({
  fairMode: true,
  adminPreviewEnabled: true,
  adminCodeHash: "…",
  games: Object.freeze({
    brandColorBattle: true,
    pubQuiz: true
    // weitere Einzelschalter
  })
});
```

- `fairMode: true`: Öffentlich ist nur Brand Color Battle zugänglich. Andere Karten bleiben sichtbar und gesperrt.
- `fairMode: false`: Alle Spiele mit aktivem Einzelschalter werden öffentlich freigeschaltet.
- `games.<id>: false`: Sperrt genau dieses Spiel auch im Normalmodus und in der Admin-Vorschau.
- Admin Preview: Prüft die Eingabe mit Web Crypto gegen einen SHA-256-Hash. Der Klartextcode steht nicht im Repository. Nach fünf Fehlversuchen greift eine 30-Sekunden-Sperre.
- Admin- und Secret-Freischaltungen liegen in `sessionStorage`; nach Ende der Browsersitzung sind sie weg.
- Direkte Spiel-URLs werden mit derselben zentralen Regel geprüft und bei Sperre zum Hub zurückgeleitet.

Die Messeansicht zeigt im Footer „Mediengestaltung Digital & Print“. Im Normalmodus erscheint das neutrale Arcade-Branding.

## Lokale Entwicklung

Ein einfacher HTTP-Server genügt:

```bash
python3 -m http.server 4173
```

Danach den Hub unter `http://127.0.0.1:4173/` öffnen. Ein HTTP-Server ist gegenüber `file://` zu bevorzugen, weil Service Worker, Worker und lokale GeoJSON-Abfragen einen sicheren Web-Kontext beziehungsweise HTTP-Pfade erwarten.

Für die automatisierten Prüfungen:

```bash
npm test
```

## Projektstruktur

```text
.
├── index.html                  # Arcade-Hub
├── css/                        # gemeinsame Komponenten, Hub und Spielbasis
├── js/                         # Konfiguration, Storage, Sound, Guards, Admin und Hub
├── games/
│   ├── brand-color-battle/
│   ├── pub-quiz/
│   ├── higher-lower/
│   ├── satire-or-headline/
│   ├── guess-the-year/
│   ├── type-rush/
│   ├── js-quest/
│   ├── impostor/
│   ├── geo-sprint/
│   └── color-catch/
├── scripts/generate-geo-data.mjs
├── sw.js                       # Offline-Cache
└── manifest.webmanifest
```

Jedes Spiel besitzt eine eigene HTML-, CSS- und JavaScript-Datei; größere Datensätze liegen separat unter `games/<spiel>/data/`. Gemeinsame Funktionen sind bewusst klein gehalten und unter `js/` zentralisiert.

## Datenquellen und Lizenzen

- Länderstammdaten: das offene [mledoze/countries-Dataset](https://github.com/mledoze/countries), lokal in ein reduziertes 80-Länder-Format überführt.
- Länderumrisse: [Natural Earth](https://www.naturalearthdata.com/), Datensatz *Admin 0 – Countries*. Natural-Earth-Daten sind Public Domain.
- Der Browser lädt zur Laufzeit keine Länder- oder Karten-API. `countries.js` und `outlines.geojson` liegen im Repository.
- Reale und satirische Meldungen werden im Spiel paraphrasiert; die jeweilige Quelle wird erst nach der Antwort als Link angezeigt. Erfundenes Material ist als Eigenproduktion gekennzeichnet.

Geo-Daten lassen sich aus lokal heruntergeladenen Quelldateien reproduzieren:

```bash
node scripts/generate-geo-data.mjs /pfad/countries.json /pfad/natural-earth.geojson
```

## Speicherung, Datenschutz und Sicherheit

- Alle Arcade-Schlüssel verwenden den Präfix `ctrl-create-arcade:`.
- Highscores, Lernfortschritt, eigene Impostor-Kategorien und die Sound-Einstellung liegen in `localStorage`.
- Admin Preview und Secret Unlock liegen ausschließlich in `sessionStorage`.
- Defekte oder manipulierte Storage-Werte werden validiert und auf sichere Standardwerte zurückgesetzt.
- JS Quest führt eingegebenen Code nie im Hauptfenster aus. Ein isolierter Blob-Worker wird nach spätestens 750 ms beendet; Netzwerk-APIs und `importScripts` werden im Worker deaktiviert.
- Es gibt keine Werbung, Analyse-Skripte oder Tracking-Pixel.
- Brand Color Battle kann optional ein vorhandenes Supabase-Backend für eine gemeinsame Bestenliste verwenden. Dabei werden nur Spitzname, Punktzahl, Zeitpunkt und eine zufällige Übertragungs-ID verarbeitet.
- Niemals geheime Supabase-Schlüssel im Frontend hinterlegen; dort ist ausschließlich ein öffentlicher Publishable-/Anon-Key zulässig.

## Offline-Betrieb

`sw.js` speichert Hub, Spiele, Daten, Styles, Skripte und Bildassets nach dem ersten erfolgreichen Online-Aufruf. Anschließend sind Hub und Spiele ohne Netz nutzbar. Externe Quellenlinks und die optionale globale Supabase-Bestenliste benötigen weiterhin eine Verbindung.

## Bedienung und Barrierefreiheit

- Tastaturbedienung und sichtbare Fokusmarkierungen
- ARIA-Statusmeldungen und semantische Struktur
- große Touch-Ziele und responsive Layouts
- Pause beziehungsweise Zeitstopp bei ausgeblendeten zeitkritischen Spielen
- globale Sound-Einstellung; Audio ist immer optional
- reduzierte Animationen über `prefers-reduced-motion`

## Deployment

Jeder Push auf `main` startet `.github/workflows/deploy-pages.yml` und veröffentlicht das statische Repository über GitHub Pages. Der Workflow lässt sich zusätzlich manuell starten. In einem Fork muss unter **Settings → Pages → Source** gegebenenfalls einmalig **GitHub Actions** gewählt werden.

## Markenhinweis

Genannte Marken, Namen und Farben gehören ihren jeweiligen Rechteinhabern und werden ausschließlich zu Lern- und Quizzwecken verwendet.
