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

const kforModules = [
  { code: "01", title: "Klar for oppdrag", cue: "Kritisk eller ikke-kritisk?", points: ["KFØR kombinerer e-læring, teori og praktiske øvelser.", "Målet er å undersøke systematisk, varsle riktig og bruke relevant utstyr.", "Ferdighetene må trenes praktisk – appen er teoristøtte."] },
  { code: "02", title: "Varsling og ansvar", cue: "Rett hjelp til rett tid", points: ["Ring 1-1-3 ved kritisk sykdom/skade eller tvil om alvorlighetsgrad.", "Oppgi nøyaktig sted tidlig og bruk gjerne høyttaler.", "Ikke lagre identifiserende pasientopplysninger. Ikke tilby medisiner fra egen lomme."] },
  { code: "03", title: "Egensikkerhet", cue: "Du må være trygg for å hjelpe", points: ["Stopp, ro ned pusten og les skadestedet før du går inn.", "Fjern farer, forebygg nye ulykker og gjør deg synlig.", "Bruk hansker ved blod og unngå kontakt med ukjente stoffer."] },
  { code: "04", title: "Pasientundersøkelse", cue: "XABCDE – finn, tiltak, start igjen", points: ["Gjør tiltak med én gang når du finner et problem.", "Etter tiltak starter du på A igjen og vurderer på nytt.", "Undersøkelsen er et øyeblikksbilde og må gjentas."] },
  { code: "05", title: "A – Luftvei", cue: "Fri luftvei er først", points: ["Bøy hodet forsiktig bakover og løft eller trekk kjeven frem.", "Voksen som ikke kan hoste eller puste: veksle fem ryggslag og fem bukstøt.", "Spebarn skal ikke ha bukstøt – bruk fem ryggslag og fem brystkompresjoner."] },
  { code: "06", title: "B – Pust", cue: "Gjenkjenn, ikke diagnostiser", points: ["Se etter lyd, frekvens, dybde, hjelpemuskler og cyanose.", "Ved pustebesvær: varsle, finn best mulig stilling og berolige.", "Agonale gisp er ikke normal pust."] },
  { code: "07", title: "C – Sirkulasjon", cue: "Blek, kald, klam", points: ["Se etter økende pust/puls, svak puls og endret atferd.", "Stans ytre blødning med direkte trykk og trykkbandasje.", "Hold varm, la pasienten være i ro og formidle funn."] },
  { code: "08", title: "HLR og hjertestarter", cue: "Varsle – HLR – AED", points: ["Bevisstløs og ikke normal pust: ring 1-1-3 og start HLR 30:2.", "Tilstreb 100–120 brystkompresjoner per minutt.", "Slå på hjertestarteren og følg beskjedene. Ingen må berøre under analyse eller støt."] },
  { code: "09", title: "D – Bevissthet", cue: "ACVPU og FAST", points: ["ACVPU skiller våken, forvirret, reaksjon på tale/smerte og ingen reaksjon.", "Ved kramper: beskytt, ta tiden, ikke hold fast og ikke legg noe i munnen.", "Nyoppståtte nevrologiske symptomer eller utslag på FAST: ring 1-1-3."] },
  { code: "10", title: "E – Topp til tå", cue: "Se hele personen", points: ["Undersøk videre etter ABCD og vurder skademekanisme og omgivelser.", "Brudd støttes i stillingen det ligger; ikke forsøk å sette det på plass.", "Brannskade kjøles med rennende lunkent vann i 20 minutter, mens resten av pasienten holdes varm."] },
  { code: "11", title: "Temperatur og forgiftning", cue: "Beskytt – identifiser – varsle", points: ["Ved nedkjøling: isoler fra bakken, legg på varme og beskytt mot vind og vann.", "Ikke gni frostskader eller la pasienten gå på forfrosne føtter.", "Ved forgiftning: finn stoff, mengde og tidspunkt. Ikke fremkall brekninger. Ring Giftinformasjonen eller 1-1-3 ved symptomer."] },
  { code: "12", title: "Psykososial førstehjelp", cue: "Vær – lytt – aksepter – gi", points: ["Vær nærværende.", "Lytt oppmerksomt og aksepter ulike reaksjoner.", "Gi omsorg og praktisk hjelp – og bruk ettersamtale for å ivareta hjelperen."] }
];

const kforQuestions = [
  { q: "Du ringer 1-1-3 fra et uoversiktlig skadested. Hva bør sies tidlig?", options: ["Nøyaktig lokasjon", "Navnet på alle tilskuere", "Hvilket kurs du har", "Hvor lenge vakten varer"], answer: 0, why: "AMK trenger en entydig lokasjon tidlig hvis samtalen blir brutt." },
  { q: "Hva kan stå på et observasjonsskjema fra et frivillig førstehjelpsoppdrag?", options: ["Fødselsnummer", "Full adresse", "Funn og utførte tiltak uten identifiserende opplysninger", "Bilde av pasienten"], answer: 2, why: "Heftet sier at funn og tiltak kan noteres, men ikke opplysninger som identifiserer pasienten." },
  { q: "En voksen er våken, men klarer ikke å hoste eller puste. Hva er riktig?", options: ["Fem ryggslag og fem bukstøt vekselvis", "Gi vann", "Legg flatt og vent", "Bare be personen hoste"], answer: 0, why: "Ved alvorlig luftveisstans hos våken voksen veksles fem ryggslag og fem bukstøt." },
  { q: "Hva skal du IKKE gjøre på et våkent spebarn med fremmedlegeme?", options: ["Fem ryggslag", "Fem brystkompresjoner", "Bukstøt", "Se etter fremmedlegemet mellom seriene"], answer: 2, why: "Spebarn skal ikke utsettes for bukstøt." },
  { q: "Du har nettopp gjort et livreddende tiltak under A. Hva nå?", options: ["Gå rett til E", "Start vurderingen på A igjen", "Avslutt undersøkelsen", "Vent til ambulansen kommer"], answer: 1, why: "Etter tiltak går du tilbake til A og vurderer på nytt." },
  { q: "En bevisstløs person gisper uregelmessig. Hvordan vurderes det?", options: ["Som normal pust", "Som søvn", "Som unormal pust – varsle og start HLR", "Som hyperventilering"], answer: 2, why: "Agonale gisp er ikke normal pust og må ikke forsinke HLR." },
  { q: "Hva er riktig kompresjonstakt ved HLR ifølge heftet?", options: ["40–60/min", "60–80/min", "100–120/min", "140–160/min"], answer: 2, why: "KFØR-heftet oppgir 100–120 brystkompresjoner per minutt." },
  { q: "Hjertestarteren analyserer. Hva gjør laget?", options: ["Fortsetter kompresjoner", "Sørger for at ingen berører pasienten", "Tar av elektrodene", "Flytter pasienten"], answer: 1, why: "Ingen skal berøre pasienten mens hjertestarteren analyserer eller ved støt." },
  { q: "En person får et krampeanfall. Hva er riktig tiltak?", options: ["Hold personen fast", "Legg noe mellom tennene", "Beskytt mot skade og ta tiden", "Gi drikke"], answer: 2, why: "Beskytt personen, ta tiden og ikke hold fast eller legg noe i munnen." },
  { q: "FAST-symptomet forsvant etter to minutter. Hva gjør du?", options: ["Venter til i morgen", "Ringer 1-1-3 likevel", "Gir mat", "Lar personen kjøre hjem"], answer: 1, why: "Forbigående symptomer kan være TIA. Ikke vent på at symptomene skal komme tilbake." },
  { q: "En gjenstand står fast i et stikksår. Hva gjør du?", options: ["Trekker den raskt ut", "Lar den stå og stabiliserer rundt", "Vrenger den løs", "Skyver den lenger inn"], answer: 1, why: "Ikke fjern fremmedlegemet; det kan begrense blødning. Stabiliser det." },
  { q: "Hvordan kjøles en brannskade?", options: ["Is direkte på huden", "Kaldt vann i fem minutter", "Rennende lunkent vann i 20 minutter", "Kun tørr bandasje"], answer: 2, why: "Bruk rennende lunkent vann, omtrent 20 grader, i 20 minutter. Hold resten av pasienten varm." },
  { q: "Hva gjør du med fastbrente klær?", options: ["River dem av", "Lar dem sitte", "Klipper gjennom huden", "Gnir dem løs"], answer: 1, why: "Fastbrente klær skal ikke fjernes fra pasienten." },
  { q: "Hva er førstevalg ved større ytre blødning på KFØR-nivå?", options: ["Direkte trykk og trykkbandasje", "Kun is", "Fjerne første bandasje", "Vaske lenge før trykk"], answer: 0, why: "Direkte trykk i såret og trykkbandasje er førstevalg." },
  { q: "Hva gjør du ved mulig forgiftning gjennom munnen?", options: ["Fremkaller brekninger", "Finner stoff, mengde og tidspunkt og ber om råd", "Gir alltid melk", "Lar personen sove"], answer: 1, why: "Ikke fremkall brekninger. Identifiser eksponeringen og kontakt Giftinformasjonen eller 1-1-3 ved symptomer." },
  { q: "Hva inngår i psykososial førstehjelp?", options: ["Være nær, lytte, akseptere og gi omsorg", "Love at alt går bra", "Presse personen til å snakke", "Gå uten å forklare"], answer: 0, why: "Prinsippene er: Vær nærværende, lytt oppmerksomt, aksepter ulike reaksjoner og gi omsorg og praktisk hjelp." }
  ,{ q: "Hva er det første du gjør når du kommer til et mulig farlig skadested?", options: ["Løper rett til pasienten", "Stopper og vurderer egen sikkerhet og farer", "Tar bilde", "Starter med pulstelling"], answer: 1, why: "Egensikkerhet kommer først. Du må oppdage og redusere farer før du kan hjelpe trygt." }
  ,{ q: "Hvorfor gjentas XABCDE-undersøkelsen?", options: ["For å fylle tiden", "Fordi tilstanden og effekten av tiltak kan endre seg", "Bare fordi AMK spør", "Den skal ikke gjentas"], answer: 1, why: "Undersøkelsen er et øyeblikksbilde. Gjentakelse oppdager endringer og viser om tiltak virker." }
  ,{ q: "Hva betyr C i ACVPU?", options: ["Cold", "Confusion – forvirring", "Circulation", "Compressions"], answer: 1, why: "C markerer nyoppstått forvirring og er et viktig faresignal." }
  ,{ q: "Hva er et mulig tegn på sirkulasjonssvikt?", options: ["Varm og tørr hud", "Blek, kald og klam hud", "Lavere pustefrekvens etter hvile", "God matlyst"], answer: 1, why: "Blek, kald og klam hud kan være tegn på sviktende sirkulasjon." }
  ,{ q: "Hva gjør du med første bandasje hvis blod trenger gjennom?", options: ["Tar den av", "Legger mer trykk/bandasje utenpå", "Vasker såret", "Venter uten tiltak"], answer: 1, why: "Behold trykket og legg mer materiale utenpå. Å fjerne første bandasje kan rive opp koagelet." }
  ,{ q: "En bevisstløs person puster normalt. Hva er viktig videre?", options: ["Sideleie og jevnlig pustekontroll", "Mat og drikke", "La personen være alene", "Bukstøt"], answer: 0, why: "Legg i sideleie, varsle ved behov og kontroller pusten jevnlig fordi tilstanden kan endre seg." }
  ,{ q: "Hva betyr P i PIKSIB?", options: ["Puls", "Planlegge", "Pasient", "Prioritere"], answer: 1, why: "PIKSIB starter med Planlegge, før Iverksette og Kontrollere." }
  ,{ q: "Hva betyr B i PIKSIB?", options: ["Bandasje", "Bevissthet", "Bedømme", "Beskytte"], answer: 2, why: "B står for Bedømme – vurder situasjonen og effekten på nytt." }
  ,{ q: "Hva er veiledende normal pustefrekvens for voksne på tiltakskortet?", options: ["6–10", "12–18", "20–30", "35–45"], answer: 1, why: "Tiltakskortet oppgir 12–18 pust per minutt for personer over 18 år." }
  ,{ q: "Hva er veiledende hvilepuls for personer over 18 år på kortet?", options: ["20–40", "51–80", "90–130", "100–160"], answer: 1, why: "Kortet oppgir 51–80 slag per minutt som veiledende hvilepuls for voksne." }
  ,{ q: "Hvordan håndteres et mulig brudd?", options: ["Settes alltid på plass", "Støttes i stillingen det ligger", "Masséres hardt", "Pasienten må gå på det"], answer: 1, why: "Støtt kroppsdelen i stillingen den ligger og unngå unødvendig bevegelse." }
  ,{ q: "Hva er viktig ved nedkjøling?", options: ["Bare et teppe oppå", "Isolasjon både under og rundt pasienten", "Gni huden", "Gi alkohol"], answer: 1, why: "Beskytt mot bakken, vind og vann, og isoler hele pasienten. Varm forsiktig." }
  ,{ q: "Hva gjør du ved mulig nakkeskade og fri luftvei?", options: ["Prioriterer luftveien og bruker skånsom teknikk", "Lar luftveien være stengt", "Bøyer nakken kraftig", "Gir drikke"], answer: 0, why: "Fri luftvei har høy prioritet. Bruk kjeveløft og minst mulig unødvendig bevegelse når skade mistenkes." }
  ,{ q: "Hvorfor brukes høyttaler ved samtale med 1-1-3?", options: ["For underholdning", "For å kunne hjelpe samtidig og følge veiledning", "For å ta opp samtalen", "Det er påbudt i alle situasjoner"], answer: 1, why: "Høyttaler gjør at du kan fortsette livreddende tiltak mens AMK veileder." }
  ,{ q: "Hva skal du gjøre med kjemikalier på huden?", options: ["Gni dem inn", "Beskytte deg selv, fjerne forurensning og skylle etter råd", "Dekke uten å undersøke", "Smake for å identifisere"], answer: 1, why: "Egenbeskyttelse er avgjørende. Fjern eksponeringen og innhent faglig råd om skylling og videre tiltak." }
  ,{ q: "Hva er riktig kommunikasjon med en sterkt preget person?", options: ["Presse frem detaljer", "Være rolig, lytte og gi konkret hjelp", "Love at alt ordner seg", "Diskutere skyld"], answer: 1, why: "Rolig nærvær, lytting og praktisk hjelp er kjernen i psykososial førstehjelp." }
];

const instructorPrompts = [
  { title: "Varslingsduell", text: "To og to: Én er AMK, én er førstehjelper. Førstehjelperen har 90 sekunder på å oppgi sted, hva som har skjedd, antall pasienter og viktigste funn." },
  { title: "Finn fem farer", text: "Se for dere en trafikkulykke i mørket. Gruppen roper ut fem farer eller sikringstiltak før noen går inn til pasienten." },
  { title: "XABCDE-stafett", text: "Gi hver deltaker én bokstav. De må si ett funn og ett tiltak for bokstaven sin – i riktig rekkefølge." },
  { title: "Agonalt eller normalt?", text: "Én deltaker beskriver pust med få, uregelmessige gisp. Resten må ta beslutningen høyt: normal eller unormal pust, og neste tiltak." },
  { title: "FAST på 30 sekunder", text: "Øv i par: smil, løft begge armer og si setningen «Solen skinner i dag». Avslutt med hva dere gjør ved ett positivt funn." },
  { title: "Banak-lagene", text: "Gruppen forklarer riktig rekkefølge: dampsperre, varmekilde, isolasjon og vind-/vanntett lag. Hva må også ligge under pasienten?" },
  { title: "Vær – lytt – aksepter – gi", text: "Rollespill i par: Én er preget etter en hendelse, én øver på å være til stede uten å presse eller love for mye." }
];

const STORAGE_KEY = "klarx-progress-v1";
const AUDIO_KEY = "klarx-audio-v1";
const progressStore = createProgressStore(localStorage, STORAGE_KEY);
let state = progressStore.read();
let currentLesson = 0;
let quiz = null;
let sequence = null;
let currentInstructorPrompt = 0;
let timerId = null;
let deferredInstallPrompt = null;

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
      <div class="cta-row"><a class="button" href="#kfor">⚡ Start KFØR-trening</a><button class="button secondary" data-install>＋ Installer appen</button></div>
    </section>
    <section aria-labelledby="progress-title">
      <div class="section-head"><h2 id="progress-title">Din fremdrift</h2><span class="tiny">Beste quiz: ${state.best}/5</span></div>
      <div class="progress-label"><span>${state.learned.length} av 6 bokstaver øvd</span><span>${percent}%</span></div>
      <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${state.learned.length}"><div class="progress-fill" style="width:${percent}%"></div></div>
    </section>
    <section class="mode-grid" aria-label="Velg øvingsmåte">
      <a class="mode-card kfor" href="#kfor"><span class="mode-icon">K</span><span><strong>KFØR-klar</strong><p>Scenarioer, oppgaver og instruktørmodus</p></span></a>
      <a class="mode-card" href="#learn"><span class="mode-icon">ABC</span><span><strong>Lær kortet</strong><p>Én bokstav om gangen</p></span></a>
      <a class="mode-card play" href="#play"><span class="mode-icon">▶</span><span><strong>Spill</strong><p>Fem raske valg</p></span></a>
      <a class="mode-card piksib" href="#piksib"><span class="mode-icon">P</span><span><strong>PIKSIB</strong><p>Vaktlederens huskeregel</p></span></a>
      <a class="mode-card values" href="#values"><span class="mode-icon">12</span><span><strong>Normalverdier</strong><p>Pust og hvilepuls</p></span></a>
    </section>
    <section class="live-panel" aria-labelledby="live-title">
      <div><p class="eyebrow">KlarX live</p><h2 id="live-title">Vi øver sammen</h2></div>
      <a class="counter-link" href="https://www.stats4u.net/live/3390558955" target="_blank" rel="noreferrer" aria-label="Åpne anonym besøksstatistikk for KlarX">
        <img src="https://www.stats4u.net/?action=pic&amp;s4uid=3390558955&amp;s4ustyleid=2000&amp;plang=en" alt="Besøksteller som viser besøk i dag, i går, totalt og aktive nå" width="190" height="120">
      </a>
      <p class="tiny">I telleren betyr <strong>Total</strong> samlet bruk og <strong>Online</strong> aktive nå. Anonyme tall uten informasjonskapsler.</p>
    </section>
    <aside class="emergency-note"><span class="emergency-number">113</span><span><strong>Ved fare for liv:</strong><br>Ring 1-1-3 og følg veiledningen du får.</span></aside>`;
}

function kforView() {
  return `
    ${header("Bli KFØR-klar", "Før kurset")}
    <p class="lead">Tren på beslutninger, samarbeid og rekkefølge i korte økter. Velg det som passer gruppen.</p>
    <section class="course-grid" aria-label="KFØR-aktiviteter">
      <a class="course-card sprint" href="#kfor-game"><span>⚡</span><strong>Scenario-sprint</strong><p>Fem situasjoner. Velg raskt og få forklaring.</p></a>
      <a class="course-card sequence" href="#sequence"><span>↕</span><strong>Rekkefølgejakten</strong><p>Trykk XABCDE i riktig rekkefølge.</p></a>
      <a class="course-card instructor" href="#instructor"><span>◉</span><strong>Instruktørmodus</strong><p>Gruppeoppgaver og en enkel 90-sekunders timer.</p></a>
    </section>
    <div class="section-head"><h2>12 korte temaer</h2><span class="tiny">Trykk for å åpne</span></div>
    <section class="module-list">${kforModules.map((module) => `
      <details class="module-card"><summary><span>${module.code}</span><div><strong>${module.title}</strong><small>${module.cue}</small></div></summary>
      <ul class="check-list">${module.points.map((point) => `<li>${point}</li>`).join("")}</ul>
      <button class="button ghost full" data-speak="${escapeAttr(`${module.title}. ${module.points.join(" ")}`)}">◖))) Les opp temaet</button></details>`).join("")}</section>
    <aside class="course-note"><strong>Viktig:</strong> KlarX er teoristøtte før og mellom øvelser. Praktiske ferdigheter skal læres og vurderes på kurset.</aside>`;
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

function startQuiz(mode = "xabcde") {
  const source = mode === "kfor" ? kforQuestions : questions;
  const shuffled = [...source].sort(() => Math.random() - .5).slice(0, 5);
  quiz = { mode, items: shuffled, index: 0, score: 0, answered: false };
  registerActivity();
}

function playView(mode = "xabcde") {
  if (!quiz || quiz.mode !== mode) startQuiz(mode);
  if (quiz.index >= quiz.items.length) return resultView();
  const item = quiz.items[quiz.index];
  return `
    ${header(mode === "kfor" ? "Scenario-sprint" : "Rask runde", mode === "kfor" ? "KFØR-spill" : "Spill")}
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
  if (quiz.mode === "kfor") state.kforBest = Math.max(state.kforBest || 0, quiz.score);
  else state.best = Math.max(state.best, quiz.score);
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
        <a class="button ghost" href="${quiz.mode === "kfor" ? "#kfor" : "#learn"}">${quiz.mode === "kfor" ? "Til KFØR" : "Se læringskort"}</a>
      </div>
    </section>`;
}

function sequenceView() {
  if (!sequence) sequence = { remaining: [...lessons].sort(() => Math.random() - .5), picked: [], done: false };
  return `
    ${header("Rekkefølgejakten", "KFØR-spill")}
    <p class="lead">Trykk bokstavene i riktig XABCDE-rekkefølge. Feil trykk gir et hint – du mister ingenting.</p>
    <div class="sequence-slots" aria-label="Din rekkefølge">${lessons.map((_, index) => `<span class="${sequence.picked[index] ? "filled" : ""}">${sequence.picked[index]?.letter || "?"}</span>`).join("")}</div>
    <div class="sequence-choices">${sequence.remaining.map((item) => `<button data-sequence="${item.letter}" aria-label="Velg ${item.letter}, ${item.title}"><b>${item.letter}</b><small>${item.title}</small></button>`).join("")}</div>
    <div class="feedback" id="sequence-feedback" aria-live="polite">${sequence.done ? `<strong>Fullført!</strong> XABCDE sitter i riktig rekkefølge.` : "Neste bokstav venter."}</div>
    <button class="button ghost full" id="restart-sequence">Bland på nytt</button>`;
}

function instructorView() {
  const prompt = instructorPrompts[currentInstructorPrompt];
  return `
    ${header("Instruktørmodus", "KFØR i gruppe")}
    <article class="instructor-card">
      <span class="activity-number">Oppgave ${currentInstructorPrompt + 1} av ${instructorPrompts.length}</span>
      <h2>${prompt.title}</h2><p>${prompt.text}</p>
      <button class="button full" id="next-prompt">Ny gruppeoppgave</button>
    </article>
    <section class="timer-card"><p class="eyebrow">Øvingstimer</p><strong id="timer-number">01:30</strong><p>Bruk timeren til varslingsøvelser eller korte lagdiskusjoner.</p>
      <div class="cta-row"><button class="button" id="timer-start">Start 90 sek</button><button class="button ghost" id="timer-reset">Nullstill</button></div>
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
      <div class="number-grid secondary-numbers">
        <a class="number-card poison" href="tel:22591300"><small>Forgiftning og råd</small><strong>22 59 13 00</strong>Giftinformasjonen</a>
        <a class="number-card followup" href="tel:02415"><small>Etter en krevende hendelse</small><strong>02415</strong>Oppfølging av førstehjelpere</a>
      </div>
    </section>
    <section class="panel">
      <h2>Sjekk appstatus</h2>
      <p class="muted">Kontrollerer bare denne enheten og appens ressurser. Ingenting lastes opp.</p>
      <div class="status-list" id="status-results" role="status"><span class="muted">Ingen sjekk kjørt ennå.</span></div>
      <button class="button ghost full" id="status-check">Sjekk status</button>
      <button class="button full" id="refresh-app" style="margin-top:.65rem">↻ Hent siste versjon</button>
    </section>
    <section class="panel">
      <h2>Installer på telefonen</h2>
      <p class="muted">KlarX kan ligge på startskjermen og fungerer også uten nett etter første besøk.</p>
      <button class="button full" data-install>＋ Installer KlarX</button>
    </section>
    <section class="panel">
      <h2>Om KlarX</h2>
      <p>Et uoffisielt øvingsverktøy basert på tiltakskortet og deltakerheftet for Kvalifisert førstehjelp. Det erstatter ikke kurs, praktisk trening eller råd fra helsepersonell.</p>
      <p class="tiny">Besøkstall leveres som anonyme, samlede tall av Stats4U. Tjenesten bruker ikke informasjonskapsler og mottar ingen opplysninger du skriver inn – KlarX har ingen pasientregistrering.</p>
      <p><a href="https://www.rodekors.no/forstehjelp/" target="_blank" rel="noreferrer">Les offisiell førstehjelpsinformasjon hos Røde Kors ↗</a></p>
    </section>
    <button class="button ghost full" id="reset-progress">Nullstill min fremdrift</button>`;
}

function escapeAttr(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function getRoute() {
  const route = location.hash.replace("#", "") || "home";
  return ["home", "learn", "play", "piksib", "values", "kfor", "kfor-game", "sequence", "instructor", "more"].includes(route) ? route : "home";
}

function render() {
  const route = getRoute();
  clearInterval(timerId);
  timerId = null;
  if (route === "home") registerActivity();
  const views = { home: homeView, learn: learnView, play: () => playView("xabcde"), piksib: piksibView, values: valuesView, kfor: kforView, "kfor-game": () => playView("kfor"), sequence: sequenceView, instructor: instructorView, more: moreView };
  document.querySelector("#main").innerHTML = views[route]();
  const navRoute = ["kfor-game", "sequence", "instructor"].includes(route) ? "kfor" : ["piksib", "values"].includes(route) ? "learn" : route;
  document.querySelectorAll("[data-nav]").forEach((link) => link.classList.toggle("active", link.dataset.nav === navRoute));
  bindActions(route);
  updateInstallButtons();
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
  document.querySelectorAll("[data-sequence]").forEach((button) => button.addEventListener("click", () => chooseSequence(button.dataset.sequence)));
  document.querySelector("#restart-sequence")?.addEventListener("click", () => { sequence = null; render(); });
  document.querySelector("#next-prompt")?.addEventListener("click", () => { currentInstructorPrompt = (currentInstructorPrompt + 1) % instructorPrompts.length; render(); });
  document.querySelector("#timer-start")?.addEventListener("click", startTimer);
  document.querySelector("#timer-reset")?.addEventListener("click", () => setTimerDisplay(90));
  document.querySelectorAll("[data-install]").forEach((button) => button.addEventListener("click", installApp));
  document.querySelector("#status-check")?.addEventListener("click", runStatusCheck);
  document.querySelector("#refresh-app")?.addEventListener("click", refreshApp);
  document.querySelector("#reset-progress")?.addEventListener("click", () => {
    state = progressStore.clear();
    showToast("Fremdriften er nullstilt på denne enheten.");
    render();
  });
}

function chooseSequence(letter) {
  if (sequence.done) return;
  const expected = lessons[sequence.picked.length];
  const feedback = document.querySelector("#sequence-feedback");
  if (letter !== expected.letter) {
    feedback.innerHTML = `<strong>Nesten!</strong> Se etter bokstaven som handler om «${expected.title}».`;
    return;
  }
  const chosen = sequence.remaining.find((item) => item.letter === letter);
  sequence.picked.push(chosen);
  sequence.remaining = sequence.remaining.filter((item) => item.letter !== letter);
  sequence.done = sequence.remaining.length === 0;
  if (sequence.done) registerActivity();
  render();
}

function setTimerDisplay(seconds) {
  const display = document.querySelector("#timer-number");
  if (display) display.textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function startTimer() {
  clearInterval(timerId);
  let seconds = 90;
  setTimerDisplay(seconds);
  timerId = setInterval(() => {
    seconds -= 1;
    setTimerDisplay(seconds);
    if (seconds <= 0) { clearInterval(timerId); timerId = null; showToast("Tiden er ute – samle laget!"); }
  }, 1000);
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function updateInstallButtons() {
  document.querySelectorAll("[data-install]").forEach((button) => {
    if (isStandalone()) { button.textContent = "✓ Appen er installert"; button.disabled = true; }
  });
}

async function installApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    updateInstallButtons();
    return;
  }
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  document.querySelector("#install-guide").innerHTML = isIos
    ? "<p>Trykk <strong>Del</strong> i Safari, bla ned og velg <strong>Legg til på Hjem-skjerm</strong>.</p>"
    : "<p>Åpne nettlesermenyen og velg <strong>Installer app</strong> eller <strong>Legg til på startskjermen</strong>.</p>";
  document.querySelector("#install-dialog").showModal();
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

async function refreshApp() {
  if (!navigator.onLine) return showToast("Koble til nett før du henter ny versjon.");
  const button = document.querySelector("#refresh-app");
  if (button) { button.disabled = true; button.textContent = "Henter siste versjon …"; }
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith("klarx-")).map((key) => caches.delete(key)));
    }
    const registration = await navigator.serviceWorker?.getRegistration();
    await registration?.update();
    location.reload();
  } catch {
    showToast("Oppdateringen kunne ikke hentes akkurat nå.");
    if (button) { button.disabled = false; button.textContent = "↻ Hent siste versjon"; }
  }
}

document.querySelector("#audio-toggle").addEventListener("click", (event) => {
  const next = event.currentTarget.getAttribute("aria-pressed") !== "true";
  localStorage.setItem(AUDIO_KEY, String(next));
  event.currentTarget.setAttribute("aria-pressed", String(next));
  showToast(next ? "Automatisk opplesning er på." : "Automatisk opplesning er av.");
  if (next) speak("Automatisk opplesning er på."); else window.speechSynthesis?.cancel();
});

window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); deferredInstallPrompt = event; updateInstallButtons(); });
window.addEventListener("appinstalled", () => { deferredInstallPrompt = null; showToast("KlarX er installert!"); updateInstallButtons(); });
document.querySelector("#close-install").addEventListener("click", () => document.querySelector("#install-dialog").close());
document.querySelector("#install-dialog-action").addEventListener("click", () => document.querySelector("#install-dialog").close());
window.addEventListener("hashchange", () => { const route = getRoute(); if (!["play", "kfor-game"].includes(route)) quiz = null; if (route !== "sequence") sequence = null; render(); window.scrollTo(0, 0); });

if ("serviceWorker" in navigator) window.addEventListener("load", async () => {
  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadController && !reloading) { reloading = true; location.reload(); }
  });
  try {
    const registration = await navigator.serviceWorker.register("./sw.js");
    if (navigator.onLine) await registration.update();
  } catch {}
});
render();
