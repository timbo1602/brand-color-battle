(() => {
  "use strict";

  const config = window.BRAND_COLOR_QUIZ;
  if (!config || !Array.isArray(config.rounds)) {
    document.body.innerHTML = "<main style='max-width:720px;margin:10vh auto;padding:24px;color:white;font:18px system-ui'><h1>Quiz konnte nicht geladen werden.</h1><p>Bitte prüfe, ob der Ordner <strong>js</strong> vollständig mitkopiert wurde.</p></main>";
    return;
  }

  const questions = config.rounds.flatMap((round, roundIndex) =>
    round.questions.map((question) => ({ ...question, roundIndex, round }))
  );
  const quizDataIsValid =
    config.rounds.length > 0 &&
    questions.length > 0 &&
    questions.every((question) => {
      const baseIsValid =
        typeof question.id === "string" &&
        typeof question.question === "string" &&
        Number.isFinite(question.points) &&
        question.points > 0;
      if (!baseIsValid) return false;
      if (question.type === "color-mixer") {
        return (
          question.target &&
          [question.target.h, question.target.s, question.target.l].every(Number.isFinite) &&
          Array.isArray(question.controls) &&
          question.controls.length > 0
        );
      }
      return (
        Array.isArray(question.choices) &&
        Number.isInteger(question.correctIndex) &&
        question.correctIndex >= 0 &&
        question.correctIndex < question.choices.length
      );
    });

  if (!quizDataIsValid) {
    document.body.innerHTML = "<main style='max-width:720px;margin:10vh auto;padding:24px;color:white;font:18px system-ui'><h1>Die Quizfragen sind unvollständig.</h1><p>Bitte prüfe die Datei <strong>js/questions.js</strong> oder kopiere die Originaldatei erneut.</p></main>";
    return;
  }
  const maxScore = questions.reduce((sum, question) => sum + question.points, 0);
  const leaderboardKey = "brand-color-battle-leaderboard-v1";
  const soundKey = "brand-color-battle-sound-v1";

  const state = {
    questionIndex: 0,
    score: 0,
    selectedIndex: null,
    answered: false,
    playerName: "Gast",
    roundScores: config.rounds.map(() => 0),
    mixerValue: null,
    soundEnabled: readStorage(soundKey, "on") !== "off"
  };

  const screens = [...document.querySelectorAll(".screen")];
  const startForm = document.getElementById("start-form");
  const nicknameInput = document.getElementById("nickname");
  const headerStatus = document.getElementById("header-status");
  const headerQuestion = document.getElementById("header-question");
  const headerScore = document.getElementById("header-score");
  const progressBar = document.getElementById("progress-bar");
  const quizRound = document.getElementById("quiz-round");
  const difficultyBadge = document.getElementById("difficulty-badge");
  const questionPoints = document.getElementById("question-points");
  const questionKicker = document.getElementById("question-kicker");
  const questionTitle = document.getElementById("question-title");
  const questionInstruction = document.getElementById("question-instruction");
  const answerArea = document.getElementById("answer-area");
  const submitAnswer = document.getElementById("submit-answer");
  const quizActions = document.getElementById("quiz-actions");
  const feedbackCard = document.getElementById("feedback-card");
  const feedbackIcon = document.getElementById("feedback-icon");
  const feedbackTitle = document.getElementById("feedback-title");
  const feedbackPoints = document.getElementById("feedback-points");
  const feedbackText = document.getElementById("feedback-text");
  const feedbackComparison = document.getElementById("feedback-comparison");
  const nextQuestion = document.getElementById("next-question");
  const leaderboardDialog = document.getElementById("leaderboard-dialog");
  const leaderboardList = document.getElementById("leaderboard-list");
  const resultLeaderboard = document.getElementById("result-leaderboard");
  const liveRegion = document.getElementById("live-region");
  const soundButton = document.getElementById("sound-button");
  const soundIcon = document.getElementById("sound-icon");
  let audioContext = null;

  function showScreen(id) {
    screens.forEach((screen) => screen.classList.toggle("is-active", screen.id === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startGame(event) {
    event?.preventDefault();
    const inputName = nicknameInput.value.trim().replace(/[<>]/g, "").slice(0, 18);
    state.playerName = inputName || "Gast";
    state.questionIndex = 0;
    state.score = 0;
    state.selectedIndex = null;
    state.answered = false;
    state.roundScores = config.rounds.map(() => 0);
    state.mixerValue = null;
    headerStatus.hidden = false;
    updateHeader();
    showRoundIntro(0);
    playTone("start");
  }

  function showRoundIntro(roundIndex) {
    const round = config.rounds[roundIndex];
    document.getElementById("round-number").textContent = String(roundIndex + 1).padStart(2, "0");
    document.getElementById("round-label").textContent = `Runde ${roundIndex + 1} von ${config.rounds.length}`;
    document.getElementById("round-title").textContent = round.title;
    document.getElementById("round-description").textContent = round.description;
    document.getElementById("round-screen").style.setProperty("--round-accent", round.accent);
    showScreen("round-screen");
    document.getElementById("round-start-button").focus({ preventScroll: true });
  }

  function renderQuestion() {
    const question = questions[state.questionIndex];
    state.selectedIndex = null;
    state.answered = false;
    state.mixerValue = null;

    quizRound.textContent = `Runde ${question.roundIndex + 1} · ${question.round.title}`;
    difficultyBadge.textContent = capitalize(question.difficulty);
    difficultyBadge.className = `difficulty-badge ${difficultyClass(question.difficulty)}`;
    questionPoints.textContent = `+${question.points} P`;
    questionKicker.textContent = question.kicker;
    questionTitle.textContent = question.question;
    questionInstruction.textContent = question.instruction;
    submitAnswer.disabled = true;
    submitAnswer.hidden = false;
    quizActions.hidden = false;
    feedbackCard.hidden = true;
    feedbackCard.className = "feedback-card";
    feedbackComparison.innerHTML = "";
    progressBar.style.width = `${((state.questionIndex + 1) / questions.length) * 100}%`;
    updateHeader();
    renderAnswerArea(question);
    showScreen("quiz-screen");

    const firstInteractive = answerArea.querySelector("button, input");
    firstInteractive?.focus({ preventScroll: true });
  }

  function renderAnswerArea(question) {
    answerArea.innerHTML = "";

    if (question.type === "color-mixer") {
      renderColorMixer(question);
      submitAnswer.disabled = false;
      return;
    }

    if (question.type === "brand-choice") {
      answerArea.appendChild(createPalettePreview(question.palette));
    }

    const grid = document.createElement("div");
    grid.className = `choice-grid ${question.type === "contrast-choice" ? "contrast-grid" : ""}`;

    question.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.className = "choice-button";
      button.type = "button";
      button.dataset.index = String(index);
      button.setAttribute("aria-pressed", "false");
      button.appendChild(createChoiceKey(index));

      if (question.type === "color-choice") {
        const swatch = document.createElement("span");
        swatch.className = "color-swatch";
        swatch.style.backgroundColor = choice.color;
        swatch.setAttribute("aria-hidden", "true");
        button.appendChild(swatch);
        button.appendChild(createChoiceLabel(choice.label, choice.color.toUpperCase()));
      } else if (question.type === "palette-choice") {
        button.appendChild(createPaletteMini(choice.colors));
        button.appendChild(createChoiceLabel(`Palette ${choice.label}`, "Zwei Markenfarben"));
      } else if (question.type === "brand-choice") {
        const word = document.createElement("span");
        word.className = "brand-word";
        word.textContent = choice;
        button.appendChild(word);
      } else if (question.type === "contrast-choice") {
        const sample = document.createElement("span");
        sample.className = "contrast-sample";
        sample.style.backgroundColor = question.background;
        sample.style.color = choice.color;
        sample.textContent = question.sampleText;
        button.appendChild(sample);
        button.appendChild(createChoiceLabel(choice.label, choice.color.toUpperCase()));
      } else {
        button.appendChild(createChoiceLabel(choice.title, choice.detail || ""));
      }

      button.addEventListener("click", () => selectChoice(index));
      grid.appendChild(button);
    });

    answerArea.appendChild(grid);
  }

  function createChoiceKey(index) {
    const key = document.createElement("span");
    key.className = "choice-key";
    key.textContent = String(index + 1);
    key.setAttribute("aria-hidden", "true");
    return key;
  }

  function createChoiceLabel(title, detail) {
    const label = document.createElement("span");
    label.className = "choice-label";
    const strong = document.createElement("strong");
    strong.textContent = title;
    label.appendChild(strong);
    if (detail) {
      const small = document.createElement("small");
      small.textContent = detail;
      label.appendChild(small);
    }
    return label;
  }

  function createPalettePreview(colors) {
    const palette = document.createElement("div");
    palette.className = "palette-preview";
    palette.setAttribute("aria-label", `Farbpalette ${colors.join(" und ")}`);
    colors.forEach((color) => {
      const segment = document.createElement("span");
      segment.style.backgroundColor = color;
      palette.appendChild(segment);
    });
    return palette;
  }

  function createPaletteMini(colors) {
    const palette = document.createElement("span");
    palette.className = "palette-mini";
    palette.setAttribute("aria-hidden", "true");
    colors.forEach((color) => {
      const segment = document.createElement("span");
      segment.style.backgroundColor = color;
      palette.appendChild(segment);
    });
    return palette;
  }

  function selectChoice(index) {
    if (state.answered) return;
    state.selectedIndex = index;
    answerArea.querySelectorAll(".choice-button").forEach((button, buttonIndex) => {
      const selected = buttonIndex === index;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    submitAnswer.disabled = false;
    playTone("select");
  }

  function renderColorMixer(question) {
    state.mixerValue = { h: question.initial.h, s: question.initial.s, l: question.initial.l };
    const layout = document.createElement("div");
    layout.className = "mixer-layout";

    const preview = document.createElement("div");
    preview.className = "mixer-preview";
    preview.id = "mixer-preview";
    const brand = document.createElement("strong");
    brand.textContent = question.brand;
    const values = document.createElement("span");
    values.className = "mixer-values";
    values.id = "mixer-values";
    preview.append(brand, values);

    const sliderList = document.createElement("div");
    sliderList.className = "slider-list";
    [
      { key: "h", label: "Farbton", max: 360, unit: "°" },
      { key: "s", label: "Sättigung", max: 100, unit: "%" },
      { key: "l", label: "Helligkeit", max: 100, unit: "%" }
    ].forEach((control) => {
      sliderList.appendChild(createSlider(question, control, preview, values));
    });

    layout.append(preview, sliderList);
    answerArea.appendChild(layout);
    updateMixerPreview(preview, values);
  }

  function createSlider(question, control, preview, values) {
    const row = document.createElement("div");
    row.className = "slider-row";
    const label = document.createElement("label");
    label.htmlFor = `mixer-${control.key}`;
    const labelText = document.createElement("span");
    labelText.textContent = control.label;
    const output = document.createElement("output");
    output.htmlFor = `mixer-${control.key}`;
    output.textContent = `${state.mixerValue[control.key]}${control.unit}`;
    label.append(labelText, output);
    row.appendChild(label);

    if (!question.controls.includes(control.key)) {
      const locked = document.createElement("div");
      locked.className = "locked-value";
      locked.innerHTML = `<span>Bereits eingestellt</span><strong>${state.mixerValue[control.key]}${control.unit}</strong>`;
      row.appendChild(locked);
      return row;
    }

    const input = document.createElement("input");
    input.type = "range";
    input.id = `mixer-${control.key}`;
    input.min = "0";
    input.max = String(control.max);
    input.value = String(state.mixerValue[control.key]);
    input.setAttribute("aria-label", control.label);
    input.style.setProperty("--range-bg", sliderBackground(control.key, state.mixerValue));
    input.addEventListener("input", () => {
      state.mixerValue[control.key] = Number(input.value);
      output.textContent = `${input.value}${control.unit}`;
      document.querySelectorAll(".slider-row input").forEach((slider) => {
        const key = slider.id.replace("mixer-", "");
        slider.style.setProperty("--range-bg", sliderBackground(key, state.mixerValue));
      });
      updateMixerPreview(preview, values);
    });
    row.appendChild(input);
    return row;
  }

  function sliderBackground(key, color) {
    if (key === "h") return "linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)";
    if (key === "s") return `linear-gradient(90deg, hsl(${color.h}, 0%, ${color.l}%), hsl(${color.h}, 100%, ${color.l}%))`;
    return `linear-gradient(90deg, #000, hsl(${color.h}, ${color.s}%, 50%), #fff)`;
  }

  function updateMixerPreview(preview, values) {
    const { h, s, l } = state.mixerValue;
    const hsl = `hsl(${h}, ${s}%, ${l}%)`;
    preview.style.backgroundColor = hsl;
    values.textContent = `${h}° · ${s}% · ${l}% · ${hslToHex(h, s, l).toUpperCase()}`;
  }

  function evaluateAnswer() {
    if (state.answered) return;
    const question = questions[state.questionIndex];
    if (question.type !== "color-mixer" && state.selectedIndex === null) return;

    state.answered = true;
    let earned = 0;
    let correct = false;
    let accuracy = null;

    if (question.type === "color-mixer") {
      accuracy = calculateColorAccuracy(state.mixerValue, question.target, question.controls);
      earned = Math.round(question.points * accuracy);
      correct = accuracy >= 0.72;
      answerArea.querySelectorAll("input").forEach((input) => { input.disabled = true; });
    } else {
      correct = state.selectedIndex === question.correctIndex;
      earned = correct ? question.points : 0;
      answerArea.querySelectorAll(".choice-button").forEach((button, index) => {
        button.disabled = true;
        button.classList.toggle("is-correct", index === question.correctIndex);
        button.classList.toggle("is-wrong", index === state.selectedIndex && !correct);
      });
    }

    state.score += earned;
    state.roundScores[question.roundIndex] += earned;
    updateHeader();
    showFeedback(question, correct, earned, accuracy);
    playTone(correct ? "correct" : "wrong");
  }

  function calculateColorAccuracy(current, target, controls) {
    const distances = [];
    if (controls.includes("h")) {
      const hueDifference = Math.min(Math.abs(current.h - target.h), 360 - Math.abs(current.h - target.h));
      distances.push(Math.min(1, hueDifference / 90));
    }
    if (controls.includes("s")) distances.push(Math.abs(current.s - target.s) / 100);
    if (controls.includes("l")) distances.push(Math.abs(current.l - target.l) / 100);
    const rms = Math.sqrt(distances.reduce((sum, value) => sum + value * value, 0) / distances.length);
    return Math.max(0, Math.min(1, 1 - rms));
  }

  function showFeedback(question, correct, earned, accuracy) {
    quizActions.hidden = true;
    feedbackCard.hidden = false;
    feedbackCard.classList.add(correct ? "correct" : "wrong");
    feedbackIcon.textContent = correct ? "✓" : "×";

    if (question.type === "color-mixer") {
      const percent = Math.round(accuracy * 100);
      feedbackTitle.textContent = percent >= 90 ? "Fast perfekt!" : percent >= 72 ? "Stark gemischt!" : percent >= 50 ? "Schon ziemlich nah!" : "Noch nicht ganz.";
      feedbackPoints.textContent = `${percent}% ähnlich · +${earned} Punkte`;
      const chosenHex = hslToHex(state.mixerValue.h, state.mixerValue.s, state.mixerValue.l);
      feedbackComparison.innerHTML = `
        <div class="color-comparison">
          <span><i style="background:${chosenHex}"></i>Deine Farbe ${chosenHex.toUpperCase()}</span>
          <span><i style="background:${question.target.hex}"></i>Ziel ${question.target.hex.toUpperCase()}</span>
        </div>`;
    } else {
      feedbackTitle.textContent = correct ? "Richtig!" : "Nicht ganz.";
      feedbackPoints.textContent = correct ? `+${earned} Punkte` : "+0 Punkte";
    }

    feedbackText.textContent = question.explanation;
    liveRegion.textContent = `${feedbackTitle.textContent} ${feedbackPoints.textContent}. ${question.explanation}`;
    nextQuestion.focus({ preventScroll: true });
  }

  function goToNextQuestion() {
    const previousRound = questions[state.questionIndex].roundIndex;
    state.questionIndex += 1;

    if (state.questionIndex >= questions.length) {
      showResults();
      return;
    }

    const nextRound = questions[state.questionIndex].roundIndex;
    if (nextRound !== previousRound) {
      showRoundIntro(nextRound);
      playTone("round");
    } else {
      renderQuestion();
    }
  }

  function showResults() {
    headerStatus.hidden = true;
    saveScore(state.playerName, state.score);
    const rank = getRank(state.score);
    document.getElementById("final-score").textContent = formatNumber(state.score);
    document.getElementById("max-score").textContent = formatNumber(maxScore);
    document.getElementById("result-title").textContent = rank.title;
    document.getElementById("rank-badge").textContent = rank.label;
    document.getElementById("result-message").textContent = rank.message;
    document.getElementById("result-name").textContent = state.playerName;
    renderBreakdown();
    renderLeaderboard(resultLeaderboard, 5);
    updateLocalBest();
    showScreen("result-screen");
    playTone("finish");
  }

  function renderBreakdown() {
    const container = document.getElementById("breakdown-list");
    container.innerHTML = "";
    config.rounds.forEach((round, index) => {
      const roundMax = round.questions.reduce((sum, question) => sum + question.points, 0);
      const value = state.roundScores[index];
      const row = document.createElement("div");
      row.className = "breakdown-row";
      const content = document.createElement("div");
      const meta = document.createElement("div");
      meta.className = "breakdown-meta";
      const title = document.createElement("strong");
      title.textContent = round.title;
      const points = document.createElement("span");
      points.textContent = `${value} / ${roundMax}`;
      meta.append(title, points);
      const track = document.createElement("div");
      track.className = "breakdown-track";
      const bar = document.createElement("span");
      bar.style.width = `${(value / roundMax) * 100}%`;
      bar.style.backgroundColor = round.accent;
      track.appendChild(bar);
      content.append(meta, track);
      row.appendChild(content);
      container.appendChild(row);
    });
  }

  function getRank(score) {
    if (score >= 1080) return { label: "CREATIVE DIRECTOR", title: "Du siehst Farben wie ein Profi.", message: "Markenfarben, Nuancen und Produktionswissen sitzen. Du wärst im Designteam sofort eine starke Besetzung." };
    if (score >= 900) return { label: "COLOR PRO", title: "Sehr starkes Farbgefühl!", message: "Du erkennst Markenwelten schnell und triffst auch feine Nuancen erstaunlich genau." };
    if (score >= 720) return { label: "BRAND DETECTIVE", title: "Du kennst deine Marken.", message: "Dein Blick für Corporate Colors ist gut. Im Color Lab steckt noch Potenzial für den nächsten Highscore." };
    if (score >= 480) return { label: "PIXEL SCOUT", title: "Gute Grundlage!", message: "Viele Farbcodes hast du bereits im Gefühl. Mit einer zweiten Runde fallen dir die Unterschiede sicher noch stärker auf." };
    return { label: "COLOR ROOKIE", title: "Dein Farbtraining beginnt.", message: "Markenfarben wirken vertraut, sind aber überraschend schwer exakt zu erinnern. Versuch direkt eine Revanche." };
  }

  function updateHeader() {
    headerQuestion.textContent = `${String(Math.min(state.questionIndex + 1, questions.length)).padStart(2, "0")} / ${questions.length}`;
    headerScore.textContent = `${formatNumber(state.score)} P`;
  }

  function saveScore(name, score) {
    const entries = getLeaderboard();
    entries.push({ name, score, timestamp: Date.now() });
    entries.sort((a, b) => b.score - a.score || a.timestamp - b.timestamp);
    writeStorage(leaderboardKey, JSON.stringify(entries.slice(0, 10)));
  }

  function getLeaderboard() {
    try {
      const parsed = JSON.parse(readStorage(leaderboardKey, "[]"));
      return Array.isArray(parsed)
        ? parsed.filter((entry) =>
            entry &&
            typeof entry.name === "string" &&
            Number.isFinite(entry.score) &&
            entry.score >= 0 &&
            entry.score <= maxScore
          )
        : [];
    } catch {
      return [];
    }
  }

  function renderLeaderboard(container, limit = 10) {
    const entries = getLeaderboard().slice(0, limit);
    container.innerHTML = "";
    if (!entries.length) {
      const empty = document.createElement("li");
      empty.className = "empty-row";
      empty.textContent = "Noch kein Ergebnis – sichere dir Platz 1!";
      container.appendChild(empty);
      return;
    }
    entries.forEach((entry) => {
      const item = document.createElement("li");
      const name = document.createElement("strong");
      name.textContent = entry.name;
      const score = document.createElement("span");
      score.textContent = `${formatNumber(entry.score)} P`;
      item.append(name, score);
      container.appendChild(item);
    });
  }

  function openLeaderboard() {
    renderLeaderboard(leaderboardList);
    if (typeof leaderboardDialog.showModal === "function") leaderboardDialog.showModal();
    else leaderboardDialog.setAttribute("open", "");
  }

  function closeLeaderboard() {
    if (typeof leaderboardDialog.close === "function") leaderboardDialog.close();
    else leaderboardDialog.removeAttribute("open");
  }

  function clearLeaderboard() {
    if (!window.confirm("Bestenliste auf diesem PC wirklich löschen?")) return;
    writeStorage(leaderboardKey, "[]");
    renderLeaderboard(leaderboardList);
    renderLeaderboard(resultLeaderboard, 5);
    updateLocalBest();
  }

  function updateLocalBest() {
    const best = getLeaderboard()[0];
    document.getElementById("local-best").textContent = best
      ? `Highscore: ${best.name} · ${formatNumber(best.score)} P`
      : "Noch kein Highscore";
  }

  function returnHome(force = false) {
    const activeQuiz = document.getElementById("quiz-screen").classList.contains("is-active") || document.getElementById("round-screen").classList.contains("is-active");
    if (!force && activeQuiz && !window.confirm("Aktuelle Runde beenden und zur Startseite zurückkehren?")) return;
    headerStatus.hidden = true;
    showScreen("start-screen");
    updateLocalBest();
    nicknameInput.focus({ preventScroll: true });
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    writeStorage(soundKey, state.soundEnabled ? "on" : "off");
    updateSoundButton();
    if (state.soundEnabled) playTone("select");
  }

  function updateSoundButton() {
    soundIcon.textContent = state.soundEnabled ? "♪" : "×";
    soundButton.setAttribute("aria-label", state.soundEnabled ? "Ton ausschalten" : "Ton einschalten");
    soundButton.title = state.soundEnabled ? "Ton ausschalten" : "Ton einschalten";
  }

  function playTone(type) {
    if (!state.soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioContext) audioContext = new AudioContext();
      if (audioContext.state === "suspended") audioContext.resume().catch(() => {});

      const patterns = {
        select: { wave: "sine", volume: 0.035, notes: [[420, 0, 0.045]] },
        start: { wave: "square", volume: 0.035, notes: [[330, 0, 0.06], [440, 0.07, 0.07], [660, 0.15, 0.11]] },
        round: { wave: "triangle", volume: 0.045, notes: [[392, 0, 0.06], [523, 0.07, 0.06], [659, 0.14, 0.11]] },
        correct: { wave: "sine", volume: 0.055, notes: [[523, 0, 0.08], [659, 0.08, 0.08], [784, 0.17, 0.14]] },
        wrong: { wave: "sawtooth", volume: 0.03, notes: [[240, 0, 0.12], [190, 0.1, 0.2]] },
        finish: { wave: "square", volume: 0.04, notes: [[392, 0, 0.08], [523, 0.1, 0.08], [659, 0.2, 0.08], [784, 0.3, 0.12], [1046, 0.45, 0.3]] }
      };
      const pattern = patterns[type] || patterns.select;
      const now = audioContext.currentTime;

      pattern.notes.forEach(([frequency, delay, duration], index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const startAt = now + delay;
        oscillator.type = pattern.wave;
        oscillator.frequency.setValueAtTime(frequency, startAt);
        if (type === "finish" && index === pattern.notes.length - 1) {
          oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.015, startAt + duration);
        }
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(pattern.volume, startAt + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(startAt);
        oscillator.stop(startAt + duration + 0.02);
      });
    } catch {
      // Sound is an optional enhancement; the quiz remains fully usable without it.
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      const request = document.documentElement.requestFullscreen?.();
      request?.catch?.(() => {});
    } else {
      const exit = document.exitFullscreen?.();
      exit?.catch?.(() => {});
    }
  }

  function handleKeyboard(event) {
    const quizActive = document.getElementById("quiz-screen").classList.contains("is-active");
    if (!quizActive) return;
    if (event.target.matches("input[type='range']")) return;

    if (!state.answered && /^[1-4]$/.test(event.key)) {
      const index = Number(event.key) - 1;
      const button = answerArea.querySelector(`.choice-button[data-index="${index}"]`);
      if (button) {
        event.preventDefault();
        button.click();
      }
    }

    if (event.key === "Enter") {
      if (state.answered) {
        event.preventDefault();
        goToNextQuestion();
      } else if (!submitAnswer.disabled) {
        event.preventDefault();
        evaluateAnswer();
      }
    }
  }

  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const chroma = (1 - Math.abs(2 * l - 1)) * s;
    const x = chroma * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - chroma / 2;
    let r = 0;
    let g = 0;
    let b = 0;
    if (h < 60) [r, g, b] = [chroma, x, 0];
    else if (h < 120) [r, g, b] = [x, chroma, 0];
    else if (h < 180) [r, g, b] = [0, chroma, x];
    else if (h < 240) [r, g, b] = [0, x, chroma];
    else if (h < 300) [r, g, b] = [x, 0, chroma];
    else [r, g, b] = [chroma, 0, x];
    return `#${[r, g, b].map((value) => Math.round((value + m) * 255).toString(16).padStart(2, "0")).join("")}`;
  }

  function difficultyClass(value) {
    return { leicht: "easy", mittel: "medium", schwer: "hard" }[value] || "easy";
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("de-DE").format(value);
  }

  function readStorage(key, fallback) {
    try {
      return window.localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Some kiosk configurations block local storage; gameplay still works.
    }
  }

  startForm.addEventListener("submit", startGame);
  document.getElementById("round-start-button").addEventListener("click", renderQuestion);
  submitAnswer.addEventListener("click", evaluateAnswer);
  nextQuestion.addEventListener("click", goToNextQuestion);
  document.getElementById("restart-button").addEventListener("click", startGame);
  document.getElementById("result-home-button").addEventListener("click", () => returnHome(true));
  document.getElementById("home-button").addEventListener("click", () => returnHome(false));
  document.getElementById("open-leaderboard").addEventListener("click", openLeaderboard);
  document.getElementById("close-leaderboard").addEventListener("click", closeLeaderboard);
  document.getElementById("close-leaderboard-bottom").addEventListener("click", closeLeaderboard);
  document.getElementById("clear-leaderboard").addEventListener("click", clearLeaderboard);
  document.getElementById("fullscreen-button").addEventListener("click", toggleFullscreen);
  soundButton.addEventListener("click", toggleSound);
  document.addEventListener("keydown", handleKeyboard);
  leaderboardDialog.addEventListener("click", (event) => {
    if (event.target === leaderboardDialog) closeLeaderboard();
  });

  document.getElementById("max-score").textContent = formatNumber(maxScore);
  updateSoundButton();
  updateLocalBest();
})();
