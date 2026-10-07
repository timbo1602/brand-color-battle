(() => {
  "use strict";

  if (!window.ArcadeShared?.setupGamePage("colorCatch")) return;

  const canvas = document.getElementById("game-canvas");
  const context = canvas.getContext("2d");
  const wrap = document.getElementById("canvas-wrap");
  const startOverlay = document.getElementById("start-overlay");
  const resultOverlay = document.getElementById("result-overlay");
  const pauseLabel = document.getElementById("pause-label");
  const scoreValue = document.getElementById("score-value");
  const timeValue = document.getElementById("time-value");
  const livesValue = document.getElementById("lives-value");
  const comboValue = document.getElementById("combo-value");
  const highscoreValue = document.getElementById("highscore-value");
  const liveRegion = document.getElementById("game-live");
  const highscoreKey = "color-catch:highscore";
  const legacyHighscoreKey = "color-catch-highscore-v1";
  const duration = 45;
  const colors = [
    { code: "C", color: "#00e5ff" },
    { code: "M", color: "#ff2e9a" },
    { code: "Y", color: "#ffe14f", darkText: true },
    { code: "K", color: "#151821" }
  ];
  const pressed = new Set();
  let highscore = readHighscore();
  let frameId = 0;
  let state = createState("idle");

  function createState(mode) {
    return {
      mode,
      score: 0,
      combo: 0,
      lives: 3,
      elapsed: 0,
      timeLeft: duration,
      playerX: .5,
      items: [],
      particles: [],
      spawnIn: .25,
      lastTime: 0,
      flash: 0
    };
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawScene(rect.width, rect.height);
  }

  function startGame() {
    window.cancelAnimationFrame(frameId);
    pressed.clear();
    state = createState("running");
    startOverlay.hidden = true;
    resultOverlay.hidden = true;
    pauseLabel.hidden = true;
    updateHud();
    resizeCanvas();
    state.lastTime = performance.now();
    frameId = window.requestAnimationFrame(gameLoop);
    liveRegion.textContent = "Drucklauf gestartet. 45 Sekunden verbleiben.";
  }

  function gameLoop(timestamp) {
    if (state.mode !== "running") return;
    const delta = Math.min((timestamp - state.lastTime) / 1000, .05);
    state.lastTime = timestamp;
    update(delta);
    const rect = canvas.getBoundingClientRect();
    drawScene(rect.width, rect.height);
    if (state.mode === "running") frameId = window.requestAnimationFrame(gameLoop);
  }

  function update(delta) {
    state.elapsed += delta;
    state.timeLeft = Math.max(0, duration - state.elapsed);
    const direction = (pressed.has("right") ? 1 : 0) - (pressed.has("left") ? 1 : 0);
    state.playerX = clamp(state.playerX + direction * delta * .72, .075, .925);
    const difficulty = 1 + (state.elapsed / duration) * 1.25;

    state.spawnIn -= delta;
    if (state.spawnIn <= 0) {
      spawnItem(difficulty);
      state.spawnIn = Math.max(.28, .72 / difficulty) * (.82 + Math.random() * .36);
    }

    state.items.forEach((item) => { item.y += item.speed * difficulty * delta; item.rotation += item.spin * delta; });
    state.particles.forEach((particle) => {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vy += .32 * delta;
      particle.life -= delta;
    });
    state.particles = state.particles.filter((particle) => particle.life > 0);
    state.flash = Math.max(0, state.flash - delta * 2.5);
    checkCollisions();
    state.items = state.items.filter((item) => item.y < 1.12 && !item.caught);
    updateHud();

    if (state.timeLeft <= 0 || state.lives <= 0) endGame();
  }

  function spawnItem(difficulty) {
    const isError = Math.random() < Math.min(.18 + difficulty * .035, .27);
    const color = colors[Math.floor(Math.random() * colors.length)];
    state.items.push({
      x: .07 + Math.random() * .86,
      y: -.08,
      speed: .2 + Math.random() * .09,
      size: .027 + Math.random() * .011,
      isError,
      color: color.color,
      code: isError ? "!" : color.code,
      darkText: color.darkText,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - .5) * 3,
      caught: false
    });
  }

  function checkCollisions() {
    const rect = canvas.getBoundingClientRect();
    const playerWidth = Math.min(132, Math.max(84, rect.width * .16));
    const playerHeight = 40;
    const playerLeft = state.playerX * rect.width - playerWidth / 2;
    const playerTop = rect.height - 62;

    state.items.forEach((item) => {
      if (item.caught) return;
      const x = item.x * rect.width;
      const y = item.y * rect.height;
      const radius = Math.max(13, item.size * rect.width);
      const overlapsX = x + radius > playerLeft && x - radius < playerLeft + playerWidth;
      const overlapsY = y + radius > playerTop && y - radius < playerTop + playerHeight;
      if (!overlapsX || !overlapsY) return;

      item.caught = true;
      createParticles(item.x, item.y, item.isError ? "#9aa0ad" : item.color);
      if (item.isError) {
        state.score = Math.max(0, state.score - 15);
        state.combo = 0;
        state.lives -= 1;
        state.flash = 1;
        window.ArcadeAudio?.play("wrong");
        liveRegion.textContent = `Print Error. Noch ${state.lives} Leben.`;
      } else {
        state.combo += 1;
        state.score += 10 + Math.min(20, Math.max(0, state.combo - 1) * 2);
        window.ArcadeAudio?.play("correct");
      }
    });
  }

  function createParticles(x, y, color) {
    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * 2 * index) / 8 + Math.random() * .25;
      const velocity = .08 + Math.random() * .09;
      state.particles.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, color, life: .45 + Math.random() * .25 });
    }
  }

  function endGame() {
    if (state.mode !== "running") return;
    state.mode = "gameover";
    window.cancelAnimationFrame(frameId);
    pressed.clear();
    const isNewHighscore = state.score > highscore;
    if (isNewHighscore) {
      highscore = state.score;
      writeHighscore(highscore);
    }
    updateHud();
    document.getElementById("final-score").textContent = formatScore(state.score);
    document.getElementById("result-title").textContent = isNewHighscore ? "Neuer Highscore!" : state.lives <= 0 ? "Druckstopp!" : "Drucklauf beendet";
    document.getElementById("result-message").textContent = isNewHighscore
      ? "Sauberer Lauf – dieser Rekord bleibt auf dem Gerät gespeichert."
      : "Mehr CMYK, weniger Grau: Die nächste Runde wartet schon.";
    resultOverlay.hidden = false;
    window.ArcadeAudio?.play(isNewHighscore ? "highscore" : "end");
    document.getElementById("restart-button").focus({ preventScroll: true });
    liveRegion.textContent = `Spiel beendet. ${state.score} Punkte.`;
  }

  function updateHud() {
    scoreValue.textContent = formatScore(state.score);
    timeValue.textContent = state.timeLeft.toFixed(1).padStart(4, "0");
    livesValue.textContent = [0, 1, 2].map((index) => index < state.lives ? "●" : "○").join(" ");
    livesValue.setAttribute("aria-label", `${state.lives} von 3 Leben`);
    comboValue.textContent = `×${state.combo}`;
    highscoreValue.textContent = formatScore(highscore);
  }

  function drawScene(width, height) {
    context.clearRect(0, 0, width, height);
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#111727");
    gradient.addColorStop(1, "#070911");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(255,255,255,.035)";
    context.lineWidth = 1;
    const grid = Math.max(32, width / 16);
    for (let x = 0; x <= width; x += grid) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke(); }
    for (let y = 0; y <= height; y += grid) { context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke(); }

    context.fillStyle = "rgba(0,229,255,.035)";
    context.fillRect(0, height - 83, width, 2);
    state.items.forEach((item) => drawItem(item, width, height));
    state.particles.forEach((particle) => drawParticle(particle, width, height));
    drawPlayer(width, height);
    if (state.flash > 0) {
      context.fillStyle = `rgba(255,46,154,${state.flash * .16})`;
      context.fillRect(0, 0, width, height);
    }
  }

  function drawItem(item, width, height) {
    const x = item.x * width;
    const y = item.y * height;
    const radius = Math.max(13, item.size * width);
    context.save();
    context.translate(x, y);
    context.rotate(item.rotation);
    if (item.isError) {
      context.fillStyle = "#737a89";
      context.fillRect(-radius, -radius, radius * 2, radius * 2);
      context.strokeStyle = "#b3b7c0";
      context.lineWidth = 2;
      context.beginPath(); context.moveTo(-radius * .55, -radius * .55); context.lineTo(radius * .55, radius * .55); context.moveTo(radius * .55, -radius * .55); context.lineTo(-radius * .55, radius * .55); context.stroke();
    } else {
      context.shadowColor = item.color;
      context.shadowBlur = 16;
      context.fillStyle = item.color;
      context.beginPath(); context.arc(0, 0, radius, 0, Math.PI * 2); context.fill();
      context.shadowBlur = 0;
      context.fillStyle = item.darkText ? "#171717" : "#f8fbff";
      context.font = `900 ${Math.max(12, radius)}px Courier New`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(item.code, 0, 1);
    }
    context.restore();
  }

  function drawParticle(particle, width, height) {
    context.globalAlpha = Math.max(0, particle.life / .7);
    context.fillStyle = particle.color;
    context.fillRect(particle.x * width - 3, particle.y * height - 3, 6, 6);
    context.globalAlpha = 1;
  }

  function drawPlayer(width, height) {
    const playerWidth = Math.min(132, Math.max(84, width * .16));
    const playerHeight = 40;
    const x = state.playerX * width - playerWidth / 2;
    const y = height - 62;
    context.save();
    context.shadowColor = "rgba(0,229,255,.35)";
    context.shadowBlur = 18;
    context.fillStyle = "#dce4f2";
    roundedRect(x, y, playerWidth, playerHeight, 7);
    context.fillStyle = "#111621";
    roundedRect(x + 7, y + 7, playerWidth - 14, playerHeight - 17, 4);
    const barWidth = (playerWidth - 24) / 4;
    ["#00e5ff", "#ff2e9a", "#ffe14f", "#444a57"].forEach((color, index) => {
      context.fillStyle = color;
      context.fillRect(x + 12 + index * barWidth, y + playerHeight - 7, barWidth - 2, 4);
    });
    context.fillStyle = "#818a9d";
    context.fillRect(x + playerWidth * .38, y - 8, playerWidth * .24, 9);
    context.restore();
  }

  function roundedRect(x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.fill();
  }

  function setDirection(direction, active, button) {
    if (active) pressed.add(direction); else pressed.delete(direction);
    button?.classList.toggle("is-pressed", active);
  }

  function handlePointer(event) {
    if (state.mode !== "running") return;
    const rect = canvas.getBoundingClientRect();
    state.playerX = clamp((event.clientX - rect.left) / rect.width, .075, .925);
  }

  function handleVisibility() {
    if (document.hidden && state.mode === "running") {
      state.mode = "paused";
      window.cancelAnimationFrame(frameId);
      pressed.clear();
    } else if (!document.hidden && state.mode === "paused") {
      state.mode = "running";
      state.lastTime = performance.now();
      pauseLabel.hidden = false;
      window.setTimeout(() => { pauseLabel.hidden = true; }, 900);
      frameId = window.requestAnimationFrame(gameLoop);
    }
  }

  function readHighscore() {
    const stored = window.ArcadeStorage?.readNumber(highscoreKey, -1, { min: 0 });
    if (stored >= 0) return stored;
    try {
      const legacy = Number.parseInt(window.localStorage.getItem(legacyHighscoreKey) || "0", 10);
      if (Number.isFinite(legacy) && legacy >= 0) { window.ArcadeStorage?.writeRaw(highscoreKey, legacy); return legacy; }
    } catch { /* Ignore blocked legacy storage. */ }
    return 0;
  }

  function writeHighscore(value) {
    window.ArcadeStorage?.writeRaw(highscoreKey, value);
  }

  function formatScore(value) { return String(Math.max(0, value)).padStart(3, "0"); }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  document.getElementById("start-button").addEventListener("click", startGame);
  document.getElementById("restart-button").addEventListener("click", startGame);
  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("visibilitychange", handleVisibility);
  document.addEventListener("keydown", (event) => {
    if (state.mode !== "running") return;
    if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(event.key)) event.preventDefault();
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") pressed.add("left");
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") pressed.add("right");
  });
  document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") pressed.delete("left");
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") pressed.delete("right");
  });

  [["move-left", "left"], ["move-right", "right"]].forEach(([id, direction]) => {
    const button = document.getElementById(id);
    button.addEventListener("pointerdown", (event) => { event.preventDefault(); button.setPointerCapture?.(event.pointerId); setDirection(direction, true, button); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((name) => button.addEventListener(name, () => setDirection(direction, false, button)));
  });
  wrap.addEventListener("pointerdown", (event) => { if (event.target === canvas) { canvas.setPointerCapture?.(event.pointerId); handlePointer(event); } });
  wrap.addEventListener("pointermove", (event) => { if (canvas.hasPointerCapture?.(event.pointerId)) handlePointer(event); });
  window.addEventListener("pagehide", () => { window.cancelAnimationFrame(frameId); state.mode = "stopped"; pressed.clear(); });

  updateHud();
  resizeCanvas();
})();
