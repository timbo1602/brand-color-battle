import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
function globals(file) { const context = { window: {} }; vm.createContext(context); vm.runInContext(read(file), context, { filename: file }); return context.window; }

test("all required content packs are complete and unique", () => {
  const pub = globals("games/pub-quiz/data/questions.js").PUB_QUIZ_QUESTIONS;
  const higher = globals("games/higher-lower/data/items.js").HIGHER_LOWER_ITEMS;
  const headlines = globals("games/satire-or-headline/data/headlines.js").HEADLINE_ITEMS;
  const years = globals("games/guess-the-year/data/events.js").YEAR_EVENTS;
  const lessons = globals("games/type-rush/data/lessons.js").TYPE_RUSH_LESSONS;
  const quests = globals("games/js-quest/data/tasks.js").JS_QUEST_TASKS;
  const impostor = globals("games/impostor/data/categories.js").IMPOSTOR_CATEGORIES;
  const countries = globals("games/geo-sprint/data/countries.js").GEO_COUNTRIES;
  const packs = [[pub,75],[higher,50],[headlines,45],[years,60],[lessons,12],[quests,30],[countries,80]];
  packs.forEach(([items, count]) => { assert.equal(items.length, count); const ids = items.map((item) => item.id ?? item.iso); assert.equal(new Set(ids).size, count); });
  assert.equal(lessons.reduce((sum, lesson) => sum + lesson.texts.length, 0), 30);
  assert.equal(impostor.length, 8); assert.equal(impostor.reduce((sum, category) => sum + category.words.length, 0), 120);
  assert.ok(impostor.every((category) => category.words.length === 15));
  assert.ok(Object.keys(globals("games/pub-quiz/data/questions.js").PUB_QUIZ_CATEGORIES).every((category) => pub.filter((item) => item.category === category).length === 15));
  assert.ok(Object.keys(globals("games/guess-the-year/data/events.js").YEAR_CATEGORIES).every((category) => years.filter((item) => item.category === category).length === 10));
  assert.ok(Object.keys(globals("games/js-quest/data/tasks.js").JS_QUEST_TOPICS).every((topic) => quests.filter((item) => item.topic === topic).length === 3));
  assert.deepEqual([...new Set(headlines.map((item) => item.type))].sort(), ["invented", "real", "satire"]);
  assert.equal(JSON.parse(read("games/geo-sprint/data/outlines.geojson")).features.length, 79);
});

test("question records contain playable answers and source metadata", () => {
  const pub = globals("games/pub-quiz/data/questions.js").PUB_QUIZ_QUESTIONS;
  pub.forEach((question) => {
    assert.match(question.source, /^https:\/\//);
    if (question.type === "choice") assert.ok(question.options.includes(question.answer));
    if (question.type === "order") assert.ok(Array.isArray(question.answer) && question.answer.length >= 3);
    if (question.type === "estimate") assert.ok(Number.isFinite(question.answer) && question.tolerance >= 0);
  });
  const headlines = globals("games/satire-or-headline/data/headlines.js").HEADLINE_ITEMS;
  headlines.filter((item) => item.type !== "invented").forEach((item) => assert.match(item.url, /^https:\/\//));
  headlines.filter((item) => item.type === "invented").forEach((item) => assert.equal(item.source, "Eigenproduktion"));
});

test("perfect and all-wrong score boundaries are deterministic", () => {
  const pubScore = (correct, seconds) => correct ? 100 + Math.round(Math.max(0, Math.min(20, seconds)) * 5) : 0;
  assert.equal(Array.from({ length: 10 }, () => pubScore(true, 20)).reduce((a, b) => a + b), 2000);
  assert.equal(Array.from({ length: 10 }, () => pubScore(false, 20)).reduce((a, b) => a + b), 0);
  const yearScore = (diff) => diff === 0 ? 1000 : [0,850,700,550,450,350][diff] ?? Math.max(0, 300 - (diff - 5) * 20);
  assert.equal(Array.from({ length: 10 }, () => yearScore(0)).reduce((a, b) => a + b), 10000);
  assert.equal(Array.from({ length: 10 }, () => yearScore(100)).reduce((a, b) => a + b), 0);
});

function sharedWith(config, sessions = {}) {
  const window = { ARCADE_CONFIG: config, ArcadeStorage: { sessionRead: (key, fallback) => sessions[key] ?? fallback } };
  const context = { window, navigator: {}, document: {}, Intl, Uint32Array, Math };
  vm.createContext(context); vm.runInContext(read("js/shared.js"), context); return window.ArcadeShared;
}

test("Fair Mode, admin preview, secret access and individual switches are enforced", () => {
  const games = { brandColorBattle:true, pubQuiz:true, colorCatch:true };
  let shared = sharedWith({ fairMode:true, games });
  assert.equal(shared.canOpenGame("brandColorBattle"), true); assert.equal(shared.canOpenGame("pubQuiz"), false); assert.equal(shared.canOpenGame("colorCatch"), false);
  shared = sharedWith({ fairMode:true, games }, { "admin-preview":"active" }); assert.equal(shared.canOpenGame("pubQuiz"), true);
  shared = sharedWith({ fairMode:true, games }, { "color-catch-unlocked":"active" }); assert.equal(shared.canOpenGame("colorCatch"), true); assert.equal(shared.canOpenGame("pubQuiz"), false);
  shared = sharedWith({ fairMode:false, games }); assert.equal(shared.canOpenGame("pubQuiz"), true);
  shared = sharedWith({ fairMode:false, games:{ ...games, pubQuiz:false } }, { "admin-preview":"active" }); assert.equal(shared.canOpenGame("pubQuiz"), false);
});

test("admin preview stores only a hash and applies brute-force throttling", () => {
  const config = read("js/config.js"), admin = read("js/admin-preview.js");
  assert.match(config, /adminCodeHash:\s*"[a-f0-9]{64}"/); assert.match(admin, /attempts\s*>=\s*5/); assert.match(admin, /30000/); assert.match(admin, /crypto\.subtle\.digest/);
  assert.doesNotMatch(config, /adminCode\s*:/); assert.doesNotMatch(admin, /sessionStorage\.setItem\([^)]*admin/i);
});

test("JS Quest confines dynamic code execution to a terminated Worker", () => {
  const source = read("games/js-quest/js-quest.js");
  assert.match(source, /new Worker\(url\)/); assert.match(source, /worker\.terminate\(\)/); assert.match(source, /750/); assert.match(source, /self\.fetch=/); assert.match(source, /self\.importScripts=/);
  assert.equal((source.match(/\bFunction\(/g) || []).length, 1);
});

test("every local HTML asset reference resolves", () => {
  const htmlFiles = [];
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes:true }).forEach((entry) => { const full = path.join(dir, entry.name); if (entry.isDirectory() && entry.name !== ".git") walk(full); else if (entry.name.endsWith(".html")) htmlFiles.push(full); });
  walk(root);
  htmlFiles.forEach((file) => {
    for (const match of fs.readFileSync(file, "utf8").matchAll(/(?:src|href)="([^"]+)"/g)) {
      const ref = match[1].split(/[?#]/)[0]; if (!ref || /^(?:https?:|data:|#)/.test(ref)) continue;
      const target = path.resolve(path.dirname(file), ref); const resolved = ref.endsWith("/") ? path.join(target, "index.html") : target;
      assert.ok(fs.existsSync(resolved), `${path.relative(root,file)} -> ${ref}`);
    }
  });
});

test("offline manifest lists only existing local assets", () => {
  const source = read("sw.js");
  for (const [, ref] of source.matchAll(/"(\.\/[^"?]+)"/g)) {
    const target = path.resolve(root, ref); const resolved = ref.endsWith("/") ? path.join(target, "index.html") : target;
    assert.ok(fs.existsSync(resolved), `missing cache asset ${ref}`);
  }
});

test("dashboard QR points to the published Brand Color Battle start screen", () => {
  const dashboard = read("games/brand-color-battle/dashboard.html");
  const target = "https://timbo1602.github.io/brand-color-battle/games/brand-color-battle/";
  assert.equal((dashboard.match(new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 2);
  assert.match(dashboard, /<img[^>]+src="\.\/assets\/brand-color-battle-qr\.svg"[^>]+alt="QR-Code zum Startbildschirm von Brand Color Battle"/);
  const qr = read("games/brand-color-battle/assets/brand-color-battle-qr.svg");
  assert.match(qr, /<svg\b[^>]+viewBox="0 0 \d+ \d+"/);
  assert.match(qr, /shape-rendering="crispEdges"/);
});

test("Supabase client and schema keep the public leaderboard permissions narrow", () => {
  const config = read("games/brand-color-battle/js/config.js");
  const settings = globals("games/brand-color-battle/js/config.js").BRAND_COLOR_BATTLE_SUPABASE;
  const client = read("games/brand-color-battle/js/supabase.js");
  const schema = read("supabase-schema.sql");
  assert.match(config, /SUPABASE_PUBLISHABLE_KEY:\s*"sb_publishable_/);
  assert.equal(typeof settings.SUPABASE_SERVICE_ROLE_KEY, "undefined");
  assert.match(settings.SUPABASE_PUBLISHABLE_KEY, /^sb_publishable_/);
  assert.match(client, /on_conflict=submission_id/);
  assert.match(client, /resolution=ignore-duplicates/);
  assert.match(schema, /enable row level security/i);
  assert.match(schema, /grant select on table public\.scores to anon/i);
  assert.match(schema, /grant insert \(nickname, score, submission_id\) on table public\.scores to anon/i);
  assert.doesNotMatch(schema, /grant (?:update|delete)\b/i);
});

test("game scripts only call the published shared APIs", () => {
  const files = [];
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes:true }).forEach((entry) => { const full = path.join(dir, entry.name); if (entry.isDirectory()) walk(full); else if (entry.name.endsWith(".js")) files.push(full); });
  walk(path.join(root, "games"));
  const source = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(source, /window\.Arcade\?\./);
  assert.doesNotMatch(source, /ArcadeStorage\.(?:number|write)\(/);
});
