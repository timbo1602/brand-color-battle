const CACHE = "ctrl-create-arcade-v3";
const ASSETS = [
  "./", "./index.html", "./manifest.webmanifest",
  "./css/shared.css", "./css/components.css", "./css/game.css", "./css/hub.css",
  "./js/config.js", "./js/storage.js", "./js/audio.js", "./js/shared.js", "./js/hub.js", "./js/admin-preview.js",
  "./games/brand-color-battle/", "./games/brand-color-battle/index.html", "./games/brand-color-battle/dashboard.html",
  "./games/brand-color-battle/css/style.css", "./games/brand-color-battle/css/dashboard.css",
  "./games/brand-color-battle/js/config.js", "./games/brand-color-battle/js/questions.js", "./games/brand-color-battle/js/supabase.js", "./games/brand-color-battle/js/app.js", "./games/brand-color-battle/js/dashboard.js", "./games/brand-color-battle/js/arcade-integration.js", "./games/brand-color-battle/assets/congratulations-chameleon.webp",
  "./games/pub-quiz/", "./games/pub-quiz/index.html", "./games/pub-quiz/pub-quiz.css", "./games/pub-quiz/pub-quiz.js", "./games/pub-quiz/data/questions.js",
  "./games/higher-lower/", "./games/higher-lower/index.html", "./games/higher-lower/higher-lower.css", "./games/higher-lower/higher-lower.js", "./games/higher-lower/data/items.js",
  "./games/satire-or-headline/", "./games/satire-or-headline/index.html", "./games/satire-or-headline/satire.css", "./games/satire-or-headline/satire.js", "./games/satire-or-headline/data/headlines.js",
  "./games/guess-the-year/", "./games/guess-the-year/index.html", "./games/guess-the-year/year.css", "./games/guess-the-year/year.js", "./games/guess-the-year/data/events.js",
  "./games/type-rush/", "./games/type-rush/index.html", "./games/type-rush/type-rush.css", "./games/type-rush/type-rush.js", "./games/type-rush/data/lessons.js",
  "./games/js-quest/", "./games/js-quest/index.html", "./games/js-quest/js-quest.css", "./games/js-quest/js-quest.js", "./games/js-quest/data/tasks.js",
  "./games/impostor/", "./games/impostor/index.html", "./games/impostor/impostor.css", "./games/impostor/impostor.js", "./games/impostor/data/categories.js",
  "./games/geo-sprint/", "./games/geo-sprint/index.html", "./games/geo-sprint/geo-sprint.css", "./games/geo-sprint/geo-sprint.js", "./games/geo-sprint/data/countries.js", "./games/geo-sprint/data/outlines.geojson",
  "./games/color-catch/", "./games/color-catch/index.html", "./games/color-catch/game.css", "./games/color-catch/game.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html"))));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); }
    return response;
  })));
});
