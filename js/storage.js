(() => {
  "use strict";
  const prefix = "ctrl-create-arcade:";

  function key(name) { return `${prefix}${name}`; }

  function readRaw(name, fallback = null) {
    try { return window.localStorage.getItem(key(name)) ?? fallback; } catch { return fallback; }
  }

  function writeRaw(name, value) {
    try { window.localStorage.setItem(key(name), String(value)); return true; } catch { return false; }
  }

  function remove(name) {
    try { window.localStorage.removeItem(key(name)); } catch { /* Storage may be blocked. */ }
  }

  function readJSON(name, fallback, validate = () => true) {
    try {
      const raw = window.localStorage.getItem(key(name));
      if (raw === null) return fallback;
      const value = JSON.parse(raw);
      if (!validate(value)) throw new Error("Invalid stored data");
      return value;
    } catch {
      remove(name);
      return fallback;
    }
  }

  function writeJSON(name, value) { return writeRaw(name, JSON.stringify(value)); }

  function readNumber(name, fallback = 0, options = {}) {
    const raw = readRaw(name, null);
    if (raw === null || String(raw).trim() === "") return fallback;
    const value = Number(raw);
    const min = Number.isFinite(options.min) ? options.min : -Infinity;
    const max = Number.isFinite(options.max) ? options.max : Infinity;
    if (!Number.isFinite(value) || value < min || value > max) {
      remove(name);
      return fallback;
    }
    return value;
  }

  function sessionRead(name, fallback = null) {
    try { return window.sessionStorage.getItem(key(name)) ?? fallback; } catch { return fallback; }
  }

  function sessionWrite(name, value) {
    try { window.sessionStorage.setItem(key(name), String(value)); return true; } catch { return false; }
  }

  function sessionRemove(name) {
    try { window.sessionStorage.removeItem(key(name)); } catch { /* Storage may be blocked. */ }
  }

  window.ArcadeStorage = Object.freeze({
    prefix,
    readRaw,
    writeRaw,
    readJSON,
    writeJSON,
    readNumber,
    remove,
    sessionRead,
    sessionWrite,
    sessionRemove
  });
})();
