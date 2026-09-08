import assert from "node:assert/strict";
import test from "node:test";
import { addHistory, readiness, recordReview, selectQuestions, weakSkills } from "../apps/web/training-engine.js";

const questions = Array.from({ length: 10 }, (_, index) => ({ q: String(index), topic: index < 2 ? "Varsling" : "Annet" }));

test("feiltemaer prioriteres i målrettet repetisjon", () => {
  const selected = selectQuestions(questions, { stats: { misses: { Varsling: 5 } }, reviewQueue: [{ topic: "Varsling" }] }, "beginner", () => .5);
  assert.equal(selected.length, 5);
  assert.equal(selected[0].topic, "Varsling");
});

test("nivåene velger forskjellig antall spørsmål", () => {
  assert.equal(selectQuestions(questions, {}, "beginner", () => .5).length, 5);
  assert.equal(selectQuestions(questions, {}, "advanced", () => .5).length, 8);
});

test("repetisjonskø og historikk holdes lokal og avgrenset", () => {
  const queue = recordReview({}, "A – Luftvei", false, "2026-09-08");
  assert.deepEqual(queue, [{ topic: "A – Luftvei", due: "2026-09-08", interval: 1 }]);
  let progress = { history: [] };
  for (let index = 0; index < 35; index += 1) progress.history = addHistory(progress, "Quiz", index, "2026-09-08");
  assert.equal(progress.history.length, 30);
});

test("forberedelsesgrad og konkrete svakheter beregnes", () => {
  const progress = { learned: ["X", "A", "B", "C", "D", "E"], stats: { answers: 10, correct: 8, quizRuns: 3, kforRuns: 2, misses: { "Egensikkerhet og varsling": 3 } } };
  assert.ok(readiness(progress).score > 50);
  assert.match(weakSkills(progress)[0].label, /Egensikkerhet/);
});
