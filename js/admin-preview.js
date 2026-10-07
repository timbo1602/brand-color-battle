(() => {
  "use strict";
  const config = window.ARCADE_CONFIG;
  const storage = window.ArcadeStorage;
  const dialog = document.getElementById("admin-dialog");
  if (!config?.adminPreviewEnabled || !dialog) {
    document.querySelectorAll("[data-admin-open]").forEach((button) => { button.hidden = true; });
    return;
  }

  const form = document.getElementById("admin-form");
  const input = document.getElementById("admin-code");
  const message = document.getElementById("admin-message");
  const submit = document.getElementById("admin-submit");
  let attempts = 0;
  let lockUntil = 0;
  let lockTimer = 0;

  async function hash(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function showMessage(text, error = false) {
    message.textContent = text;
    message.classList.toggle("is-error", error);
  }

  function updateLock() {
    const seconds = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
    if (!seconds) {
      window.clearInterval(lockTimer);
      lockTimer = 0;
      submit.disabled = false;
      input.disabled = false;
      attempts = 0;
      showMessage("Du kannst es jetzt erneut versuchen.");
      input.focus();
      return;
    }
    showMessage(`Zu viele Versuche. Bitte ${seconds} Sekunden warten.`, true);
  }

  function openDialog() {
    form.reset();
    showMessage("Der Zugang gilt nur für diese Browsersitzung.");
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
    input.focus();
  }

  function closeDialog() {
    if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
  }

  async function submitCode(event) {
    event.preventDefault();
    if (Date.now() < lockUntil) return;
    const value = input.value.trim().slice(0, 64);
    submit.disabled = true;
    try {
      const digest = await hash(value);
      if (digest === config.adminCodeHash) {
        storage.sessionWrite("admin-preview", "active");
        attempts = 0;
        window.ArcadeAudio?.play("admin");
        showMessage("Admin Preview ist aktiv.");
        window.setTimeout(() => window.location.reload(), 420);
        return;
      }
      attempts += 1;
      input.value = "";
      if (attempts >= 5) {
        lockUntil = Date.now() + 30000;
        submit.disabled = true;
        input.disabled = true;
        updateLock();
        lockTimer = window.setInterval(updateLock, 500);
      } else {
        submit.disabled = false;
        showMessage(`Code nicht erkannt. Noch ${5 - attempts} Versuche.`, true);
        input.focus();
      }
    } catch {
      submit.disabled = false;
      showMessage("Die sichere Codeprüfung ist in diesem Browser nicht verfügbar.", true);
    }
  }

  document.querySelectorAll("[data-admin-open]").forEach((button) => button.addEventListener("click", openDialog));
  document.querySelectorAll("[data-admin-logout]").forEach((button) => button.addEventListener("click", () => {
    storage.sessionRemove("admin-preview");
    window.location.reload();
  }));
  document.getElementById("admin-close")?.addEventListener("click", closeDialog);
  form.addEventListener("submit", submitCode);
  dialog.addEventListener("cancel", () => { form.reset(); });
})();
