import { createProgressStore } from "./progress.js";

const lessons = [
  { letter: "X", title: "Egensikkerhet", cue: "Se faren først", points: ["Sørg for egen sikkerhet og få oversikt.", "Stans livstruende stor blødning med én gang.", "Forebygg hypotermi – beskytt personen mot kulde, vind og vått underlag."] },
  { letter: "A", title: "Luftveier", cue: "Åpne og se", points: ["Etabler fri luftvei med hakeløft eller kjeveløft.", "Se etter fremmedlegeme.", "Ved luftveishinder: oppfordre til hoste. Bruk ryggslag eller bukstøt når det er nødvendig, og vær obs på brekningsrefleks."] },
  { letter: "B", title: "Respirasjon", cue: "Se, lytt, kjenn", points: ["Spør om pustebesvær, tell pustefrekvens og undersøk brystkassen.", "Berolige og vurder sittende stilling. Bevisstløs med normal pust legges i sideleie.", "Bevisstløs og unormal pust: varsle 1-1-3 og start HLR."] },
  { letter: "C", title: "Sirkulasjon", cue: "Blek, kald, klam", points: ["Se etter tegn på sirkulasjonssvikt: blek, kald og klam hud.", "Kontroller blødning. La personen ligge med beina flatt.", "Tell puls, undersøk mage og lår, kontroller kapillærfylling og husk hypotermi. Vurder rask transport i samråd med AMK."] },
  { letter: "D", title: "Bevissthet", cue: "Reaksjon og FAST", points: ["Undersøk bevissthetsnivå med ACVPU.", "Gjør en grov nevrologisk undersøkelse. Kjenn på kinn, arm og bein på begge sider og sammenlign.", "Ved mistanke om hjerneslag: gjennomfør FAST-undersøkelse."] },
  { letter: "E", title: "Avdekke", cue: "Finn mer – hold varm", points: ["Sjekk ekstremiteter og avdekk i forhold til funn.", "Undersøk hode, nakke og rygg der det passer best.", "Forebygg hypotermi og start aktiv varming når det er mulig."] }
];

const piksib = [
  ["P", "Planlegge"], ["I", "Iverksette"], ["K", "Kontrollere"],
  ["S", "Støtte"], ["I", "Informere"], ["B", "Bedømme"]
];

const normalValues = [
  ["Nyfødt < 1 mnd", "40–55", "100–160"],
  ["> 1–13 mnd", "35–45", "100–160"],
  ["13 mnd–4 år", "25–35", "90–130"],
  ["4–7 år", "20–24", "70–120"],
  ["7–13 år", "19–22", "70–110"],
  ["13–18 år", "14–19", "55–95"],
  ["> 18 år", "12–18", "51–80"]
];

const questions = [
  { q: "Hva kommer først i XABCDE?", options: ["Egen sikkerhet og stor blødning", "Puls", "FAST", "Avdekking"], answer: 0, why: "X minner deg på egensikkerhet, livstruende stor blødning og hypotermi." },
  { q: "En person er bevisstløs og puster normalt. Hva gjør du?", options: ["Gir mat", "Legger i sideleie og overvåker pusten", "Lar personen ligge alene", "Starter bukstøt"], answer: 1, why: "Sideleie holder luftveien fri. Kontroller pusten ofte og ring 1-1-3." },
  { q: "Bevisstløs og unormal pust betyr …", options: ["Vent fem minutter", "Sittende stilling", "Varsle 1-1-3 og start HLR", "Bare hold personen varm"], answer: 2, why: "Unormal pust hos en bevisstløs person skal behandles som hjertestans." },
  { q: "Hvilken bokstav handler om luftveier?", options: ["X", "A", "C", "E"], answer: 1, why: "A står for Airway – luftveier." },
  { q: "Blek, kald og klam hud kan være tegn på …", options: ["Sirkulasjonssvikt", "Normal pust", "God oppvarming", "Fri luftvei"], answer: 0, why: "Dette er tegn som undersøkes under C – sirkulasjon." },
  { q: "Hva bruker du ved mistanke om hjerneslag?", options: ["PIKSIB", "FAST", "HLR", "Kapillærfylling"], answer: 1, why: "FAST-undersøkelse brukes ved mistanke om hjerneslag." },
  { q: "Hva skal du huske gjennom hele undersøkelsen?", options: ["Å gi drikke", "Å flytte personen ofte", "Å forebygge hypotermi", "Å vente med å varsle"], answer: 2, why: "Kulde forverrer situasjonen. Beskytt mot varmetap tidlig og underveis." },
  { q: "Hva betyr K i PIKSIB?", options: ["Klargjøre", "Kontrollere", "Kjenne", "Kommunisere"], answer: 1, why: "PIKSIB: Planlegge, Iverksette, Kontrollere, Støtte, Informere, Bedømme." },
  { q: "Hva er normal respirasjonsfrekvens for voksne over 18 år på kortet?", options: ["6–10", "12–18", "25–35", "40–55"], answer: 1, why: "Kortet oppgir 12–18 pust per minutt for voksne over 18 år." },
  { q: "Hva hører til under E?", options: ["Avdekke og undersøke", "Bare telle puls", "Kun åpne luftveien", "Kun FAST"], answer: 0, why: "E handler om å avdekke i forhold til funn og undersøke videre, samtidig som du forebygger hypotermi." },
  { q: "Hvilket nummer ringer du ved fare for liv?", options: ["110", "112", "113", "116 117"], answer: 2, why: "Ring medisinsk nødnummer 1-1-3 ved fare for liv." },
  { q: "Hva gjør du ved pustebesvær hos en bevisst person?", options: ["Beroliger og vurderer sittende stilling", "Legger alltid flatt", "Starter HLR", "Gir bukstøt uten å undersøke"], answer: 0, why: "Under B: berolige, tell pust, undersøk brystkassen og vurder sittende stilling." }
];

const STORAGE_KEY = "klarx-progress-v1";
const AUDIO_KEY = "klarx-audio-v1";
const progressStore = createProgressStore(localStorage, STORAGE_KEY);
let state = progressStore.read();
let currentLesson = 0;
let quiz = null;

function saveProgress() {
  progressStore.write(state);
}

function today() { return new Date().toISOString().slice(0, 10); }

function registerActivity() {
  if (state.lastDay === today()) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  state.streak = state.lastDay === yesterday ? state.streak + 1 : 1;
  state.lastDay = today();
  saveProgress();
}

function speak(text) {
  if (!("speechSynthesis" in window)) return showToast("Opplesning støttes ikke i denne nettleseren.");
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/1-1-3/g, "en en tre"));
  utterance.lang = "nb-NO";
  utterance.rate = .88;
  speechSynthesis.speak(utterance);
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function header(title, eyebrow = "KlarX") {
  return `<p class="eyebrow">${eyebrow}</p><h1>${title}</h1>`;
}

function homeView() {
  const percent = Math.round((state.learned.length / lessons.length) * 100);
  return `
    <section class="hero-card">
      <div class="streak">⚡ ${state.streak || 0} dagers øvingsrekke</div>
      <p class="eyebrow">Dagens miniøkt</p>
      <h1>Bli klar når det gjelder.</h1>
      <p>Korte runder. Store knapper. Opplesning når du vil. Start med XABCDE og øv i ditt tempo.</p>
      <div class="cta-row">
        <a class="button" href="#play">▶ Spill 5 spørsmål</a>
        <a class="button secondary" href="#learn">Lær XABCDE</a>
      </div>
    </section>
    <section aria-labelledby="progress-title">
      <div class="section-head"><h2 id="progress-title">Din fremdrift</h2><span class="tiny">Beste quiz: ${state.best}/5</span></div>
      <div class="progress-label"><span>${state.learned.length} av 6 bokstaver øvd</span><span>${percent}%</span></div>
      <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${state.learned.length}"><div class="progress-fill" style="width:${percent}%"></div></div>
    </section>
    <section class="mode-grid" aria-label="Velg øvingsmåte">
      <a class="mode-card" href="#learn"><span class="mode-icon">ABC</span><span><strong>Lær kortet</strong><p>Én bokstav om gangen</p></span></a>
      <a class="mode-card play" href="#play"><span class="mode-icon">▶</span><span><strong>Spill</strong><p>Fem raske valg</p></span></a>
      <a class="mode-card piksib" href="#piksib"><span class="mode-icon">P</span><span><strong>PIKSIB</strong><p>Vaktlederens huskeregel</p></span></a>
      <a class="mode-card values" href="#values"><span class="mode-icon">12</span><span><strong>Normalverdier</strong><p>Pust og hvilepuls</p></span></a>
    </section>
    <aside class="emergency-note"><span class="emergency-number">113</span><span><strong>Ved fare for liv:</strong><br>Ring 1-1-3 og følg veiledningen du får.</span></aside>`;
}

function learnView() {
  const item = lessons[currentLesson];
  const text = `${item.letter}, ${item.title}. ${item.points.join(" ")}`;
  return `
    ${header("XABCDE i små biter", "Lær")}
    <p class="muted">Trykk på en bokstav. Ta én om gangen – du trenger ikke lese alt på én gang.</p>
    <div class="letter-strip" role="tablist" aria-label="Velg bokstav">
      ${lessons.map((lesson, index) => `<button class="letter-pill ${index === currentLesson ? "active" : ""}" role="tab" aria-selected="${index === currentLesson}" data-lesson="${index}">${lesson.letter}</button>`).join("")}
    </div>
    <article class="lesson-card">
      <div class="lesson-title"><span class="letter-big">${item.letter}</span><span><p class="eyebrow">${item.cue}</p><h2>${item.title}</h2></span></div>
      <ul class="check-list">${item.points.map((point) => `<li>${point}</li>`).join("")}</ul>
      <div class="lesson-actions">
        <button class="button ghost" id="read-lesson" data-speak="${escapeAttr(text)}">◖))) Les opp</button>
        <button class="button" id="mark-learned">${state.learned.includes(item.letter) ? "✓ Øvd" : "Jeg har øvd"}</button>
      </div>
    </article>
    <p class="tiny">Tips: Si bokstaven og stikkordet høyt før du går videre.</p>`;
}

function startQuiz() {
  const shuffled = [...questions].sort(() => Math.random() - .5).slice(0, 5);
  quiz = { items: shuffled, index: 0, score: 0, answered: false };
  registerActivity();
}

function playView() {
  if (!quiz) startQuiz();
  if (quiz.index >= quiz.items.length) return resultView();
  const item = quiz.items[quiz.index];
  return `
    ${header("Rask runde", "Spill")}
    <div class="progress-label"><span>Spørsmål ${quiz.index + 1} av ${quiz.items.length}</span><span>${quiz.score} poeng</span></div>
    <div class="progress-track"><div class="progress-fill" style="width:${(quiz.index / quiz.items.length) * 100}%"></div></div>
    <article class="quiz-card" style="margin-top:1rem">
      <div class="quiz-meta"><span>Velg ett svar</span><button class="icon-button" data-speak="${escapeAttr(item.q)}" aria-label="Les spørsmålet høyt">◖)))</button></div>
      <h2>${item.q}</h2>
      <div class="answers">${item.options.map((option, index) => `<button class="answer" data-answer="${index}">${option}</button>`).join("")}</div>
      <div class="feedback" id="feedback" aria-live="polite"><span class="muted">Svaret forklares etter at du velger.</span></div>
      <button class="button full" id="next-question" style="margin-top:.7rem" disabled>${quiz.index === quiz.items.length - 1 ? "Se resultat" : "Neste spørsmål"}</button>
    </article>`;
}

function resultView() {
  state.best = Math.max(state.best, quiz.score);
  saveProgress();
  const message = quiz.score === 5 ? "Full kontroll!" : quiz.score >= 3 ? "Godt jobbet!" : "Ny runde gir ny læring.";
  return `
    ${header("Runden er ferdig", "Resultat")}
    <section class="quiz-card" style="text-align:center">
      <div class="score-burst">${quiz.score}/5</div>
      <h2>${message}</h2>
      <p class="muted">Hvert forsøk gjør huskeregelen litt lettere å hente frem.</p>
      <div class="cta-row" style="justify-content:center">
        <button class="button" id="restart-quiz">Spill igjen</button>
        <a class="button ghost" href="#learn">Se læringskort</a>
      </div>
    </section>`;
}

function piksibView() {
  return `
    ${header("PIKSIB", "Tips til vaktleder")}
    <p class="muted">En enkel sirkel for å lede, følge opp og vurdere på nytt.</p>
    <ol class="piksib-list">${piksib.map(([letter, word]) => `<li><b>${letter}</b><span>${word}</span></li>`).join("")}</ol>
    <button class="button full" data-speak="${piksib.map(([letter, word]) => `${letter}, ${word}`).join(". ")}">◖))) Les opp PIKSIB</button>`;
}

function valuesView() {
  return `
    ${header("Normalverdier", "Oppslagskort")}
    <p class="muted">Veiledende verdier fra tiltakskortet. Tall må alltid vurderes sammen med personens tilstand.</p>
    <div style="overflow-x:auto">
      <table class="values-table">
        <thead><tr><th>Alder</th><th>Pust/min</th><th>Hvilepuls/min</th></tr></thead>
        <tbody>${normalValues.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>
    <button class="button ghost full" data-speak="Normalverdier. Voksne over atten år: respirasjonsfrekvens tolv til atten. Hvilepuls femtien til åtti.">◖))) Les opp voksenverdiene</button>`;
}

function moreView() {
  return `
    ${header("Mer å øve på", "Oppslag og trygghet")}
    <section class="panel">
      <h2>Viktige nummer</h2>
      <div class="number-grid">
        <div class="number-card danger"><small>Fare for liv</small><strong>113</strong>Medisinsk nødnummer</div>
        <div class="number-card"><small>Brann</small><strong>110</strong>Brannvesenet</div>
        <div class="number-card"><small>Politi</small><strong>112</strong>Nødnummer</div>
        <div class="number-card"><small>Rask hjelp, ikke livstruende</small><strong>116 117</strong>Legevakt</div>
      </div>
      <p class="tiny" style="margin-top:.8rem">Giftinformasjonen: 22 59 13 00 · Oppfølging av førstehjelpere: 02415</p>
    </section>
    <section class="panel">
      <h2>Sjekk appstatus</h2>
      <p class="muted">Kontrollerer bare denne enheten og appens ressurser. Ingenting lastes opp.</p>
      <div class="status-list" id="status-results" role="status"><span class="muted">Ingen sjekk kjørt ennå.</span></div>
      <button class="button ghost full" id="status-check">Sjekk status</button>
    </section>
    <section class="panel">
      <h2>Om KlarX</h2>
      <p>Et uoffisielt øvingsverktøy basert på brukerens tiltakskort. Det erstatter ikke kurs, praktisk trening eller råd fra helsepersonell.</p>
      <p><a href="https://www.rodekors.no/forstehjelp/" target="_blank" rel="noreferrer">Les offisiell førstehjelpsinformasjon hos Røde Kors ↗</a></p>
    </section>
    <button class="button ghost full" id="reset-progress">Nullstill min fremdrift</button>`;
}

function escapeAttr(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function getRoute() {
  const route = location.hash.replace("#", "") || "home";
  return ["home", "learn", "play", "piksib", "values", "more"].includes(route) ? route : "home";
}

function render() {
  const route = getRoute();
  if (route === "home") registerActivity();
  const views = { home: homeView, learn: learnView, play: playView, piksib: piksibView, values: valuesView, more: moreView };
  document.querySelector("#main").innerHTML = views[route]();
  document.querySelectorAll("[data-nav]").forEach((link) => link.classList.toggle("active", link.dataset.nav === route || (route === "piksib" && link.dataset.nav === "learn") || (route === "values" && link.dataset.nav === "learn")));
  bindActions(route);
  const autoAudio = localStorage.getItem(AUDIO_KEY) === "true";
  document.querySelector("#audio-toggle").setAttribute("aria-pressed", String(autoAudio));
  if (autoAudio && route !== "home") {
    const heading = document.querySelector("#main h1, #main h2");
    if (heading) speak(heading.textContent);
  }
}

function bindActions(route) {
  document.querySelectorAll("[data-speak]").forEach((button) => button.addEventListener("click", () => speak(button.dataset.speak)));
  document.querySelectorAll("[data-lesson]").forEach((button) => button.addEventListener("click", () => { currentLesson = Number(button.dataset.lesson); render(); }));
  document.querySelector("#mark-learned")?.addEventListener("click", () => {
    const letter = lessons[currentLesson].letter;
    if (!state.learned.includes(letter)) state.learned.push(letter);
    registerActivity();
    saveProgress();
    showToast(`${letter} er registrert som øvd.`);
    if (currentLesson < lessons.length - 1) currentLesson += 1;
    render();
  });
  document.querySelectorAll("[data-answer]").forEach((button) => button.addEventListener("click", () => answerQuestion(Number(button.dataset.answer))));
  document.querySelector("#next-question")?.addEventListener("click", () => { quiz.index += 1; quiz.answered = false; render(); });
  document.querySelector("#restart-quiz")?.addEventListener("click", () => { quiz = null; render(); });
  document.querySelector("#status-check")?.addEventListener("click", runStatusCheck);
  document.querySelector("#reset-progress")?.addEventListener("click", () => {
    state = progressStore.clear();
    showToast("Fremdriften er nullstilt på denne enheten.");
    render();
  });
}

function answerQuestion(selected) {
  if (quiz.answered) return;
  quiz.answered = true;
  const item = quiz.items[quiz.index];
  const buttons = [...document.querySelectorAll("[data-answer]")];
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === item.answer) button.classList.add("correct");
    if (index === selected && selected !== item.answer) button.classList.add("wrong");
  });
  if (selected === item.answer) quiz.score += 1;
  document.querySelector("#feedback").innerHTML = `<strong>${selected === item.answer ? "Riktig!" : "Ikke helt."}</strong>${item.why}`;
  document.querySelector("#next-question").disabled = false;
  if (localStorage.getItem(AUDIO_KEY) === "true") speak(`${selected === item.answer ? "Riktig" : "Ikke helt"}. ${item.why}`);
}

function runStatusCheck() {
  let storageOk = false;
  try { localStorage.setItem("klarx-status-test", "ok"); storageOk = localStorage.getItem("klarx-status-test") === "ok"; localStorage.removeItem("klarx-status-test"); } catch {}
  const checks = [
    ["Lokal lagring", storageOk, storageOk ? "Fremdrift kan lagres" : "Lagring er blokkert"],
    ["Nettverk", navigator.onLine, navigator.onLine ? "Tilkoblet" : "Frakoblet – øving virker fortsatt"],
    ["Appressurser", true, "Læringskortene er lastet"],
    ["Frakoblet støtte", "serviceWorker" in navigator, "serviceWorker" in navigator ? "Tilgjengelig" : "Ikke støttet her"]
  ];
  document.querySelector("#status-results").innerHTML = checks.map(([name, ok, note]) => `<div class="status-row"><span><strong>${name}</strong><br><small>${note}</small></span><span class="${ok ? "status-ok" : "status-warn"}">${ok ? "OK" : "OBS"}</span></div>`).join("");
}

document.querySelector("#audio-toggle").addEventListener("click", (event) => {
  const next = event.currentTarget.getAttribute("aria-pressed") !== "true";
  localStorage.setItem(AUDIO_KEY, String(next));
  event.currentTarget.setAttribute("aria-pressed", String(next));
  showToast(next ? "Automatisk opplesning er på." : "Automatisk opplesning er av.");
  if (next) speak("Automatisk opplesning er på."); else window.speechSynthesis?.cancel();
});

window.addEventListener("hashchange", () => { if (getRoute() !== "play") quiz = null; render(); window.scrollTo(0, 0); });

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
render();
