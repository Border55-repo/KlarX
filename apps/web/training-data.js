export const scenarioFlows = [
  {
    title: "Fall fra stige",
    intro: "En voksen har falt omtrent to meter. Personen er våken, blek og har smerter i låret.",
    steps: [
      { title: "Sikre skadestedet", prompt: "Hva gjør du først?", options: ["Går rett til pasienten", "Stanser og vurderer farer før du går inn", "Ber pasienten reise seg"], answer: 1, feedback: "Egensikkerhet og oversikt kommer først." },
      { title: "Undersøk", prompt: "Hva er riktig videre?", options: ["Systematisk XABCDE med tiltak ved funn", "Bare undersøke låret", "Gi drikke"], answer: 0, feedback: "Undersøk systematisk og gjør tiltak når du finner problemer." },
      { title: "Tiltak", prompt: "Personen er blek, kald og klam. Hva gjør du?", options: ["Lar personen gå", "Holder personen i ro, varm og følger med", "Masserer låret"], answer: 1, feedback: "Forebygg varmetap, la personen være i ro og overvåk." },
      { title: "Varsle", prompt: "Tilstanden virker alvorlig. Hva gjør du?", options: ["Ringer 1-1-3 og formidler sted og funn", "Venter til neste vakt", "Sender bare en tekstmelding"], answer: 0, feedback: "Varsle tidlig og følg veiledningen fra 1-1-3." },
      { title: "Revurder", prompt: "Hva gjør du etter tiltak?", options: ["Avslutter undersøkelsen", "Starter på A igjen og følger utviklingen", "Flytter pasienten uten grunn"], answer: 1, feedback: "Tilstanden kan endre seg. Gjenta undersøkelsen og vurder effekten av tiltak." }
    ]
  },
  {
    title: "Pustevansker på arrangement",
    intro: "En deltaker sitter foroverbøyd, er urolig og puster raskt.",
    steps: [
      { title: "Sikre og få oversikt", prompt: "Hva gjør du først?", options: ["Sjekker om stedet er trygt og presenterer deg", "Legger personen flatt", "Gir mat"], answer: 0, feedback: "Sørg for trygghet og skap ro." },
      { title: "Undersøk", prompt: "Hva undersøker du?", options: ["Bare puls", "Bevissthet, luftvei og pust systematisk", "Kun temperatur"], answer: 1, feedback: "Start systematisk og vurder pustens lyd, frekvens og arbeid." },
      { title: "Tiltak", prompt: "Personen er våken og har pustebesvær. Hva passer?", options: ["Berolige og hjelpe til en god sittestilling", "Tvinge personen til å gå", "Gi ukjente medisiner"], answer: 0, feedback: "Berolig, finn best mulig stilling og ikke tilby egne medisiner." },
      { title: "Varsle", prompt: "Pusten blir dårligere. Hva gjør du?", options: ["Ringer 1-1-3", "Venter alene", "Avslutter vakten"], answer: 0, feedback: "Ved forverring eller tvil om alvorlighetsgrad skal du varsle." },
      { title: "Revurder", prompt: "Hva følger du med på?", options: ["Endringer i bevissthet og pust", "Bare klokkeslettet", "Ingenting etter varsling"], answer: 0, feedback: "Følg utviklingen og gi nye funn videre." }
    ]
  }
];

export const errorCases = [
  { title: "Trafikkulykke i mørket", text: "Førstehjelperen løper rett inn i veibanen og begynner å telle puls.", options: ["Pulsen telles for tidlig", "Egensikkerhet og sikring av skadestedet mangler", "Pasienten burde fått mat"], answer: 1, topic: "Egensikkerhet og varsling", why: "Førstehjelperen må først oppdage og redusere farer, slik at ikke flere blir skadet." },
  { title: "Bevisstløs med normal pust", text: "Personen legges i sideleie. Førstehjelperen går deretter bort og kontrollerer ikke pusten igjen.", options: ["Sideleie er alltid feil", "Jevnlig pustekontroll mangler", "Bukstøt mangler"], answer: 1, topic: "D – Bevissthet", why: "Pusten må kontrolleres jevnlig fordi tilstanden kan endre seg." },
  { title: "Kald pasient", text: "Pasienten får et teppe over seg, men blir liggende direkte på kald og våt bakke.", options: ["Isolasjon under pasienten mangler", "Teppet skal fjernes", "Pasienten må gå"], answer: 0, topic: "E – Topp til tå", why: "Beskytt mot varmetap både under og rundt pasienten." },
  { title: "Varsling", text: "Førstehjelperen beskriver mange detaljer, men oppgir ikke hvor hendelsen er.", options: ["Lokasjonen må oppgis tidlig", "Det må tas bilde", "Varsling var unødvendig"], answer: 0, topic: "Egensikkerhet og varsling", why: "En tydelig lokasjon bør formidles tidlig dersom samtalen blir brutt." }
];

export const partnerCases = [
  { title: "Brystsmerter", publicText: "Undersøk markøren systematisk og forklar høyt hva du gjør.", marker: "Du er våken, blek og klam. Du har trykkende smerter i brystet. Opplysningen gis bare når førstehjelperen spør. Si at smerten startet for ti minutter siden.", goals: ["Egensikkerhet og kontakt", "Systematisk XABCDE", "Tidlig varsling", "Ro, hvile og varmetap forebygges", "Revurdering"] },
  { title: "Fall og mulig hodeskade", publicText: "Du finner en person etter et fall. Undersøk og prioriter tiltak.", marker: "Du er forvirret og husker ikke fallet. Du puster normalt, men blir gradvis trøttere. Reager med smerte når bakhodet undersøkes.", goals: ["Sjekk farer", "Vurder bevissthet med ACVPU", "Varsle ved alvorlige funn", "Unngå unødvendig bevegelse", "Kontroller pust gjentatte ganger"] }
];

export const sourceReview = Object.freeze({
  cardVersion: "2.0",
  handbookVersion: "September 2025",
  reviewedAt: "6. september 2026",
  status: "Faggrunnlaget er dokumentert – neste innholdsoppdatering krever ny kontroll"
});
