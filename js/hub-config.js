// Zentrale Freischaltung für CTRL + CREATE ARCADE.
// Nach der Messe nur `fairMode` auf `false` setzen. Spiele mit `ready: true`
// werden dann automatisch freigeschaltet. Unfertige Platzhalter bleiben gesperrt.
window.HUB_CONFIG = Object.freeze({
  fairMode: true,
  unlockAllGames: false,
  games: Object.freeze({
    brandColorBattle: Object.freeze({ ready: true, alwaysAvailable: true }),
    pubQuiz: Object.freeze({ ready: false, alwaysAvailable: false }),
    logoDetective: Object.freeze({ ready: false, alwaysAvailable: false })
  })
});
