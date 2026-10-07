(() => {
  "use strict";
  if (!window.ArcadeShared?.setupGamePage("geoSprint")) return;

  const countries = [...window.GEO_COUNTRIES];
  const names = new Map(countries.map((country) => [country.iso, country.name]));
  const modes = { flag: "FLAGGEN", capital: "HAUPTSTÄDTE", outline: "UMRISSE", continent: "KONTINENTE", distance: "DISTANZEN", neighbors: "NACHBARN" };
  const screens = ["start-screen", "play-screen", "result-screen"];
  const el = (id) => document.getElementById(id);
  const state = { mode: "", index: 0, score: 0, questions: [], outlines: new Map(), locked: false };
  let loadOutlines;

  function show(id) { screens.forEach((screen) => { el(screen).hidden = screen !== id; }); }
  function choose(list, count, except = []) { return ArcadeShared.sample(list.filter((item) => !except.includes(item)), count); }
  function answers(correct, pool) { return ArcadeShared.shuffle([correct, ...choose([...new Set(pool)].filter((item) => item !== correct), 3)]); }
  function bestKey() { return `geo-sprint:best:${state.mode}`; }
  function updateHud() { el("round").textContent = `${Math.min(state.index + 1, 10)} / 10`; el("score").textContent = state.score; el("best").textContent = ArcadeStorage.readNumber(bestKey(), 0, { min: 0 }); }

  function prepare(mode) {
    const eligible = mode === "neighbors" ? countries.filter((country) => country.neighbors.length >= 2) : mode === "outline" ? countries.filter((country) => state.outlines.has(country.iso)) : countries;
    state.mode = mode; state.index = 0; state.score = 0; state.locked = false;
    state.questions = ArcadeShared.sample(eligible, 10).map((country, index, selected) => ({ country, partner: mode === "distance" ? choose(countries, 1, selected)[0] : null }));
    show("play-screen"); render();
  }

  function coordinates(geometry) {
    const points = [];
    const walk = (value) => Array.isArray(value?.[0]) ? value.forEach(walk) : points.push(value);
    walk(geometry.coordinates); return points;
  }
  function outlinePath(geometry) {
    const points = coordinates(geometry); const xs = points.map((p) => p[0]); const ys = points.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const scale = Math.min(500 / Math.max(maxX - minX, .1), 220 / Math.max(maxY - minY, .1));
    const ox = (560 - (maxX - minX) * scale) / 2, oy = (260 - (maxY - minY) * scale) / 2;
    const point = ([x, y]) => `${(ox + (x - minX) * scale).toFixed(1)},${(oy + (maxY - y) * scale).toFixed(1)}`;
    const polygon = (poly) => poly.map((ring) => `M${ring.map(point).join("L")}Z`).join("");
    return geometry.type === "Polygon" ? polygon(geometry.coordinates) : geometry.coordinates.map(polygon).join("");
  }
  function haversine(a, b) {
    const rad = (n) => n * Math.PI / 180, radius = 6371; const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const value = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return Math.round(2 * radius * Math.asin(Math.sqrt(value)));
  }
  function setVisual(markup) { el("visual").hidden = !markup; el("visual").innerHTML = markup || ""; }
  function render() {
    state.locked = false; el("feedback").hidden = true; el("options").replaceChildren(); el("distance-form").hidden = true;
    const { country, partner } = state.questions[state.index]; el("mode-label").textContent = modes[state.mode]; updateHud();
    let question = "", detail = "", correct = "", values = [], visual = "";
    if (state.mode === "flag") { question = "Welches Land zeigt diese Flagge?"; detail = `Flaggen-Code: ${country.iso}`; correct = country.name; values = answers(correct, countries.map((c) => c.name)); visual = `<div><div class="flag" role="img" aria-label="Flagge ${country.iso}">${country.flag}</div><div class="flag-fallback">${country.iso}</div></div>`; }
    if (state.mode === "capital") { question = `Was ist die Hauptstadt von ${country.name}?`; detail = "Wähle die passende Hauptstadt."; correct = country.capital; values = answers(correct, countries.map((c) => c.capital)); }
    if (state.mode === "outline") { question = "Welches Land hat diesen Umriss?"; detail = "Der Vektor liegt vollständig lokal im Spiel."; correct = country.name; values = answers(correct, countries.map((c) => c.name)); visual = `<svg viewBox="0 0 560 260" role="img" aria-label="Länderumriss"><path d="${outlinePath(state.outlines.get(country.iso))}"/></svg>`; }
    if (state.mode === "continent") { question = `Auf welchem Kontinent liegt ${country.name}?`; detail = "Ordne das Land geografisch ein."; correct = country.continent; values = answers(correct, countries.map((c) => c.continent)); }
    if (state.mode === "neighbors") { const neighborList = country.neighbors.map((iso) => names.get(iso)).filter(Boolean); question = "Welches Land grenzt an diese Staaten?"; detail = "Alle genannten Nachbarn gehören zum gesuchten Land."; correct = country.name; values = answers(correct, countries.map((c) => c.name)); visual = `<div class="neighbors">${neighborList.map((name) => `<span>${name}</span>`).join("")}</div>`; }
    if (state.mode === "distance") { question = "Wie weit liegen diese Hauptstädte auseinander?"; detail = "Schätze die Luftlinie – auf 50 km gerundet eingeben."; visual = `<div class="route"><span>${country.capital}<br><small>${country.name}</small></span><i>↔</i><span>${partner.capital}<br><small>${partner.name}</small></span></div>`; el("distance-form").hidden = false; el("distance-input").value = ""; setTimeout(() => el("distance-input").focus(), 0); }
    el("question").textContent = question; el("detail").textContent = detail; setVisual(visual);
    values.forEach((value) => { const button = document.createElement("button"); button.type = "button"; button.className = "option-button"; button.textContent = value; button.addEventListener("click", () => answerChoice(button, value, correct)); el("options").append(button); });
  }
  function finishAnswer(points, title, copy, selectedButton, correct) {
    if (state.locked) return; state.locked = true; state.score += points; updateHud();
    [...el("options").children].forEach((button) => { button.disabled = true; if (button.textContent === correct) button.classList.add("is-correct"); });
    if (selectedButton && selectedButton.textContent !== correct) selectedButton.classList.add("is-wrong");
    el("feedback-title").textContent = title; el("feedback-copy").textContent = copy; el("feedback").hidden = false; el("next-question").textContent = state.index === 9 ? "Ergebnis ansehen →" : "Nächste Route →";
    ArcadeAudio.play(points > 0 ? "correct" : "wrong"); el("live").textContent = `${title}. ${copy}`;
  }
  function answerChoice(button, value, correct) { const okay = value === correct; finishAnswer(okay ? 100 : 0, okay ? "+100 · Richtig" : "Nicht ganz", okay ? `Das ist ${correct}.` : `Richtig wäre ${correct}.`, button, correct); }
  function answerDistance(event) {
    event.preventDefault(); if (state.locked) return; const guess = Number(el("distance-input").value); if (!Number.isFinite(guess)) return;
    const { country, partner } = state.questions[state.index], actual = haversine(country, partner), error = Math.abs(actual - guess), ratio = error / actual;
    const points = ratio <= .05 ? 100 : ratio <= .15 ? 75 : ratio <= .3 ? 50 : ratio <= .5 ? 25 : 0;
    finishAnswer(points, `+${points} Punkte`, `Die Luftlinie beträgt rund ${actual.toLocaleString("de-DE")} km. Deine Abweichung: ${error.toLocaleString("de-DE")} km.`, null, "");
  }
  function next() { if (state.index >= 9) return finish(); state.index += 1; render(); }
  function finish() {
    const oldBest = ArcadeStorage.readNumber(bestKey(), 0, { min: 0 }), isBest = state.score > oldBest; if (isBest) ArcadeStorage.writeRaw(bestKey(), state.score);
    el("result-score").textContent = state.score; el("result-title").textContent = isBest ? "Neue Bestmarke!" : "Weltreise beendet"; el("result-best").textContent = `Bestwert in ${modes[state.mode].toLowerCase()}: ${Math.max(oldBest, state.score)} Punkte.`;
    el("best").textContent = Math.max(oldBest, state.score); show("result-screen"); ArcadeAudio.play(isBest ? "highscore" : "end");
  }
  async function start(mode, button) {
    if (mode === "outline" && !state.outlines.size) { button.disabled = true; button.querySelector("small").textContent = "Umrisse werden geladen …"; await loadOutlines; button.disabled = false; button.querySelector("small").textContent = "Lokale Natural-Earth-Vektoren, keine Karten-API."; }
    prepare(mode);
  }

  loadOutlines = fetch("./data/outlines.geojson").then((response) => { if (!response.ok) throw new Error("outline data"); return response.json(); }).then((data) => { state.outlines = new Map(data.features.map((feature) => [feature.properties.iso, feature.geometry])); }).catch(() => { document.querySelector('[data-mode="outline"]').disabled = true; document.querySelector('[data-mode="outline"] small').textContent = "Umrissdaten konnten nicht geladen werden."; });
  el("mode-list").addEventListener("click", (event) => { const button = event.target.closest("[data-mode]"); if (button && !button.disabled) start(button.dataset.mode, button); });
  el("distance-form").addEventListener("submit", answerDistance); el("next-question").addEventListener("click", next); el("restart-game").addEventListener("click", () => show("start-screen"));
  el("best").textContent = "–";
})();
