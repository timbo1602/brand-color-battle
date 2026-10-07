(() => {
  "use strict";
  const config = window.ARCADE_CONFIG || { fairMode: true, games: {} };
  const storage = window.ArcadeStorage;
  const routes = Object.freeze({
    brandColorBattle: "brand-color-battle",
    pubQuiz: "pub-quiz",
    higherLower: "higher-lower",
    satireOrHeadline: "satire-or-headline",
    guessTheYear: "guess-the-year",
    typeRush: "type-rush",
    jsQuest: "js-quest",
    impostor: "impostor",
    geoSprint: "geo-sprint",
    colorCatch: "color-catch"
  });

  function isAdminPreview() { return storage?.sessionRead("admin-preview", "") === "active"; }
  function hasSecretAccess() { return storage?.sessionRead("color-catch-unlocked", "") === "active"; }

  function isGameEnabled(id) { return config.games?.[id] === true; }

  function canOpenGame(id) {
    if (!isGameEnabled(id)) return false;
    if (!config.fairMode) return true;
    if (isAdminPreview()) return true;
    if (id === "brandColorBattle") return true;
    return id === "colorCatch" && hasSecretAccess();
  }

  function guardGame(id, options = {}) {
    if (canOpenGame(id)) return true;
    if (options.redirect !== false) {
      const root = options.root || "../../";
      const reason = isGameEnabled(id) ? "locked" : "disabled";
      window.location.replace(`${root}?notice=${reason}&game=${encodeURIComponent(id)}`);
    }
    return false;
  }

  function shuffle(values) {
    const copy = [...values];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      let random = Math.floor(Math.random() * (index + 1));
      if (window.crypto?.getRandomValues) {
        const data = new Uint32Array(1);
        window.crypto.getRandomValues(data);
        random = data[0] % (index + 1);
      }
      [copy[index], copy[random]] = [copy[random], copy[index]];
    }
    return copy;
  }

  function sample(values, count) { return shuffle(values).slice(0, Math.min(count, values.length)); }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function format(value) { return new Intl.NumberFormat("de-DE").format(value); }

  function setupSoundButtons(root = document) {
    const buttons = [...root.querySelectorAll("[data-sound-toggle]")];
    function render() {
      const enabled = window.ArcadeAudio?.isEnabled() ?? true;
      buttons.forEach((button) => {
        button.textContent = enabled ? "♪" : "×";
        button.setAttribute("aria-label", enabled ? "Sound ausschalten" : "Sound einschalten");
        button.title = enabled ? "Sound ausschalten" : "Sound einschalten";
      });
    }
    buttons.forEach((button) => button.addEventListener("click", () => window.ArcadeAudio?.toggle()));
    window.addEventListener("arcade:sound-change", render);
    render();
  }

  function updateContextUI() {
    const admin = isAdminPreview();
    document.documentElement.classList.toggle("is-admin-preview", admin);
    document.querySelectorAll("[data-admin-banner]").forEach((node) => { node.hidden = !admin; });
    document.querySelectorAll("[data-fair-only]").forEach((node) => { node.hidden = !config.fairMode; });
    document.querySelectorAll("[data-normal-only]").forEach((node) => { node.hidden = config.fairMode; });
    document.querySelectorAll("[data-arcade-footer]").forEach((node) => {
      node.textContent = config.fairMode
        ? "Mediengestaltung Digital & Print"
        : "CTRL + CREATE ARCADE · Play. Compete. Repeat.";
    });
  }

  function logout(root = "../../") {
    storage?.sessionRemove("admin-preview");
    window.location.assign(root);
  }

  function setupGamePage(id, options = {}) {
    if (!guardGame(id, options)) return false;
    updateContextUI();
    setupSoundButtons();
    document.querySelectorAll("[data-admin-logout]").forEach((button) => button.addEventListener("click", () => logout(options.root || "../../")));
    registerServiceWorker(options.serviceWorker || "../../sw.js");
    return true;
  }

  function registerServiceWorker(path = "./sw.js") {
    if (!("serviceWorker" in navigator) || window.location.protocol === "file:") return;
    window.addEventListener("load", () => navigator.serviceWorker.register(path).catch(() => {}), { once: true });
  }

  window.ArcadeShared = Object.freeze({
    routes,
    isAdminPreview,
    hasSecretAccess,
    isGameEnabled,
    canOpenGame,
    guardGame,
    shuffle,
    sample,
    clamp,
    format,
    setupSoundButtons,
    setupGamePage,
    updateContextUI,
    registerServiceWorker,
    logout
  });
})();
