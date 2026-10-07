// Erweiterbare Datenquelle für das spätere Pub Quiz.
// Fragen werden je Kategorie als eigene Objekte ergänzt. Medien- und Audio-URLs
// müssen relativ zu diesem Spielordner angegeben werden.
window.PUB_QUIZ_DATA = Object.freeze({
  version: 1,
  categories: Object.freeze([
    Object.freeze({ id: "general", label: "Allgemeinwissen", questions: Object.freeze([]) }),
    Object.freeze({ id: "music", label: "Musik", questions: Object.freeze([]) }),
    Object.freeze({ id: "film", label: "Film & Serien", questions: Object.freeze([]) }),
    Object.freeze({ id: "internet", label: "Internet", questions: Object.freeze([]) }),
    Object.freeze({ id: "gaming", label: "Gaming", questions: Object.freeze([]) }),
    Object.freeze({ id: "random", label: "Unnützes Wissen", questions: Object.freeze([]) })
  ]),
  modes: Object.freeze(["solo", "team"]),
  features: Object.freeze({ multipleChoice: true, mediaQuestions: true, timeBonus: true })
});
