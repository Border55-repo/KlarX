# KlarX – førstehjelpstrener

En installerbar, mobilvennlig læringsapp for å øve på XABCDE-tiltakskortet og forberede seg til KFØR. Appen bruker korte læringskort, personlig veiledning på enheten, HLR-metronom, norsk taleopplesning, gruppeoppgaver og varierte scenariospill.

> Appen er et øvingsverktøy, ikke en erstatning for førstehjelpskurs eller veiledning fra 113.

## Kjør lokalt

```bash
npm run dev
```

Åpne `http://127.0.0.1:4173`.

## Kvalitetssjekk

```bash
npm run check
```

## Personvern og frakoblet bruk

Fremdrift og quizsvar lagres bare i nettleserens `localStorage`. Ingen navn, pasientopplysninger, svar eller bilder sendes ut. Service worker gjør at allerede besøkt innhold kan brukes uten nett.

Den personlige veilederen bruker bare øvde bokstaver, svarprosent og feiltemaer på brukerens egen enhet. Et valgfritt fornavn eller kallenavn blir også bare lagret lokalt.

KlarX bruker Stats4U til å vise anonyme, samlede tall for aktive og totale besøk. Tjenesten oppgir at den ikke bruker informasjonskapsler eller lagrer IP-adresser. Telleren kan ikke se fremdrift eller svar.

Kontrollsenter kan overvåke offentlig appversjon og driftsstatus uten GitHub-token via [`status.json`](https://border55-repo.github.io/KlarX/status.json).

## Installer på telefon

- Android/Chrome: trykk **Installer appen** i KlarX, eller velg Installer app i nettlesermenyen.
- iPhone/Safari: trykk Del og velg **Legg til på Hjem-skjerm**.

## KFØR-øving

- 32 KFØR-scenarier trekkes tilfeldig i runder på fem.
- 12 egne spørsmål trener tiltakskort, PIKSIB og normalverdier.
- Rekkefølgejakten trener XABCDE.
- Instruktørmodus gir gruppeoppgaver og 90-sekunders timer.
- 12 korte temaoppslag kan leses høyt.
- Et interaktivt tiltakskort gir store X–E-knapper og direkte 113-handling, også frakoblet.
- Min veileder foreslår neste øvelse ut fra den enkelte deltakerens lokale fremgang.
- Praktiske scenarioforløp trener hele kjeden: sikre, undersøke, gjøre tiltak, varsle og revurdere.
- Nybegynner- og viderekomment nivå tilpasser antall spørsmål og mengden hjelp.
- Feiltemaer legges i en lokal repetisjonskø og kommer tilbake oftere.
- «Finn feilen» trener oppdagelse av manglende tiltak.
- To-personersmodus gir markøren skjult informasjon og laget vurderingspunkter.
- Fremdriftssiden viser lokal historikk, sterke og svake temaer og KFØR-forberedelse.
- HLR-metronomen trener en jevn takt mellom 100 og 120 kompresjoner per minutt; den vurderer ikke teknikk.
- Appen kontrollerer automatisk om en ny versjon finnes når den er på nett. Manuell cache-refresh finnes under **Mer**.

## Faglige kilder

Kildeversjonen vises i selve KFØR-seksjonen. Prosjektet følges opp mot nye utgivelser, men faginnhold endres først etter at den nye kilden er kontrollert.

- Brukerens bilder av Røde Kors-kortet (versjon 2.0)
- Brukerens deltakerhefte «Kvalifisert førstehjelp» (september 2025)
- [Røde Kors: bevisstløshet og sideleie](https://www.rodekors.no/forstehjelp/tema/bevisstloshet/)
- [Røde Kors: hypotermi og nedkjøling](https://www.rodekors.no/forstehjelp/tema/hypotermi-nedkjoling/)
