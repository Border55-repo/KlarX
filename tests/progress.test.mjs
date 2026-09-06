import assert from "node:assert/strict";
import test from "node:test";
import { createProgressStore, getCoachPlan } from "../apps/web/progress.js";

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key)
  };
}

test("fremdrift kan opprettes, gjenåpnes, oppdateres og slettes", () => {
  const storage = memoryStorage();
  const first = createProgressStore(storage);
  assert.deepEqual(first.read().learned, []);

  first.write({ learned: ["X"], best: 2, streak: 1, lastDay: "2026-09-06" });
  const reopened = createProgressStore(storage);
  assert.deepEqual(reopened.read().learned, ["X"]);

  reopened.write({ ...reopened.read(), learned: ["X", "A"], best: 4 });
  assert.equal(reopened.read().best, 4);
  assert.deepEqual(reopened.read().learned, ["X", "A"]);

  reopened.clear();
  assert.deepEqual(reopened.read().learned, []);
});

test("ødelagt lokal lagring gir trygg tomtilstand", () => {
  const storage = memoryStorage();
  storage.setItem("klarx-progress-v1", "ikke-json");
  assert.deepEqual(createProgressStore(storage).read().learned, []);
});

test("eldre fremdrift får ny personlig statistikk uten å miste data", () => {
  const storage = memoryStorage();
  storage.setItem("klarx-progress-v1", JSON.stringify({ learned: ["X"], best: 3 }));
  const state = createProgressStore(storage).read();
  assert.deepEqual(state.learned, ["X"]);
  assert.equal(state.stats.answers, 0);
  assert.deepEqual(state.stats.misses, {});
});

test("veilederen prioriterer neste bokstav og et svakt HLR-tema", () => {
  const beginner = getCoachPlan({ learned: ["X", "A"], stats: {} });
  assert.equal(beginner.title, "Start med B");
  assert.equal(beginner.href, "#learn");

  const hlr = getCoachPlan({
    learned: ["X", "A", "B", "C", "D", "E"],
    stats: { answers: 10, correct: 6, misses: { "HLR og hjertestarter": 3, "A – Luftvei": 1 } }
  });
  assert.equal(hlr.weakTopic, "HLR og hjertestarter");
  assert.equal(hlr.href, "#metronome");
  assert.equal(hlr.accuracy, 60);
});
