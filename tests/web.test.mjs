import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (name) => readFile(new URL(`../apps/web/${name}`, import.meta.url), "utf8");

test("webappen har norsk språk, mobilvisning og tilgjengelig hovedinnhold", async () => {
  const html = await read("index.html");
  assert.match(html, /<html lang="nb"/);
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
  assert.match(app, /Giftinformasjonen/);
  assert.match(app, /Oppfølging av førstehjelpere/);
  assert.match(app, /Bli KFØR-klar/);
  assert.match(app, /Instruktørmodus/);
  assert.match(app, /Rekkefølgejakten/);
  assert.match(app, /Hvor kommer spørsmålene fra/);
  assert.match(app, /september 2025/);
  assert.match(app, /versjon 2\.0/);
  assert.match(app, /Min veileder/);
  assert.match(app, /HLR-metronom/);
  assert.match(app, /100–120/);
  assert.match(app, /Rask støtte/);
  assert.match(app, /Ring 113/);
  assert.match(app, /Bare til trening/);
});

test("spørsmålsbanken gir varierte femspørsmålsrunder", async () => {
  const app = await read("app.js");
  assert.ok((app.match(/\{ q: /g) || []).length >= 40);
  assert.match(app, /selectQuestions/);
});

test("appen har nye treningsformer uten eksamensmodus", async () => {
  const [app, data, engine] = await Promise.all([read("app.js"), read("training-data.js"), read("training-engine.js")]);
  assert.match(app, /Praktisk scenario/);
  assert.match(app, /Finn feilen/);
  assert.match(app, /Øv to sammen/);
  assert.match(app, /Min utvikling/);
  assert.match(app, /Felles vurdering/);
  assert.match(app, /hemmelig markørinformasjon/i);
  assert.match(engine, /Nybegynner/);
  assert.match(engine, /Viderekommen/);
  assert.doesNotMatch(`${app}${data}${engine}`, /eksamensmodus/i);
});

test("appen har installasjon og anonym besøksmåling", async () => {
  const [html, manifest] = await Promise.all([read("index.html"), read("manifest.webmanifest")]);
  assert.match(html, /apple-touch-icon/);
  const app = await read("app.js");
  assert.match(app, /stats4u\.net/);
  assert.equal(JSON.parse(manifest).display, "standalone");
  assert.equal(JSON.parse(manifest).icons.length, 3);
});

test("PWA-en cacher alle nødvendige lokale ressurser", async () => {
  const [worker, app, status] = await Promise.all([read("sw.js"), read("app.js"), read("status.json")]);
  for (const asset of ["index.html", "styles.css", "app.js", "progress.js", "training-engine.js", "training-data.js", "manifest.webmanifest", "status.json", "icon.svg", "icon-192.png", "icon-512.png", "icon-maskable-512.png"]) assert.match(worker, new RegExp(asset.replace(".", "\\.")));
  assert.match(worker, /fetch\(event\.request\)/);
  assert.match(app, /Hent siste versjon/);
  assert.match(app, /registration\.update/);
  assert.equal(JSON.parse(status).version, "0.4.0");
  assert.equal(JSON.parse(status).status, "operational");
});
