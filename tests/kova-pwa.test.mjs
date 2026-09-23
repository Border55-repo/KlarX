import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

test("KOVA PWA JavaScript has valid syntax", () => {
  const result = spawnSync(process.execPath, ["--check", "apps/kova/app.js"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("KOVA PWA manifest is installable and scoped", async () => {
  const manifest = JSON.parse(await readFile("apps/kova/manifest.webmanifest", "utf8"));
  assert.equal(manifest.name, "KOVA Companion");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0);
});

test("KOVA PWA contains core mobile actions", async () => {
  const html = await readFile("apps/kova/index.html", "utf8");
  for (const text of ["Fulgte", "Legg i kalender", "Del aktivitet", "Logg inn / Åpne KOVA"]) {
    assert.ok(html.includes(text), "Missing UI text: " + text);
  }
});


test("KOVA PWA auto-repairs an existing push subscription on startup", async () => {
  const app = await readFile("apps/kova/app.js", "utf8");
  assert.ok(app.includes("async function repairPushRegistration"));
  assert.ok(app.includes("await repairPushRegistration();"));
});


test("KOVA PWA uses the official Firebase Web SDK for subscription storage", async () => {
  const app = await readFile("apps/kova/app.js", "utf8");
  assert.ok(app.includes("firebase-firestore.js"));
  assert.ok(app.includes("firebase.setDoc"));
  assert.ok(!app.includes("documents:commit"));
});


test("KOVA PWA repairs push when returning to foreground", async () => {
  const app = await readFile("apps/kova/app.js", "utf8");
  assert.ok(app.includes('window.addEventListener("focus",refreshOnForeground)'));
  assert.ok(app.includes('registration.update()'));
  assert.ok(app.includes('controllerchange'));
});


test("KOVA PWA cache-busts fresh KOVA data requests", async () => {
  const app = await readFile("apps/kova/app.js", "utf8");
  assert.ok(app.includes("ts=1790163677805") || app.includes("Date.now()"));
  assert.ok(app.includes('cache:"no-store"'));
});


test("KOVA PWA shows project owner information", async () => {
  const html = await readFile("apps/kova/index.html", "utf8");
  assert.ok(html.includes("Prosjekteier: Julian Nordli"));
  assert.ok(html.includes("ikke en offisiell Røde Kors-app"));
});


test("KOVA PWA has an everyday dashboard for upcoming shifts", async () => {
  const html = await readFile("apps/kova/index.html", "utf8");
  const app = await readFile("apps/kova/app.js", "utf8");
  for (const text of ["Neste vakt", "Denne uka", "Senere", "Mine vakter"]) {
    assert.ok(html.includes(text), "Missing everyday UI text: " + text);
  }
  assert.ok(app.includes("renderEverydayDashboard"));
  assert.ok(app.includes("5*60*1000"));
});


test("KOVA PWA supports remote admin cache generation", async () => {
  const html = await readFile("apps/kova/index.html", "utf8");
  const app = await readFile("apps/kova/app.js", "utf8");
  assert.ok(html.includes('href="./admin/"'));
  assert.ok(app.includes("checkRemoteCacheEpoch"));
  assert.ok(app.includes('"publicConfig","pwa"'));
  assert.ok(app.includes("caches.keys()"));
});


test("KOVA Admin JavaScript has valid syntax", () => {
  const result = spawnSync(process.execPath, ["--check", "apps/kova/admin/app.js"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("KOVA Admin contains secure first-login and cache controls", async () => {
  const html = await readFile("apps/kova/admin/index.html", "utf8");
  const app = await readFile("apps/kova/admin/app.js", "utf8");
  assert.ok(html.includes("Superuser"));
  assert.ok(html.includes("Bytt midlertidig passord"));
  assert.ok(html.includes("Publiser ny PWA-cache"));
  assert.ok(app.includes("updatePassword"));
  assert.ok(app.includes("mustChangePassword"));
  assert.ok(app.includes('"publicConfig","pwa"'));
});


test("KOVA Admin has live health and Bridge sync request", async () => {
  const html = await readFile("apps/kova/admin/index.html", "utf8");
  const app = await readFile("apps/kova/admin/app.js", "utf8");
  assert.ok(html.includes("Systemhelse"));
  assert.ok(html.includes("Be om Bridge-synk"));
  assert.ok(app.includes('"adminRuntime","bridge"'));
  assert.ok(app.includes('"adminCommands","bridgeSync"'));
  assert.ok(app.includes("organizationChecks"));
  assert.ok(app.includes("age>35"));
});


test("KOVA PWA keeps a network-first offline fallback for Bridge data", async () => {
  const sw = await readFile("apps/kova/sw.js", "utf8");
  assert.ok(sw.includes('url.hostname==="raw.githubusercontent.com"'));
  assert.ok(sw.includes('/bridge/data/'));
  assert.ok(sw.includes('fetch(event.request)'));
  assert.ok(sw.includes('caches.match(event.request)'));
});

test("KOVA PWA calendar export builds a valid local ICS event", async () => {
  const app = await readFile("apps/kova/app.js", "utf8");
  assert.ok(app.includes('BEGIN:VCALENDAR'));
  assert.ok(app.includes('BEGIN:VEVENT'));
  assert.ok(app.includes('DTSTART'));
  assert.ok(app.includes('DTEND'));
  assert.ok(app.includes('SUMMARY:'));
  assert.ok(app.includes('text/calendar'));
  assert.ok(app.includes('navigator.canShare'));
});

test("KOVA Admin live Bridge sync status auto-refreshes while running", async () => {
  const app = await readFile("apps/kova/admin/app.js", "utf8");
  assert.ok(app.includes('bridgeCommandView'));
  assert.ok(app.includes('scheduleDashboardRefresh'));
  assert.ok(app.includes('active?10000:60000'));
  assert.ok(app.includes('command?.status'));
});
