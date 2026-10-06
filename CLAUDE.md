# Handleliste – prosjektkontekst for Claude Code

Familiens ukehandel-app. Statisk PWA på GitHub Pages som setter sammen en handleliste
(middagspakker + faste varer + ukeforslag) og sender den til en delt Microsoft To Do-liste
via en iOS-snarvei. Brukes på to iPhones (Anders og Tonje). Vi handler mandag–mandag.

- Repo: `zapturi-max/handleliste` (public)
- Live: https://zapturi-max.github.io/handleliste/
- Språk i UI og kode-kommentarer: norsk (bokmål, med familiens egne skrivemåter på varer)

## Arkitektur

Ingen build, ingen rammeverk, ingen backend. Rene filer i repo-roten:

| Fil | Innhold |
|---|---|
| `index.html` | Skall: header, 4 faner (Uka, Middager, Varer, Kurv), bottom sheet, toast |
| `app.js` | All logikk i én IIFE. Vanilla JS, `el()`-hjelper for DOM |
| `data.js` | `window.DINNERS`, `window.EXTRAS`, `window.STAPLES`, `window.AISLES` – her endres innhold |
| `styles.css` | CSS-tokens på `:root`, mørk modus via `prefers-color-scheme`, iOS safe-area |
| `sw.js` | Service worker, nett-først med cache-fallback. **Bump `CACHE`-versjonen ved hver endring** |
| `manifest.webmanifest`, `icons/` | PWA / «Legg til på Hjem-skjerm» |

Tilstand lagres kun i `localStorage` (prefiks `hl.`), per telefon:
`basket`, `history` (`d`: middag-id → ms, `s`: normalisert varenavn → ms), `plan`, `planDays`, `qty` (valgt antall per fast vare,
`norm(navn)` → q), `myDinners` (egne/endrede middager, id → middag), `hidden` (slettede standardmiddager), `reverse` (snu rekkefølge til To Do),
`myStaples` (egne faste varer: `{n, cat, p, own}`).

## Integrasjon med To Do – viktige beslutninger

- **Ingen Microsoft Graph / Entra app-registrering.** Bevisst valg: ikke knyttes mot noen tenant. Ikke foreslå MSAL/Graph på nytt.
- To Do på iOS splitter **ikke** innlimt tekst med flere linjer til flere oppgaver.
- Løsning: knappen «Send til To Do» åpner
  `shortcuts://run-shortcut?name=Handleliste&input=text&text=<én vare per linje>`.
- iOS-snarveien «Handleliste» (finnes på begge telefoner, delt via iCloud-lenke):
  1. Del opp *Snarvei-inndata* etter *Nye linjer*
  2. Gjenta med hvert objekt i *Del opp tekst*
  3. To Do: Legg til *Gjentatt objekt* i *Handleliste 2026*
- Fallback: «Kopier liste» (clipboard) og «Del …» (`navigator.share`).
- Når listen bytter navn (f.eks. «Handleliste 2027»), må snarveien oppdateres på begge telefoner – ikke appen.

## Datamodell (`data.js`)

Middag:
```js
{ id: "taco", name: "Taco", freq: 10, days: ["fre"], items: [
  { n: "Kjøttdeig", main: true },   // main: får dag påført -> «Kjøttdeig (fredag)»
  { n: "Taco krydder", opt: true }, // opt: ikke huket av som standard («ofte hjemme»)
  { n: "Grandiosa", q: 2 },          // q: antall, gir «2x Grandiosa»
]}
```
- `freq` = antall uker siste 12 mnd middagen var på listen. `days` = typiske dager (`man tir ons tor fre lør søn`).
- `EXTRAS` = pakker som ikke er middager (Helgekos, Frokost og matpakke, Minsten).
- `STAPLES` = kategorier med varer; `p` = andel av ukene (siste 52) varen var på listen.
- `AISLES` = butikkrekkefølge: frukt og grønt, kjøtt og pålegg, brød og frokost, meieri, resten.
  `names` = eksakte normaliserte navn (sjekkes først), `words` = delstrenger. Ingen treff → «Resten».

Datagrunnlag: eksport av 6 729 oppgaver fra To Do-listen (juni 2022 – okt 2026), analysert på
frekvens og samforekomst (varer opprettet innen ±4 t). Tallene er et øyeblikksbilde og trenger ikke være eksakte.

## Logikk som er verdt å kjenne

- **Varetittel** til To Do: `itemTitle()` → `"[q]x Navn (dag)"`. Følger familiens vane, f.eks. «2x melk», «Kjøttdeig (fredag)».
- **Sammenslåing i kurv** (`addItem`): samme normaliserte navn + samme dag-tag slås sammen (q summeres). Ulik dag-tag = egen linje. Uten tag slås kun sammen med en linje uten tag.
- **`norm()`** fjerner antall-prefiks/suffiks, parenteser og tegn – brukes til nøkler og historikk.
- **Ukeplan** (`pickDinner`): vektet tilfeldig valg. Vekt = `freq` × 4 hvis dagen passer `days`, ellers × 0.3. Straff hvis laget < 1 uke (× 0.05) eller < 2.5 uker (× 0.35) siden. Ingen duplikater i samme uke.
- **Faste varer forslag** (`stapleSuggestions`): huket av hvis `p ≥ 0.3` (og ikke sendt siste uke), eller forfalt (`uker siden ≥ 0.85 / p`). Viser huket av + 6 til, resten bak «Vis flere».
- **Butikkrekkefølge** (`aisleOf`, `sortedBasket`): kurven vises gruppert etter `AISLES`, og `listText()` sender i samme
  rekkefølge (snudd hvis `reverse`). Innenfor en gruppe beholdes rekkefølgen varene ble lagt til i.
- **Egne middager** (`loadDinners`, `openEditor`): `DINNERS` i `app.js` er en lokal `let` = `window.DINNERS` med
  overstyringer fra `myDinners`, pluss egne (id `egen-…`), minus `hidden`. Lagres kun per telefon (bevisst valg).
  En overstyrt standardmiddag skjuler senere endringer i `data.js` til brukeren trykker «Tilbakestill til standard».
- **Bytt middag** (`openDinnerPicker`): liste delt i Hverdags-/Helgemiddager. Helg = `days` kun fre/lør/søn.
  Gjeldende dags gruppe vises først. «Tilfeldig forslag» bruker `pickDinner`.
- **Faste varer**: −/+ per vare i Uka, lagres i `qty` og brukes også fra Varer-fanen.
- **Egne faste varer** (`loadStaples`, `openNewStaple`): søk i Varer → «Lagre som fast vare» med kategori og
  «Nesten hver uke» (p 0.7, huket av i Uka) / «Av og til» (p 0.15). `STAPLES` i `app.js` er lokal `let` = data.js + `myStaples`.
- **Historikk** oppdateres når listen sendes/kopieres/deles (`exported()`), ikke når noe legges i kurven.

## Regler

- **Repoet er offentlig:** ingen barnenavn, ingen personlige detaljer i `data.js` eller annen kode. (Barna omtales som «ungene»/«Minsten».)
- Ingen eksterne avhengigheter eller CDN – alt skal virke offline etter første last.
- Ingen emojis i UI.
- Mobil først (390 px bredde), store trykkflater, ingen horisontal scroll.
- Bump `CACHE` i `sw.js` ved hver endring, ellers henter iPhone ikke ny versjon.
- Foreslå endringer før du skriver/committer.

## Test lokalt

```bash
python3 -m http.server 8765
# åpne http://localhost:8765 i mobilvisning (390x844)
```
Sjekk at konsollen er fri for feil, og at «Legg uka i handlekurven» gir forventet liste
(dag-tag på hovedvarer, antall slått sammen riktig). Snarvei-knappen kan kun testes på iPhone.

## Deploy

GitHub Pages fra `main` / root. Push til `main` → live innen 1–2 min.
På telefonen: lukk appen helt og åpne igjen for å få ny versjon.

## Mulige neste steg (ikke bestilt)

- Spørre «Tømme kurven?» etter sending, og advare hvis uka legges i kurven to ganger (antall summeres).
- «Angre» etter sending (historikk oppdateres i dag selv om snarveien avbrytes).
- Foreslå egne varer som er lagt inn flere ganger under «Egne varer».
- Felles historikk mellom telefonene (krever backend – avklar først, To Do skal fortsatt være felleslisten).
- Sesongvarer (17. mai, jul, grill).
