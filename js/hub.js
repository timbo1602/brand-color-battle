(() => {
  "use strict";
  const config = window.ARCADE_CONFIG;
  const shared = window.ArcadeShared;
  const storage = window.ArcadeStorage;
  const toast = document.getElementById("hub-toast");
  const secretDialog = document.getElementById("secret-dialog");
  const unlockScreen = document.getElementById("unlock-screen");
  const progress = document.getElementById("signal-progress-bar");
  const sequence = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let sequenceIndex = 0;
  let unlocking = false;
  let toastTimer = 0;

  function normalizeKey(value) { return value.length === 1 ? value.toLowerCase() : value; }
  function isEditable(target) { return target instanceof Element && Boolean(target.closest("input,textarea,select,[contenteditable='true']")); }

  function registerKey(raw) {
    if (unlocking) return;
    const key = normalizeKey(raw);
    sequenceIndex = key === sequence[sequenceIndex] ? sequenceIndex + 1 : key === sequence[0] ? 1 : 0;
    progress.style.width = `${sequenceIndex / sequence.length * 100}%`;
    if (sequenceIndex === sequence.length) unlockSecret();
  }

  function unlockSecret() {
    if (unlocking || config.games.colorCatch !== true) return;
    unlocking = true;
    sequenceIndex = 0;
    storage.sessionWrite("color-catch-unlocked", "active");
    if (secretDialog.open) secretDialog.close();
    unlockScreen.hidden = false;
    window.ArcadeAudio?.play("secret");
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 550 : 1450;
    window.setTimeout(() => window.location.assign("./games/color-catch/"), delay);
  }

  function showToast(text) {
    window.clearTimeout(toastTimer);
    toast.querySelector("p").textContent = text;
    toast.hidden = false;
    toast.classList.remove("is-visible");
    void toast.offsetWidth;
    toast.classList.add("is-visible");
    window.ArcadeAudio?.play("wrong");
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3200);
  }

  function configureCards() {
    let available = 0;
    document.querySelectorAll(".game-tile[data-game-id]").forEach((card) => {
      const id = card.dataset.gameId;
      const enabled = shared.isGameEnabled(id);
      const open = shared.canOpenGame(id);
      const admin = config.fairMode && shared.isAdminPreview() && enabled && id !== "brandColorBattle";
      card.classList.toggle("is-locked", !open && enabled);
      card.classList.toggle("is-disabled", !enabled);
      card.classList.toggle("is-admin", admin);
      const status = card.querySelector(".game-status");
      const action = card.querySelector(".tile-button");
      if (open) {
        available += 1;
        status.textContent = admin ? "Admin Preview" : id === "brandColorBattle" ? "Spielbar" : "Neu · Spielbar";
        if (action.tagName !== "A") {
          const link = document.createElement("a");
          link.className = action.className;
          link.href = card.dataset.route;
          link.textContent = admin ? "Vorschau öffnen →" : "Spiel starten →";
          action.replaceWith(link);
        }
        card.removeAttribute("tabindex");
      } else {
        status.textContent = enabled ? "Gesperrt" : "Deaktiviert";
        action.textContent = enabled ? "Noch gesperrt" : "Nicht verfügbar";
      }
    });
    document.getElementById("available-count").textContent = String(available);
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      let shown = 0;
      document.querySelectorAll(".game-tile[data-category]").forEach((card) => {
        const visible = filter === "all" || card.dataset.category.split(" ").includes(filter);
        card.hidden = !visible;
        if (visible) shown += 1;
      });
      document.getElementById("empty-filter").hidden = shown > 0;
    }));
  }

  document.querySelectorAll(".game-tile").forEach((card) => {
    function activate(event) {
      if (!card.classList.contains("is-locked") && !card.classList.contains("is-disabled")) return;
      event.preventDefault();
      showToast(card.classList.contains("is-disabled") ? "Dieses Spiel ist momentan deaktiviert." : "Dieses Spiel wird nach der Messe freigeschaltet.");
    }
    card.addEventListener("click", activate);
    card.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") activate(event); });
  });

  document.addEventListener("keydown", (event) => { if (!event.repeat && !isEditable(event.target)) registerKey(event.key); });
  document.querySelectorAll("[data-secret-key]").forEach((button) => button.addEventListener("click", () => registerKey(button.dataset.secretKey)));
  document.getElementById("secret-input-open").addEventListener("click", () => secretDialog.showModal());
  document.getElementById("secret-input-close").addEventListener("click", () => secretDialog.close());
  secretDialog.addEventListener("close", () => { sequenceIndex = 0; progress.style.width = "0"; });

  const notice = new URLSearchParams(window.location.search).get("notice");
  if (notice === "locked") showToast("Dieses Spiel wird nach der Messe freigeschaltet.");
  if (notice === "disabled") showToast("Dieses Spiel ist momentan deaktiviert.");

  shared.updateContextUI();
  shared.setupSoundButtons();
  shared.registerServiceWorker("./sw.js");
  setupFilters();
  configureCards();
})();
