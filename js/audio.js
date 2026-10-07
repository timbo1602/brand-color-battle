(() => {
  "use strict";
  const storage = window.ArcadeStorage;
  const soundKey = "settings:sound";
  let enabled = storage?.readRaw(soundKey, "on") !== "off";
  let audioContext = null;

  const patterns = Object.freeze({
    select: [[420, 0, .045, "sine"]],
    correct: [[523, 0, .07, "sine"], [659, .07, .07, "sine"], [784, .15, .12, "sine"]],
    wrong: [[235, 0, .1, "sawtooth"], [175, .09, .16, "sawtooth"]],
    highscore: [[523, 0, .07, "square"], [659, .08, .07, "square"], [784, .16, .08, "square"], [1046, .27, .25, "triangle"]],
    end: [[392, 0, .08, "triangle"], [523, .1, .08, "triangle"], [659, .2, .16, "triangle"]],
    admin: [[330, 0, .06, "square"], [494, .07, .06, "square"], [740, .15, .18, "triangle"]],
    secret: [[220, 0, .07, "square"], [330, .08, .07, "square"], [440, .16, .07, "square"], [660, .25, .11, "triangle"], [880, .39, .25, "triangle"]]
  });

  function play(type = "select") {
    if (!enabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioContext) audioContext = new AudioContext();
      if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
      const now = audioContext.currentTime;
      (patterns[type] || patterns.select).forEach(([frequency, delay, duration, wave]) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const start = now + delay;
        oscillator.type = wave;
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(.0001, start);
        gain.gain.exponentialRampToValueAtTime(type === "wrong" ? .022 : .038, start + .01);
        gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(start);
        oscillator.stop(start + duration + .025);
      });
    } catch {
      // Audio is optional and must never block a game.
    }
  }

  function setEnabled(value) {
    enabled = Boolean(value);
    storage?.writeRaw(soundKey, enabled ? "on" : "off");
    window.dispatchEvent(new CustomEvent("arcade:sound-change", { detail: { enabled } }));
    if (enabled) play("select");
  }

  function toggle() { setEnabled(!enabled); return enabled; }
  function isEnabled() { return enabled; }

  window.ArcadeAudio = Object.freeze({ play, toggle, setEnabled, isEnabled });
})();
