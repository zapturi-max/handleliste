# Handleliste

En liten web-app for familiens ukehandel, bygget på fire års historikk fra «Handleliste 2026» i Microsoft To Do (6 729 varer).

- **Uka**: forslag til middager for de dagene dere velger, ut fra hvor ofte og hvilke dager dere pleier å spise dem. I tillegg faste varer med «nesten hver uke» ferdig huket av.
- **Middager**: ferdige middagspakker. Trykk, velg dag om du vil, og legg i kurven.
- **Varer**: faste varer gruppert etter kategori, med ett trykk per vare.
- **Kurv**: juster antall, og trykk **Send til To Do**. Det kjører iOS-snarveien «Handleliste», som legger hver vare inn som egen oppgave i «Handleliste 2026». **Kopier liste** og **Del …** finnes som reserve.

Ingen innlogging og ingen server. Kurv, historikk og valgt antall lagres lokalt på hver telefon.

## iOS-snarveien «Handleliste»
Må finnes på hver telefon, med nøyaktig dette navnet:
1. Del opp *Snarvei-inndata* etter *Nye linjer*
2. Gjenta med hvert objekt i *Del opp tekst*
3. To Do: Legg til *Gjentatt objekt* i *Handleliste 2026*

Bytter To Do-listen navn, oppdateres snarveien – ikke appen.

## Endre middager og varer
Rediger `data.js` direkte på GitHub (blyant-ikonet). Etter commit oppdaterer GitHub Pages seg innen et minutt.

## Publisering
Settings → Pages → Deploy from a branch → `main` / `(root)`.
iPhone: åpne siden i Safari → Del → «Legg til på Hjem-skjerm».
