(() => {
  "use strict";

  const config = window.HUB_CONFIG || { fairMode: true, unlockAllGames: false, games: {} };
  const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  const soundKey = "ctrl-create-arcade-sound-v1";
  const toast = document.getElementById("hub-toast");
  const unlockScreen = document.getElementById("unlock-screen");
  const soundButton = document.getElementById("hub-sound");
  const soundIcon = document.getElementById("hub-sound-icon");
  const secretDialog = document.getElementById("secret-dialog");
  const signalProgress = document.getElementById("signal-progress-bar");
  let sequenceIndex = 0;
  let unlocking = false;
  let toastTimer = 0;
  let audioContext = null;
  let soundEnabled = readStorage(soundKey, "on") !== "off";

  function isEditableTarget(target) {
    return target instanceof Element && Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
  }

  function normalizeKey(key) {
    return key.length === 1 ? key.toLowerCase() : key;
  }

  function registerSecretKey(rawKey) {
    if (unlocking) return;
    const key = normalizeKey(rawKey);
    if (key === konami[sequenceIndex]) {
      sequenceIndex += 1;
    } else {
      sequenceIndex = key === konami[0] ? 1 : 0;
    }
    signalProgress.style.width = `${(sequenceIndex / konami.length) * 100}%`;
    if (sequenceIndex === konami.length) unlockSecretGame();
  }

  function unlockSecretGame() {
    if (unlocking) return;
    unlocking = true;
    sequenceIndex = 0;
    secretDialog.open && secretDialog.close();
    unlockScreen.hidden = false;
    playUnlockSound();
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 650 : 1550;
    window.setTimeout(() => {
      window.location.assign("./games/color-catch/");
    }, delay);
  }

  function showLockedMessage() {
    window.clearTimeout(toastTimer);
    toast.hidden = false;
    toast.classList.remove("is-visible");
    void toast.offsetWidth;
    toast.classList.add("is-visible");
    playFeedbackTone();
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
      toast.classList.remove("is-visible");
    }, 3200);
  }

  function updateGameAvailability() {
    let available = 0;
    const normalGamesUnlocked = !config.fairMode || config.unlockAllGames;
    document.querySelectorAll("[data-game-id]").forEach((card) => {
      const id = card.dataset.gameId;
      const gameConfig = config.games?.[id] || {};
      const ready = card.dataset.ready === "true" && gameConfig.ready !== false;
      const unlocked = ready && (gameConfig.alwaysAvailable || normalGamesUnlocked);
      if (unlocked) available += 1;
      if (id !== "brandColorBattle" && unlocked && card.dataset.route) {
        card.classList.remove("is-locked");
        card.removeAttribute("tabindex");
        card.removeAttribute("aria-label");
        const oldButton = card.querySelector(".tile-action");
        if (oldButton && oldButton.tagName === "BUTTON") {
          const link = document.createElement("a");
          link.className = "button button-primary tile-action";
          link.href = card.dataset.route;
          link.textContent = "Spiel öffnen →";
          oldButton.replaceWith(link);
        }
      }
    });
    document.getElementById("available-count").textContent = String(available);
    document.getElementById("fair-status").textContent = config.fairMode && !config.unlockAllGames
      ? "MESSE-SPECIAL AKTIV"
      : "ARCADE FREIGESCHALTET";
  }

  function playUnlockSound() {
    if (!soundEnabled) return;
    playNotes([
      [220, 0, .08, "square"], [330, .09, .08, "square"], [440, .18, .08, "square"],
      [660, .28, .12, "triangle"], [880, .42, .28, "triangle"]
    ], .045);
  }

  function playFeedbackTone() {
    if (!soundEnabled) return;
    playNotes([[180, 0, .07, "square"], [145, .08, .12, "square"]], .022);
  }

  function playNotes(notes, volume) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioContext) audioContext = new AudioContext();
      if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
      const now = audioContext.currentTime;
      notes.forEach(([frequency, delay, duration, wave]) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const start = now + delay;
        oscillator.type = wave;
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + .012);
        gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(start);
        oscillator.stop(start + duration + .03);
      });
    } catch {
      // Audio is optional; the hub remains fully functional when blocked.
    }
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    writeStorage(soundKey, soundEnabled ? "on" : "off");
    updateSoundButton();
    if (soundEnabled) playNotes([[520, 0, .07, "sine"]], .025);
  }

  function updateSoundButton() {
    soundIcon.textContent = soundEnabled ? "♪" : "×";
    soundButton.setAttribute("aria-label", soundEnabled ? "Arcade-Sound ausschalten" : "Arcade-Sound einschalten");
  }

  function readStorage(key, fallback) {
    try { return window.localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  }

  function writeStorage(key, value) {
    try { window.localStorage.setItem(key, value); } catch { /* Storage may be blocked. */ }
  }

  document.addEventListener("keydown", (event) => {
    if (event.repeat || isEditableTarget(event.target)) return;
    registerSecretKey(event.key);
  });

  document.querySelectorAll(".game-tile.is-locked").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (!card.classList.contains("is-locked")) return;
      event.preventDefault();
      showLockedMessage();
    });
    card.addEventListener("keydown", (event) => {
      if (card.classList.contains("is-locked") && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        showLockedMessage();
      }
    });
  });

  document.querySelectorAll("[data-secret-key]").forEach((button) => {
    button.addEventListener("click", () => registerSecretKey(button.dataset.secretKey));
  });
  document.getElementById("secret-input-open").addEventListener("click", () => secretDialog.showModal());
  document.getElementById("secret-input-close").addEventListener("click", () => secretDialog.close());
  secretDialog.addEventListener("close", () => {
    sequenceIndex = 0;
    signalProgress.style.width = "0";
  });
  soundButton.addEventListener("click", toggleSound);

  updateGameAvailability();
  updateSoundButton();
})();
