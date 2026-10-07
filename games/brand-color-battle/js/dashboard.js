(() => {
  "use strict";

  const settings = window.BRAND_COLOR_BATTLE_SUPABASE || {};
  const supabaseUrl = String(settings.SUPABASE_URL || "").replace(/\/+$/, "");
  const publishableKey = String(settings.SUPABASE_PUBLISHABLE_KEY || settings.SUPABASE_ANON_KEY || "").trim();
  const enabled = /^https:\/\//i.test(supabaseUrl) && publishableKey.length > 20;
  const maxScore = 1200;
  const refreshInterval = 30_000;

  const connectionStatus = document.getElementById("connection-status");
  const refreshButton = document.getElementById("refresh-dashboard");
  const fullscreenButton = document.getElementById("toggle-fullscreen");
  const fullscreenLabel = document.getElementById("fullscreen-label");
  const lastUpdated = document.getElementById("last-updated");
  const dashboardMessage = document.getElementById("dashboard-message");
  const rankingList = document.getElementById("global-ranking");
  const recentList = document.getElementById("recent-results");
  const totalMetric = document.getElementById("metric-total");
  const averageMetric = document.getElementById("metric-average");
  const highscoreMetric = document.getElementById("metric-highscore");
  const leaderMetric = document.getElementById("metric-leader");
  const perfectMetric = document.getElementById("metric-perfect");

  let loading = false;

  async function loadDashboard() {
    if (loading) return;
    if (!enabled) {
      showError("Die globale Bestenliste ist noch nicht konfiguriert.");
      setConnection("offline", "Nicht konfiguriert");
      return;
    }

    loading = true;
    refreshButton.classList.add("is-loading");
    refreshButton.disabled = true;
    dashboardMessage.hidden = true;

    try {
      const response = await window.fetch(
        `${supabaseUrl}/rest/v1/scores?select=nickname,score,created_at&order=created_at.desc&limit=1000`,
        {
          headers: {
            apikey: publishableKey,
            Prefer: "count=exact"
          }
        }
      );
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      const rows = await response.json();
      const scores = Array.isArray(rows) ? rows.map(normalizeScore).filter(Boolean) : [];
      const exactCount = parseExactCount(response.headers.get("content-range"));
      renderDashboard(scores, exactCount ?? scores.length);
      setConnection("online", "Live verbunden");
      lastUpdated.textContent = `Aktualisiert ${formatTime(new Date())}`;
    } catch {
      showError("Die Live-Daten sind gerade nicht erreichbar. Der nächste Versuch startet automatisch.");
      setConnection("offline", "Verbindung unterbrochen");
    } finally {
      loading = false;
      refreshButton.classList.remove("is-loading");
      refreshButton.disabled = false;
    }
  }

  function renderDashboard(scores, totalCount) {
    const ranked = [...scores].sort((a, b) => b.score - a.score || a.timestamp - b.timestamp);
    const recent = [...scores].sort((a, b) => b.timestamp - a.timestamp);
    const average = scores.length
      ? Math.round(scores.reduce((sum, entry) => sum + entry.score, 0) / scores.length)
      : 0;
    const highscore = ranked[0];
    const perfectCount = scores.filter((entry) => entry.score === maxScore).length;

    totalMetric.textContent = formatNumber(totalCount);
    averageMetric.textContent = formatNumber(average);
    highscoreMetric.textContent = highscore ? formatNumber(highscore.score) : "0";
    leaderMetric.textContent = highscore ? highscore.name : "noch offen";
    perfectMetric.textContent = formatNumber(perfectCount);

    renderRanking(ranked.slice(0, 10));
    renderRecent(recent.slice(0, 6));
  }

  function renderRanking(entries) {
    rankingList.replaceChildren();
    if (!entries.length) {
      rankingList.appendChild(createPlaceholder("Noch kein Ergebnis – sichere dir Platz 1!"));
      return;
    }

    entries.forEach((entry, index) => {
      const item = document.createElement("li");
      const position = document.createElement("span");
      position.className = "ranking-position";
      position.textContent = String(index + 1).padStart(2, "0");

      const player = document.createElement("div");
      player.className = "ranking-player";
      const name = document.createElement("strong");
      name.textContent = entry.name;
      const date = document.createElement("small");
      date.textContent = formatDate(entry.timestamp);
      player.append(name, date);

      const score = document.createElement("span");
      score.className = "ranking-score";
      score.textContent = `${formatNumber(entry.score)} P`;
      item.append(position, player, score);
      rankingList.appendChild(item);
    });
  }

  function renderRecent(entries) {
    recentList.replaceChildren();
    if (!entries.length) {
      recentList.appendChild(createPlaceholder("Noch keine Aktivität vorhanden."));
      return;
    }

    entries.forEach((entry) => {
      const item = document.createElement("li");
      const dot = document.createElement("i");
      dot.className = "activity-dot";
      dot.setAttribute("aria-hidden", "true");

      const copy = document.createElement("div");
      copy.className = "activity-copy";
      const name = document.createElement("strong");
      name.textContent = entry.name;
      const time = document.createElement("small");
      time.textContent = formatRelativeTime(entry.timestamp);
      copy.append(name, time);

      const score = document.createElement("span");
      score.className = "activity-score";
      score.textContent = `${formatNumber(entry.score)} P`;
      item.append(dot, copy, score);
      recentList.appendChild(item);
    });
  }

  function createPlaceholder(text) {
    const item = document.createElement("li");
    item.className = "dashboard-placeholder";
    item.textContent = text;
    return item;
  }

  function normalizeScore(row) {
    if (!row || typeof row.nickname !== "string") return null;
    const name = row.nickname.trim().replace(/[<>]/g, "").slice(0, 18);
    const score = Number(row.score);
    const timestamp = Date.parse(row.created_at);
    if (!name || !Number.isInteger(score) || score < 0 || score > maxScore || !Number.isFinite(timestamp)) return null;
    return { name, score, timestamp };
  }

  function parseExactCount(contentRange) {
    const value = String(contentRange || "").split("/")[1];
    const count = Number(value);
    return Number.isInteger(count) ? count : null;
  }

  function setConnection(state, text) {
    connectionStatus.className = `dashboard-live is-${state}`;
    connectionStatus.querySelector("span").textContent = text;
  }

  function showError(message) {
    dashboardMessage.textContent = message;
    dashboardMessage.hidden = false;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("de-DE").format(value);
  }

  function formatDate(timestamp) {
    return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(timestamp));
  }

  function formatTime(date) {
    return new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" }).format(date);
  }

  function formatRelativeTime(timestamp) {
    const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
    if (minutes < 1) return "gerade eben";
    if (minutes < 60) return `vor ${minutes} Min.`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `vor ${hours} Std.`;
    return formatDate(timestamp);
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      showError("Der Browser konnte den Vollbildmodus nicht starten. Nutze alternativ die Vollbildtaste des Browsers.");
    }
  }

  function syncFullscreenState() {
    const active = Boolean(document.fullscreenElement);
    document.body.classList.toggle("is-display-mode", active);
    fullscreenLabel.textContent = active ? "Vollbild beenden" : "Vollbild";
    fullscreenButton.setAttribute("aria-pressed", String(active));
  }

  refreshButton.addEventListener("click", loadDashboard);
  fullscreenButton.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", syncFullscreenState);
  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "f" && !event.metaKey && !event.ctrlKey && !event.altKey) {
      toggleFullscreen();
    }
  });
  window.addEventListener("online", loadDashboard);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) loadDashboard();
  });
  window.setInterval(() => {
    if (!document.hidden) loadDashboard();
  }, refreshInterval);

  syncFullscreenState();
  loadDashboard();
})();
