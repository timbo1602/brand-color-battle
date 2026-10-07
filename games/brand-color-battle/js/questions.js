window.BRAND_COLOR_QUIZ = {
  title: "Brand Color Battle",
  rounds: [
    {
      id: "memory",
      title: "Farbgedächtnis",
      description: "Erkennst du bekannte Marken allein an ihrem Farbton?",
      accent: "#00d9ff",
      questions: [
        {
          id: "youtube-red",
          difficulty: "leicht",
          points: 50,
          type: "color-choice",
          kicker: "Markenfarbe erkennen",
          question: "Welche Farbe gehört zu YouTube?",
          instruction: "Wähle die passende Hauptfarbe aus.",
          brand: "YouTube",
          choices: [
            { label: "Blau", color: "#0866ff" },
            { label: "Rot", color: "#ff0000" },
            { label: "Grün", color: "#1ed760" },
            { label: "Violett", color: "#9146ff" }
          ],
          correctIndex: 1,
          explanation: "YouTube nutzt ein klares Rot als prägende Markenfarbe. Der offizielle digitale Farbwert ist #FF0000."
        },
        {
          id: "spotify-green",
          difficulty: "mittel",
          points: 100,
          type: "color-choice",
          kicker: "Nuancen unterscheiden",
          question: "Welches Grün ist das Spotify-Grün?",
          instruction: "Die vier Farbtöne liegen absichtlich nah beieinander.",
          brand: "Spotify",
          choices: [
            { label: "A", color: "#00c853" },
            { label: "B", color: "#1ed760" },
            { label: "C", color: "#33c96f" },
            { label: "D", color: "#00b86b" }
          ],
          correctIndex: 1,
          explanation: "Spotify Green ist ein sehr leuchtendes Grün mit dem digitalen Farbwert #1ED760."
        },
        {
          id: "telekom-magenta",
          difficulty: "schwer",
          points: 150,
          type: "color-choice",
          kicker: "Corporate Color",
          question: "Triff das Magenta der Deutschen Telekom.",
          instruction: "Nur eine Nuance entspricht der bekannten Markenfarbe.",
          brand: "Telekom",
          choices: [
            { label: "A", color: "#d5006d" },
            { label: "B", color: "#ec008c" },
            { label: "C", color: "#e20074" },
            { label: "D", color: "#c6007e" }
          ],
          correctIndex: 2,
          explanation: "Das markante Telekom-Magenta wird digital häufig als #E20074 eingesetzt."
        }
      ]
    },
    {
      id: "match",
      title: "Brand Match",
      description: "Ordne Farbkombinationen und Marken richtig zu.",
      accent: "#ff2e9a",
      questions: [
        {
          id: "ikea-palette",
          difficulty: "leicht",
          points: 50,
          type: "brand-choice",
          kicker: "Palette erkennen",
          question: "Welche Marke gehört zu dieser Farbkombination?",
          instruction: "Blau und Gelb – aber an welche Marke denkst du zuerst?",
          palette: ["#0058a3", "#ffda1a"],
          choices: ["Lidl", "IKEA", "Visa", "LEGO"],
          correctIndex: 1,
          explanation: "Das kräftige Blau und Gelb sind fest mit IKEA und der schwedischen Herkunft der Marke verbunden."
        },
        {
          id: "mcdonalds-palette",
          difficulty: "mittel",
          points: 100,
          type: "palette-choice",
          kicker: "Farbpaar finden",
          question: "Welche Palette gehört zu McDonald’s?",
          instruction: "Achte auf beide Farbtöne, nicht nur auf das Gelb.",
          brand: "McDonald’s",
          choices: [
            { label: "A", colors: ["#c8102e", "#ffd100"] },
            { label: "B", colors: ["#da291c", "#ffc72c"] },
            { label: "C", colors: ["#e4002b", "#ffdd00"] },
            { label: "D", colors: ["#bf0d3e", "#ffb81c"] }
          ],
          correctIndex: 1,
          explanation: "McDonald’s kombiniert ein warmes Rot mit dem typischen Golden-Arches-Gelb."
        },
        {
          id: "fedex-palette",
          difficulty: "schwer",
          points: 150,
          type: "palette-choice",
          kicker: "Zweifarbige Wortmarke",
          question: "Welche Farbkombination passt zu FedEx?",
          instruction: "Gesucht ist die bekannte Kombination der beiden Wortbestandteile.",
          brand: "FedEx",
          choices: [
            { label: "A", colors: ["#5f259f", "#ff6900"] },
            { label: "B", colors: ["#4d148c", "#ff6600"] },
            { label: "C", colors: ["#542583", "#f57c00"] },
            { label: "D", colors: ["#6f2da8", "#ff7a00"] }
          ],
          correctIndex: 1,
          explanation: "Die FedEx-Wortmarke kombiniert ein dunkles Violett mit einem leuchtenden Orange."
        }
      ]
    },
    {
      id: "lab",
      title: "Color Lab",
      description: "Jetzt mischst du bekannte Markenfarben selbst.",
      accent: "#ffe14f",
      questions: [
        {
          id: "netflix-mixer",
          difficulty: "leicht",
          points: 50,
          type: "color-mixer",
          kicker: "Farbton einstellen",
          question: "Mische das Netflix-Rot.",
          instruction: "Bewege den Farbton-Regler. Sättigung und Helligkeit sind bereits eingestellt.",
          brand: "Netflix",
          target: { h: 357, s: 92, l: 47, hex: "#e50914" },
          initial: { h: 20, s: 92, l: 47 },
          controls: ["h"],
          explanation: "Netflix Red liegt fast am Anfang des Farbkreises – leicht in Richtung Magenta verschoben."
        },
        {
          id: "twitch-mixer",
          difficulty: "mittel",
          points: 100,
          type: "color-mixer",
          kicker: "Farbton und Sättigung",
          question: "Wie nah kommst du an Twitch Purple?",
          instruction: "Stelle Farbton und Sättigung ein. Die Helligkeit bleibt fest.",
          brand: "Twitch",
          target: { h: 264, s: 100, l: 64, hex: "#9146ff" },
          initial: { h: 220, s: 65, l: 64 },
          controls: ["h", "s"],
          explanation: "Twitch Purple ist ein stark gesättigtes Violett mit dem digitalen Farbwert #9146FF."
        },
        {
          id: "spotify-mixer",
          difficulty: "schwer",
          points: 150,
          type: "color-mixer",
          kicker: "Kompletter HSL-Mix",
          question: "Baue Spotify Green aus dem Gedächtnis nach.",
          instruction: "Diesmal bestimmst du Farbton, Sättigung und Helligkeit selbst.",
          brand: "Spotify",
          target: { h: 141, s: 75, l: 48, hex: "#1ed760" },
          initial: { h: 170, s: 50, l: 58 },
          controls: ["h", "s", "l"],
          explanation: "Der Farbton liegt zwischen Grün und Türkis und wirkt durch die hohe Sättigung besonders lebendig."
        }
      ]
    },
    {
      id: "design",
      title: "Design Check",
      description: "Setze Farbe so ein, wie es Mediengestalter im Alltag tun.",
      accent: "#7cff6b",
      questions: [
        {
          id: "spotify-contrast",
          difficulty: "leicht",
          points: 50,
          type: "contrast-choice",
          kicker: "Lesbarkeit prüfen",
          question: "Welche Schriftfarbe funktioniert auf Spotify-Grün am besten?",
          instruction: "Wähle die Kombination mit dem stärksten, gut lesbaren Kontrast.",
          background: "#1ed760",
          sampleText: "PLAY",
          choices: [
            { label: "Weiß", color: "#ffffff" },
            { label: "Schwarz", color: "#000000" },
            { label: "Gelb", color: "#ffe14f" },
            { label: "Hellgrün", color: "#baffca" }
          ],
          correctIndex: 1,
          explanation: "Schwarz hat auf dem hellen Spotify-Grün den deutlich stärksten Kontrast und ist dadurch am besten lesbar."
        },
        {
          id: "rgb-cmyk",
          difficulty: "mittel",
          points: 100,
          type: "text-choice",
          kicker: "Digital oder Print",
          question: "Welche Zuordnung ist für Mediengestalter richtig?",
          instruction: "Denke an Bildschirmlicht und Druckfarben.",
          choices: [
            { title: "RGB für Druck · CMYK für Displays" },
            { title: "RGB für Displays · CMYK für Druck" },
            { title: "CMYK wird nur für Fotos verwendet" },
            { title: "Beide Farbmodelle sind identisch" }
          ],
          correctIndex: 1,
          explanation: "RGB ist ein additives Farbmodell für leuchtende Displays. CMYK beschreibt die subtraktive Farbmischung im Druck."
        },
        {
          id: "neon-print",
          difficulty: "schwer",
          points: 150,
          type: "text-choice",
          kicker: "Produktionswissen",
          question: "Ein leuchtendes RGB-Neongrün wirkt im CMYK-Probedruck deutlich matter. Was ist die beste Reaktion?",
          instruction: "Wähle den professionellsten nächsten Schritt.",
          choices: [
            { title: "Die Bildschirmhelligkeit erhöhen", detail: "Dann wird auch der Druck automatisch kräftiger." },
            { title: "RGB-Datei unverändert an die Druckerei senden", detail: "Die Druckmaschine übernimmt die Farbe exakt." },
            { title: "Farbe im passenden CMYK-Profil prüfen", detail: "Bei Bedarf eine Sonderfarbe oder Alternative abstimmen." },
            { title: "Das Motiv als Screenshot speichern", detail: "Dadurch bleiben die RGB-Farben im Druck erhalten." }
          ],
          correctIndex: 2,
          explanation: "Nicht alle leuchtenden RGB-Farben lassen sich mit CMYK wiedergeben. Deshalb wird im richtigen Profil geprüft und gegebenenfalls eine druckbare Alternative oder Sonderfarbe gewählt."
        }
      ]
    }
  ]
};
