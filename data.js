// Generert fra «Handleliste 2026» i Microsoft To Do (6 729 varer, juni 2022 – okt 2026).
// Rediger fritt: legg til middager, endre varer eller frekvens.
//
// Middagspakker:
//   n    = varenavn (slik det skal stå i To Do)
//   q    = antall (valgfritt, standard 1)
//   opt  = true -> ikke huket av som standard (ting dere ofte har hjemme)
//   main = true -> får dag påført, f.eks. «Kjøttdeig (fredag)»
//   freq = antall uker siste 12 mnd. middagen dukket opp i listen
//   days = dager middagen typisk ligger (fra deres egne «(fredag)»-notater)

window.DINNERS = [
  { id: "taco", name: "Taco", freq: 10, days: ["fre"], items: [
    { n: "Kjøttdeig", main: true }, { n: "Taco lefser" }, { n: "Taco krydder", opt: true },
    { n: "Rømme" }, { n: "Salat" }, { n: "Paprika" }, { n: "Agurk" }, { n: "Mais" },
    { n: "Revet ost" }, { n: "Salsa" }, { n: "Tortilla chips", opt: true } ] },
  { id: "pizza", name: "Hjemmelaget pizza", freq: 12, days: ["fre", "lør"], items: [
    { n: "Pizzabunn", main: true }, { n: "Pizzasaus" }, { n: "Revet ost" }, { n: "Kjøttdeig" },
    { n: "Salami" }, { n: "Pepperoni", opt: true }, { n: "Paprika" }, { n: "Mais" }, { n: "Salat", opt: true } ] },
  { id: "grandis", name: "Grandiosa / frossenpizza", freq: 6, days: ["fre", "lør", "søn"], items: [
    { n: "Grandiosa", q: 2, main: true }, { n: "Salat", opt: true } ] },
  { id: "polser", name: "Pølser i brød", freq: 12, days: ["man", "tor"], items: [
    { n: "Pølser", main: true }, { n: "Pølsebrød" }, { n: "Ketsjup", opt: true },
    { n: "Sprøløk", opt: true }, { n: "Pomfri", opt: true } ] },
  { id: "spagetti", name: "Spagetti og kjøttsaus", freq: 9, days: ["man", "søn"], items: [
    { n: "Kjøttdeig", main: true }, { n: "Spagetti" }, { n: "Spagetti saus" },
    { n: "Revet ost" }, { n: "Salat", opt: true }, { n: "Kvitløksbrød", opt: true } ] },
  { id: "wok", name: "Wok med nudler", freq: 9, days: ["ons", "tor"], items: [
    { n: "Svinekjøtt", main: true }, { n: "Wok blanding" }, { n: "Nudler" },
    { n: "Soyasaus", opt: true }, { n: "Chili saus", opt: true } ] },
  { id: "carbonara", name: "Pasta carbonara", freq: 5, days: ["tir", "ons"], items: [
    { n: "Bacon", main: true }, { n: "Pasta" }, { n: "Carbonara saus" },
    { n: "Revet ost", opt: true }, { n: "Rundstykker", opt: true } ] },
  { id: "pesto", name: "Pesto-pasta med kyllingkjøttdeig", freq: 4, days: ["tir", "ons"], items: [
    { n: "Kylling kjøttdeig", main: true }, { n: "Pesto" }, { n: "Pasta" } ] },
  { id: "lasagne", name: "Lasagne", freq: 6, days: ["lør"], items: [
    { n: "Kjøttdeig lasagne", main: true }, { n: "Lasagneplater" }, { n: "Lasagnesaus" },
    { n: "Revet ost lasagne" }, { n: "Kvitløksbrød" }, { n: "Salat", opt: true } ] },
  { id: "hamburger", name: "Hamburger", freq: 6, days: ["lør", "ons"], items: [
    { n: "Hamburger", main: true }, { n: "Hamburgerbrød" }, { n: "Ost" }, { n: "Salat" },
    { n: "Pomfri" }, { n: "Ketsjup", opt: true }, { n: "Rømme", opt: true } ] },
  { id: "gyros", name: "Gyros i pita", freq: 3, days: ["fre"], items: [
    { n: "Gyros kjøtt", main: true }, { n: "Pita brød" }, { n: "Gyros dressing" },
    { n: "Salat" }, { n: "Paprika" }, { n: "Agurk" }, { n: "Mais" } ] },
  { id: "nachos", name: "Nachos", freq: 2, days: ["fre"], items: [
    { n: "Kjøttdeig", main: true }, { n: "Nachos chips" }, { n: "Rømme" }, { n: "Salsa" },
    { n: "Revet ost" }, { n: "Mais" } ] },
  { id: "kylling", name: "Kylling og ris", freq: 9, days: ["tir", "søn"], items: [
    { n: "Kylling filet", main: true }, { n: "Ris", opt: true }, { n: "Salat" },
    { n: "Paprika" }, { n: "Agurk" }, { n: "Rømme", opt: true } ] },
  { id: "tandoori", name: "Tandoori-kylling", freq: 1, days: ["tor"], items: [
    { n: "Kylling", main: true }, { n: "Tandoori pk" }, { n: "Nan brød" }, { n: "Ris", opt: true }, { n: "Salat" } ] },
  { id: "stektris", name: "Stekt ris", freq: 2, days: ["søn"], items: [
    { n: "Wok grønnsaker", main: true }, { n: "Egg", opt: true }, { n: "Skinka", opt: true }, { n: "Ris", opt: true } ] },
  { id: "svin", name: "Svinekoteletter", freq: 4, days: ["ons"], items: [
    { n: "Svinekoteletter", main: true }, { n: "Poteter" }, { n: "Wok grønnsaker", opt: true } ] },
  { id: "biff", name: "Biff, pomfri og bernaise", freq: 3, days: ["lør"], items: [
    { n: "Løvbiff", main: true }, { n: "Pomfri" }, { n: "Bernaisesaus" } ] },
  { id: "tomatsuppe", name: "Tomatsuppe", freq: 2, days: ["tir"], items: [
    { n: "Tomatsuppe", main: true }, { n: "Makaroni", opt: true }, { n: "Rundstykker" } ] },
  { id: "makaroni", name: "Makaroni og pølser", freq: 1, days: ["man"], items: [
    { n: "Pølser", main: true }, { n: "Makaroni" }, { n: "Revet ost", opt: true } ] },
  { id: "fiskepinner", name: "Fiskepinner og potetstappe", freq: 3, days: ["ons"], items: [
    { n: "Fiskepinner", main: true }, { n: "Potetstappe" } ] },
  { id: "fiskekaker", name: "Fiskekaker", freq: 1, days: ["man"], items: [
    { n: "Fiskekaker", main: true }, { n: "Poteter", opt: true }, { n: "Gulrøtter", opt: true } ] },
  { id: "pannekaker", name: "Pannekaker med bacon", freq: 4, days: ["søn"], items: [
    { n: "Bacon", main: true }, { n: "Mel", opt: true }, { n: "Melk" }, { n: "Egg" } ] },
  { id: "eggbacon", name: "Egg og bacon", freq: 1, days: ["ons"], items: [
    { n: "Bacon", main: true }, { n: "Egg" }, { n: "Bønner" } ] },
];

// Helgekos – egen pakke, ikke en middag
window.EXTRAS = [
  { id: "helgekos", name: "Helgekos", items: [
    { n: "Lørdagsgodt ungene" }, { n: "Chips" }, { n: "Dip" }, { n: "Cola bokser" },
    { n: "Sjokolade", opt: true }, { n: "Is", opt: true } ] },
  { id: "matpakke", name: "Frokost og matpakke", items: [
    { n: "Brød", q: 3 }, { n: "Smøre smør" }, { n: "Skinka" }, { n: "Salami" }, { n: "Graddost" },
    { n: "Leverpostei" }, { n: "Agurk" }, { n: "Melk", q: 2 } ] },
  { id: "minsten", name: "Minsten", items: [
    { n: "Bleier mini" }, { n: "Tørre kluter" }, { n: "Smoothie", opt: true }, { n: "Små yoghurter", opt: true } ] },
];

// Faste varer. p = andel av uker (siste 52) varen var på listen.
window.STAPLES = [
  { cat: "Meieri og egg", items: [
    { n: "Melk", p: .67, q: 2 }, { n: "Smøre smør", p: .44 }, { n: "Graddost", p: .31 }, { n: "Egg", p: .19 },
    { n: "Rømme", p: .19 }, { n: "Yoghurt", p: .19 }, { n: "Revet ost", p: .13 }, { n: "Små yoghurter", p: .1 },
    { n: "Brunost", p: .08 }, { n: "Vanilje kesam", p: .06 } ] },
  { cat: "Brød og pålegg", items: [
    { n: "Brød", p: .65, q: 3 }, { n: "Salami", p: .46 }, { n: "Skinka", p: .44 }, { n: "Leverpostei", p: .19 },
    { n: "Polarbrød", p: .17 }, { n: "Sjokolade pålegg", p: .13 }, { n: "Nugatti", p: .12 }, { n: "Servelat", p: .12 },
    { n: "Majones", p: .12 }, { n: "Makrell i tomat", p: .1 }, { n: "Honning på tube", p: .06 }, { n: "Knekkebrød", p: .05 } ] },
  { cat: "Frukt og grønt", items: [
    { n: "Agurk", p: .48 }, { n: "Eple", p: .23 }, { n: "Banan", p: .19 }, { n: "Mais", p: .19 },
    { n: "Salat", p: .15 }, { n: "Paprika", p: .15 }, { n: "Druer", p: .12 }, { n: "Appelsin", p: .08 },
    { n: "Frossen bringebær", p: .08 } ] },
  { cat: "Frokost og tørrvarer", items: [
    { n: "Frokostblanding", p: .13 }, { n: "Sukker", p: .13 }, { n: "Kaffi", p: .27 }, { n: "Havregryn", p: .08 },
    { n: "Granola", p: .08 }, { n: "Kjeks", p: .1 }, { n: "Ketsjup", p: .13 }, { n: "Mel", p: .04 }, { n: "Rosiner", p: .04 } ] },
  { cat: "Drikke og snacks", items: [
    { n: "Saft", p: .33 }, { n: "Chips", p: .38 }, { n: "Crush", p: .23 }, { n: "Eple juice", p: .15 },
    { n: "Cola bokser", p: .13 }, { n: "Brus", p: .12 }, { n: "Monster", p: .06 } ] },
  { cat: "Middag-basis", items: [
    { n: "Kjøttdeig", p: .31 }, { n: "Pølsebrød", p: .21 }, { n: "Pølser", p: .15 }, { n: "Bacon", p: .15 },
    { n: "Pomfri", p: .1 }, { n: "Pasta", p: .1 }, { n: "Spagetti", p: .1 } ] },
  { cat: "Hus og hygiene", items: [
    { n: "Toalettpapir", p: .4 }, { n: "Kroppsåpe", p: .27 }, { n: "Sminkefjerner", p: .17 }, { n: "Sjampo", p: .15 },
    { n: "Balsam", p: .1 }, { n: "Melange", p: .12 }, { n: "Zalo", p: .12 }, { n: "Glass spray", p: .1 },
    { n: "Oppvask tabletter", p: .08 }, { n: "Tørkerull", p: .05 }, { n: "Tannkrem oss", p: .1 },
    { n: "Deo", p: .1 }, { n: "Q-tips", p: .04 } ] },
  { cat: "Barn", items: [
    { n: "Bleier mini", p: .31 }, { n: "Tørre kluter", p: .21 }, { n: "Smoothie", p: .05 },
    { n: "Tannkrem barn", p: .04 } ] },
  { cat: "Voksne", items: [
    { n: "Snus", p: .33 }, { n: "Snus 2", p: .13 }, { n: "Øl", p: .05 } ] },
];

// Butikkrekkefølge for kurven og listen til To Do.
// names = eksakte varenavn, words = deler av ord for varer som ikke står i names.
// Varer som ikke treffer noe havner til slutt under «Resten».
window.AISLES = [
  { cat: "Frukt og grønt",
    names: ["agurk", "eple", "banan", "salat", "paprika", "druer", "appelsin", "poteter", "gulrøtter"],
    words: ["frukt", "grønt", "salat", "potet", "gulrot", "tomater", "brokkoli", "avokado", "sitron", "pære", "melon"] },
  { cat: "Kjøtt og pålegg",
    names: ["salami", "skinka", "servelat", "leverpostei", "pepperoni", "hamburger", "makrell i tomat", "gyros kjøtt"],
    words: ["kjøtt", "kylling", "biff", "bacon", "pølser", "kotelett", "svin", "kalkun", "pålegg"] },
  { cat: "Brød og frokost",
    names: ["pølsebrød", "hamburgerbrød", "rundstykker", "taco lefser", "frokostblanding", "granola", "havregryn",
      "sjokolade pålegg", "nugatti", "honning på tube"],
    words: ["brød", "rundstykk", "lefse", "frokost", "gryn", "müsli"] },
  { cat: "Meieri",
    names: ["melk", "smøre smør", "graddost", "egg", "rømme", "yoghurt", "små yoghurter", "brunost", "vanilje kesam",
      "revet ost", "revet ost lasagne", "ost"],
    words: ["melk", "yoghurt", "rømme", "smør", "kesam", "fløte", "ost"] },
];
