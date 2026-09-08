export const LEVELS = Object.freeze({
  beginner: { label: "Nybegynner", questionCount: 5, hint: true },
  advanced: { label: "Viderekommen", questionCount: 8, hint: false }
});

export function shuffled(items, random = Math.random) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function selectQuestions(items, progress, level = "beginner", random = Math.random) {
  const misses = progress?.stats?.misses || {};
  const due = progress?.reviewQueue || [];
  const score = (item) => {
    const topic = item.topic || "KFØR-grunnlag";
    const queued = due.filter((entry) => entry.topic === topic).length;
    return (misses[topic] || 0) * 3 + queued * 5 + random();
  };
  const count = LEVELS[level]?.questionCount || LEVELS.beginner.questionCount;
  return [...items].sort((a, b) => score(b) - score(a)).slice(0, Math.min(count, items.length));
}

export function recordReview(progress, topic, correct, date = new Date().toISOString().slice(0, 10)) {
  const queue = Array.isArray(progress.reviewQueue) ? [...progress.reviewQueue] : [];
  const filtered = queue.filter((entry) => entry.topic !== topic);
  if (!correct) filtered.push({ topic, due: date, interval: 1 });
  else {
    const previous = queue.find((entry) => entry.topic === topic);
    if (previous) filtered.push({ topic, due: date, interval: Math.min((previous.interval || 1) * 2, 14) });
  }
  return filtered;
}

export function readiness(progress) {
  const stats = progress?.stats || {};
  const accuracy = stats.answers ? Math.round((stats.correct / stats.answers) * 100) : 0;
  const learned = Array.isArray(progress?.learned) ? progress.learned.length : 0;
  const rounds = (stats.quizRuns || 0) + (stats.kforRuns || 0);
  const score = Math.round(Math.min(100, learned * 8 + Math.min(rounds, 8) * 4 + accuracy * .4));
  return { score, accuracy, rounds, learned, label: score >= 80 ? "Godt forberedt" : score >= 50 ? "På god vei" : "Bygger grunnlaget" };
}

export function addHistory(progress, activity, score = null, date = new Date().toISOString().slice(0, 10)) {
  const history = Array.isArray(progress.history) ? [...progress.history] : [];
  history.push({ date, activity, score });
  return history.slice(-30);
}

export function weakSkills(progress) {
  const misses = Object.entries(progress?.stats?.misses || {}).sort((a, b) => b[1] - a[1]);
  const patterns = [];
  for (const [topic, count] of misses.slice(0, 3)) {
    const label = /sikkerhet/i.test(topic) ? "Egensikkerhet må komme tidligere"
      : /varsling/i.test(topic) ? "Varsling bør skje tidligere"
      : /normal/i.test(topic) ? "Normalverdiene bør repeteres"
      : /hypotermi|topp til tå/i.test(topic) ? "Husk hypotermiforebygging gjennom hele undersøkelsen"
      : `${topic} bør repeteres`;
    patterns.push({ topic, count, label });
  }
  return patterns;
}
