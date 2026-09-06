# KlarX – førstehjelpstrener

En mobilvennlig, lokal-først læringsapp for å øve på Røde Kors sitt XABCDE-tiltakskort, PIKSIB og normalverdier. Appen bruker korte læringskort, norsk taleopplesning og quiz.

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

Fremdrift lagres bare i nettleserens `localStorage`. Ingen personopplysninger, svar eller bilder sendes ut. Service worker gjør at allerede besøkt innhold kan brukes uten nett.

## Faglige kilder

- Brukerens bilder av Røde Kors-kortet (versjon 2.0)
- [Røde Kors: bevisstløshet og sideleie](https://www.rodekors.no/forstehjelp/tema/bevisstloshet/)
- [Røde Kors: hypotermi og nedkjøling](https://www.rodekors.no/forstehjelp/tema/hypotermi-nedkjoling/)
