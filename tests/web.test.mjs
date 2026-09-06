import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (name) => readFile(new URL(`../apps/web/${name}`, import.meta.url), "utf8");

test("webappen har norsk språk, mobilvisning og tilgjengelig hovedinnhold", async () => {
  const html = await read("index.html");
  assert.match(html, /<html lang="nb">/);
  assert.match(html, /width=device-width/);
  assert.match(html, /<main id="main"/);
  assert.match(html, /aria-label="Hovedmeny"/);
});

test("appen har tiltak, varsling og trygg ansvarsfraskrivelse", async () => {
  const app = await read("app.js");
  for (const letter of ["X", "A", "B", "C", "D", "E"]) assert.match(app, new RegExp(`letter: "${letter}"`));
  assert.match(app, /1-1-3/);
  assert.match(app, /erstatter ikke kurs/);
  assert.match(app, /PIKSIB/);
  assert.match(app, /Normalverdier/);
});

test("PWA-en cacher alle nødvendige lokale ressurser", async () => {
  const worker = await read("sw.js");
  for (const asset of ["index.html", "styles.css", "app.js", "progress.js", "manifest.webmanifest", "icon.svg"]) assert.match(worker, new RegExp(asset.replace(".", "\\.")));
});
