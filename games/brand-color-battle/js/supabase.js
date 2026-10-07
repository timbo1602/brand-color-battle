(() => {
  "use strict";

  const settings = window.BRAND_COLOR_BATTLE_SUPABASE || {};
  const supabaseUrl = String(settings.SUPABASE_URL || "").replace(/\/+$/, "");
  const publishableKey = String(settings.SUPABASE_PUBLISHABLE_KEY || settings.SUPABASE_ANON_KEY || "").trim();
  const enabled = /^https:\/\//i.test(supabaseUrl) && publishableKey.length > 20;
  const leaderboardKey = "brand-color-battle-leaderboard-v1";
  const pendingKey = "brand-color-battle-pending-scores-v1";
  const refreshInterval = 30_000;
  const requestTimeout = 7_000;

  let maxScore = 1200;
  let remoteEntries = [];
  let remoteAvailable = false;
  let syncing = false;
  let syncPromise = null;
  const listeners = new Set();

  function init(options = {}) {
    if (Number.isFinite(options.maxScore) && options.maxScore > 0) maxScore = options.maxScore;
    if (!enabled) return;

    window.addEventListener("online", () => {
      flush().catch(() => {});
    });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) flush().catch(() => {});
    });
    window.setInterval(() => {
      if (!document.hidden) refresh().catch(() => {});
    }, refreshInterval);

    flush().catch(() => {});
  }

  function subscribe(listener) {
    if (typeof listener !== "function") return () => {};
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function emit() {
    listeners.forEach((listener) => {
      try {
        listener(getStatus());
      } catch {
        // A display callback must never interrupt score synchronization.
      }
    });
  }

  function getStatus() {
    return {
      enabled,
      mode: enabled && remoteAvailable ? "global" : "local",
      pending: getPending().length,
      syncing
    };
  }

  function save(name, score) {
    const entry = normalizeLocalEntry({ name, score, timestamp: Date.now() });
    if (!entry) return;

    const localEntries = getLocalEntries();
    localEntries.push(entry);
    localEntries.sort(compareEntries);
    writeJson(leaderboardKey, localEntries.slice(0, 10));

    if (enabled) {
      const pending = getPending();
      pending.push({
        nickname: entry.name,
        score: entry.score,
        submission_id: createUuid()
      });
      writeJson(pendingKey, pending);
      flush().catch(() => {});
    }
    emit();
  }

  function getEntries(limit = 10) {
    const entries = enabled && remoteAvailable ? remoteEntries : getLocalEntries();
    return entries.slice(0, limit);
  }

  function getLocalEntries() {
    const entries = readJson(leaderboardKey);
    return Array.isArray(entries)
      ? entries.map(normalizeLocalEntry).filter(Boolean).sort(compareEntries).slice(0, 10)
      : [];
  }

  function clearLocal() {
    writeJson(leaderboardKey, []);
    emit();
  }

  async function refresh() {
    if (!enabled) return false;
    try {
      const response = await request(
        "/rest/v1/scores?select=nickname,score,created_at&order=score.desc,created_at.asc&limit=10"
      );
      if (!response.ok) throw new Error(`Supabase read failed: ${response.status}`);
      const rows = await response.json();
      remoteEntries = Array.isArray(rows)
        ? rows.map(normalizeRemoteEntry).filter(Boolean).sort(compareEntries).slice(0, 10)
        : [];
      remoteAvailable = true;
      emit();
      return true;
    } catch {
      remoteAvailable = false;
      emit();
      return false;
    }
  }

  async function flush() {
    if (!enabled) return false;
    if (syncPromise) return syncPromise;

    syncPromise = (async () => {
      syncing = true;
      emit();
      try {
        const queue = getPending();
        while (queue.length) {
          const entry = queue[0];
          const response = await request("/rest/v1/scores?on_conflict=submission_id", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Prefer: "resolution=ignore-duplicates,return=minimal"
            },
            body: JSON.stringify([entry])
          });
          if (!response.ok) throw new Error(`Supabase write failed: ${response.status}`);
          queue.shift();
          writeJson(pendingKey, queue);
        }
        await refresh();
        return true;
      } catch {
        remoteAvailable = false;
        emit();
        return false;
      } finally {
        syncing = false;
        syncPromise = null;
        emit();
      }
    })();

    return syncPromise;
  }

  async function request(path, options = {}) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), requestTimeout);
    try {
      return await window.fetch(`${supabaseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          apikey: publishableKey,
          ...(options.headers || {})
        }
      });
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function normalizeLocalEntry(entry) {
    if (!entry || typeof entry.name !== "string") return null;
    const name = sanitizeName(entry.name);
    const score = Number(entry.score);
    const timestamp = Number(entry.timestamp);
    if (!name || !Number.isInteger(score) || score < 0 || score > maxScore) return null;
    return { name, score, timestamp: Number.isFinite(timestamp) ? timestamp : Date.now() };
  }

  function normalizeRemoteEntry(entry) {
    if (!entry || typeof entry.nickname !== "string") return null;
    const name = sanitizeName(entry.nickname);
    const score = Number(entry.score);
    const timestamp = Date.parse(entry.created_at);
    if (!name || !Number.isInteger(score) || score < 0 || score > maxScore) return null;
    return { name, score, timestamp: Number.isFinite(timestamp) ? timestamp : Date.now() };
  }

  function sanitizeName(value) {
    return String(value).trim().replace(/[<>]/g, "").slice(0, 18);
  }

  function compareEntries(a, b) {
    return b.score - a.score || a.timestamp - b.timestamp;
  }

  function getPending() {
    const entries = readJson(pendingKey);
    if (!Array.isArray(entries)) return [];
    return entries.filter((entry) =>
      entry &&
      typeof entry.nickname === "string" &&
      Number.isInteger(entry.score) &&
      entry.score >= 0 &&
      entry.score <= maxScore &&
      isUuid(entry.submission_id)
    );
  }

  function readJson(key) {
    try {
      return JSON.parse(window.localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  }

  function writeJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be disabled; the active quiz still remains usable.
    }
  }

  function createUuid() {
    if (typeof window.crypto?.randomUUID === "function") return window.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((value) => value.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  function isUuid(value) {
    return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  window.BRAND_COLOR_BATTLE_SCORES = {
    enabled,
    init,
    subscribe,
    save,
    getEntries,
    getLocalEntries,
    getStatus,
    clearLocal,
    refresh,
    flush
  };
})();
