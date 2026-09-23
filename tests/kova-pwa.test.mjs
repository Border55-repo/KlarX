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
