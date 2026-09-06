export const EMPTY_PROGRESS = Object.freeze({ learned: [], best: 0, kforBest: 0, streak: 0, lastDay: "" });

export function createProgressStore(storage, key = "klarx-progress-v1") {
  return {
    read() {
      try {
        const saved = JSON.parse(storage.getItem(key) || "{}");
        return { ...EMPTY_PROGRESS, ...saved, learned: Array.isArray(saved.learned) ? saved.learned : [] };
      } catch {
        return { ...EMPTY_PROGRESS, learned: [] };
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
