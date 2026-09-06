export const EMPTY_PROGRESS = Object.freeze({
  name: "",
  learned: [],
  best: 0,
  kforBest: 0,
  streak: 0,
  lastDay: "",
  stats: { answers: 0, correct: 0, quizRuns: 0, kforRuns: 0, misses: {} }
});

export function getCoachPlan(progress) {
  const stats = { ...EMPTY_PROGRESS.stats, ...(progress.stats || {}), misses: { ...(progress.stats?.misses || {}) } };
  const learned = Array.isArray(progress.learned) ? progress.learned : [];
  const accuracy = stats.answers ? Math.round((stats.correct / stats.answers) * 100) : 0;
  const weakTopic = Object.entries(stats.misses).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

  if (learned.length < 6) {
    const next = ["X", "A", "B", "C", "D", "E"].find((letter) => !learned.includes(letter));
    return { accuracy, weakTopic, title: `Start med ${next}`, reason: "Ta én bokstav om gangen før du tester hele kjeden.", href: "#learn", action: `Øv på ${next}` };
  }
  if (stats.answers < 5) return { accuracy, weakTopic, title: "Gi veilederen litt data", reason: "Fullfør én kort runde. Da kan rådene tilpasses svarene dine.", href: "#play", action: "Ta 5 spørsmål" };
  if (weakTopic === "HLR og hjertestarter") return { accuracy, weakTopic, title: "Øv HLR-takten", reason: "Svarene dine viser at HLR bør friskes opp. Bruk metronomen og ta deretter en ny scenario-runde.", href: "#metronome", action: "Åpne HLR-metronom" };
  if (weakTopic) return { accuracy, weakTopic, title: `Prioriter ${weakTopic}`, reason: "Dette er temaet du oftest har svart feil på. En ny scenario-runde vil gi flere forklaringer.", href: "#kfor-game", action: "Start scenario-sprint" };
  if (accuracy < 80) return { accuracy, weakTopic, title: "Bygg trygghet med variasjon", reason: "Ta en ny tilfeldig runde og les forklaringen etter hvert svar.", href: "#kfor-game", action: "Ny KFØR-runde" };
  return { accuracy, weakTopic, title: "Vedlikehold ferdighetene", reason: "Du har god kontroll. Bytt mellom scenarioer, rekkefølge og HLR-takt for å holde kunnskapen fersk.", href: "#sequence", action: "Ta rekkefølgejakten" };
}

export function createProgressStore(storage, key = "klarx-progress-v1") {
  return {
    read() {
      try {
        const saved = JSON.parse(storage.getItem(key) || "{}");
        return {
          ...EMPTY_PROGRESS,
          ...saved,
          learned: Array.isArray(saved.learned) ? saved.learned : [],
          stats: { ...EMPTY_PROGRESS.stats, ...(saved.stats || {}), misses: { ...(saved.stats?.misses || {}) } }
        };
      } catch {
        return { ...EMPTY_PROGRESS, learned: [], stats: { ...EMPTY_PROGRESS.stats, misses: {} } };
      }
    },
    write(progress) {
      storage.setItem(key, JSON.stringify(progress));
      return this.read();
    },
    clear() {
      storage.removeItem(key);
      return this.read();
    }
  };
}
