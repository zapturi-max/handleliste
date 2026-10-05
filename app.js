(() => {
"use strict";
const $ = s => document.querySelector(s);
const el = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v; else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat()) if (k != null) e.append(k.nodeType ? k : document.createTextNode(k));
  return e;
};
const store = {
  get(k, d) { try { const v = localStorage.getItem("hl." + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("hl." + k, JSON.stringify(v)); } catch {} },
};

const DAYS = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];
const DAY_LONG = { man: "mandag", tir: "tirsdag", ons: "onsdag", tor: "torsdag", fre: "fredag", lør: "lørdag", søn: "søndag" };
const WEEK = 7 * 864e5;
const norm = s => s.toLowerCase().replace(/\(.*?\)/g, "").replace(/^\d+\s*x\s*/, "").replace(/\s*x\s*\d+$/, "")
  .replace(/[^a-zæøå0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
// Middager = data.js + egne endringer på denne telefonen (hl.myDinners: id -> middag, hl.hidden: skjulte id-er)
let myDinners = store.get("myDinners", {}), hidden = store.get("hidden", []);
let DINNERS = [];
function loadDinners() {
  const base = window.DINNERS.map(d => myDinners[d.id] || d);
  const own = Object.values(myDinners).filter(d => !window.DINNERS.some(b => b.id === d.id));
  DINNERS = [...base, ...own].filter(d => !hidden.includes(d.id));
}
loadDinners();
const dinnerById = id => [...DINNERS, ...EXTRAS].find(d => d.id === id);

// Butikkrekkefølge (AISLES i data.js); ukjente varer til slutt
function aisleOf(n) {
  const k = norm(n);
  let i = AISLES.findIndex(a => a.names.includes(k));
  if (i < 0) i = AISLES.findIndex(a => a.words.some(w => k.includes(w)));
  return i < 0 ? AISLES.length : i;
}
const aisleName = i => AISLES[i]?.cat || "Resten";
const sortedBasket = () => basket.map((b, i) => ({ b, i, a: aisleOf(b.n) })).sort((x, y) => x.a - y.a || x.i - y.i);

// ---------- state ----------
let basket = store.get("basket", []);        // [{n, q, tag?, from?}]
let history = store.get("history", { d: {}, s: {} }); // sist sendt: d=middag-id, s=vare-navn -> ms
let planDays = store.get("planDays", ["man", "tir", "ons", "fre", "lør"]);
let plan = store.get("plan", null);          // {week, rows:[{day,id}]}
let qty = store.get("qty", {});
let reverse = store.get("reverse", false);     // snu rekkefølgen til To Do hvis nye oppgaver havner øverst              // valgt antall per fast vare: norm(navn) -> q

const stapleQty = s => qty[norm(s.n)] || s.q || 1;

function saveBasket() { store.set("basket", basket); renderBadge(); if ($("#tab-kurv").classList.contains("active")) renderBasket(); renderStapleChipsState(); }
function addItem(n, q = 1, tag = null, from = null) {
  const key = norm(n), same = basket.filter(b => norm(b.n) === key);
  const hit = tag ? same.find(b => b.tag === tag) : same.find(b => !b.tag);
  if (hit) { hit.q += q; if (from) hit.from = [...new Set([...(hit.from || []), from])]; }
  else basket.push({ n: cap(n.trim()), q, tag, from: from ? [from] : [] });
}
function itemTitle(b) { return (b.q > 1 ? b.q + "x " : "") + b.n + (b.tag ? ` (${b.tag})` : ""); }

// ---------- week ----------
function mondayOf(d = new Date()) { const m = new Date(d); m.setHours(0, 0, 0, 0); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return m; }
const weekKey = () => mondayOf().toISOString().slice(0, 10);
function weekLabel() {
  const m = mondayOf(), n = new Date(m.getTime() + WEEK), f = d => d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
  const wn = (() => { const t = new Date(Date.UTC(m.getFullYear(), m.getMonth(), m.getDate() + 3)); const j = new Date(Date.UTC(t.getUTCFullYear(), 0, 4)); return 1 + Math.round(((t - j) / 864e5 - 3 + ((j.getUTCDay() + 6) % 7)) / 7); })();
  return `Uke ${wn} · mandag ${f(m)} – mandag ${f(n)}`;
}

// ---------- suggestions ----------
function weeksSince(ts) { return ts ? (Date.now() - ts) / WEEK : Infinity; }
function pickDinner(day, exclude) {
  const cands = DINNERS.filter(d => !exclude.has(d.id)).map(d => {
    let w = Math.max(d.freq, 0.7);
    w *= d.days.includes(day) ? 4 : 0.3;
    const ws = weeksSince(history.d[d.id]);
    if (ws < 1) w *= 0.05; else if (ws < 2.5) w *= 0.35;
    return [d, w];
  });
  let r = Math.random() * cands.reduce((a, [, w]) => a + w, 0);
  for (const [d, w] of cands) { if ((r -= w) <= 0) return d; }
  return cands[0][0];
}
function makePlan() {
  const used = new Set(), rows = [];
  for (const day of DAYS.filter(d => planDays.includes(d))) { const d = pickDinner(day, used); used.add(d.id); rows.push({ day, id: d.id }); }
  plan = { week: weekKey(), rows }; store.set("plan", plan);
}
function stapleSuggestions() {
  const out = [];
  for (const c of STAPLES) for (const s of c.items) {
    const interval = 1 / s.p, ws = weeksSince(history.s[norm(s.n)]);
    const due = ws !== Infinity && ws >= interval * 0.85;
    const never = ws === Infinity;
    const on = s.p >= 0.3 ? ws >= 0.8 : due || (never && s.p >= 0.25);
    const show = on || s.p >= 0.15 || due;
    if (show) out.push({ ...s, on, due, ws });
  }
  return out.sort((a, b) => (b.on - a.on) || (b.p - a.p));
}

// ---------- render: Uke ----------
function renderPlan() {
  if (!plan || plan.week !== weekKey() || plan.rows.length !== planDays.length || plan.rows.some(r => !planDays.includes(r.day) || !dinnerById(r.id))) makePlan();
  const days = $("#planDays"); days.replaceChildren(...DAYS.map(d => el("button", {
    class: "chip" + (planDays.includes(d) ? " on" : ""), onclick: () => {
      planDays = planDays.includes(d) ? planDays.filter(x => x !== d) : [...planDays, d];
      store.set("planDays", planDays); makePlan(); renderPlan();
    } }, cap(d))));
  const list = $("#planList");
  if (!plan.rows.length) { list.replaceChildren(el("p", { class: "empty" }, "Ingen dager valgt.")); return; }
  list.replaceChildren(...plan.rows.map((r, i) => {
    const d = dinnerById(r.id), last = history.d[r.id];
    return el("div", { class: "plan-row" },
      el("div", { class: "d" }, cap(r.day)),
      el("div", { class: "n", onclick: () => openDinnerPicker(i) }, d.name,
        el("small", {}, last ? `Sist: ${Math.round(weeksSince(last))} uker siden` : d.items.filter(x => !x.opt).map(x => x.n).slice(0, 4).join(", "))),
      el("button", { class: "icon-btn", onclick: () => openDinnerPicker(i) }, "Bytt"));
  }));
}
// Helgemiddag = typiske dager kun fre/lør/søn
const isWeekend = d => d.days.every(x => ["fre", "lør", "søn"].includes(x));
function openDinnerPicker(i) {
  const r = plan.rows[i];
  const choose = id => { plan.rows[i].id = id; store.set("plan", plan); closeSheet(); renderPlan(); };
  const usedOn = id => plan.rows.find((x, j) => j !== i && x.id === id)?.day;
  const pick = d => {
    const other = usedOn(d.id), last = history.d[d.id];
    return el("button", { class: "pick" + (d.id === r.id ? " on" : ""), onclick: () => choose(d.id) },
      el("span", {}, d.name),
      el("small", {}, other ? `Satt på ${DAY_LONG[other]}` : last ? `${Math.round(weeksSince(last))} u. siden` : ""));
  };
  const sect = (title, list) => [el("h3", { class: "sect" }, title), ...[...list].sort((a, b) => b.freq - a.freq).map(pick)];
  const helg = sect("Helgemiddager", DINNERS.filter(isWeekend)), hverdag = sect("Hverdagsmiddager", DINNERS.filter(d => !isWeekend(d)));
  const random = () => { const ex = new Set(plan.rows.map(x => x.id)); choose(pickDinner(r.day, ex).id); };
  openSheet(el("div", {}, el("h2", {}, `Middag ${DAY_LONG[r.day]}`),
    ...(["fre", "lør", "søn"].includes(r.day) ? [...helg, ...hverdag] : [...hverdag, ...helg]),
    el("div", { class: "actions" },
      el("button", { class: "ghost", onclick: closeSheet }, "Avbryt"),
      el("button", { class: "ghost", onclick: random }, "Tilfeldig forslag"))));
}
function renderStapleSuggest() {
  const wrap = $("#stapleSuggest"), sug = stapleSuggestions();
  const on = sug.filter(s => s.on).length;
  const rows = sug.map((s, i) => {
    const cb = el("input", { type: "checkbox", "data-n": s.n, "data-q": stapleQty(s), checked: s.on });
    const num = el("span", {}, stapleQty(s));
    // Husker valgt antall per vare; trykk på −/+ skal ikke hake av/på raden
    const step = d => e => {
      e.preventDefault();
      const q = Math.max(1, +cb.dataset.q + d);
      cb.dataset.q = num.textContent = q; qty[norm(s.n)] = q; store.set("qty", qty);
    };
    return el("label", { class: "row", style: i >= on + 6 ? "display:none" : null }, cb,
      el("span", {}, s.n),
      el("span", { class: "meta" }, s.ws !== Infinity ? `${Math.round(s.ws)} u. siden` : `${Math.round(s.p * 100)} % av ukene`),
      el("div", { class: "qty" },
        el("button", { type: "button", onclick: step(-1), "aria-label": "Færre" }, "−"), num,
        el("button", { type: "button", onclick: step(1), "aria-label": "Flere" }, "+")));
  });
  wrap.replaceChildren(...rows);
  if (rows.length > on + 6) wrap.append(el("button", { class: "ghost", onclick: e => { rows.forEach(r => r.style.display = ""); e.currentTarget.remove(); } }, `Vis ${rows.length - on - 6} flere`));
}
$("#replanBtn").onclick = () => { makePlan(); renderPlan(); };
$("#planToBasket").onclick = () => {
  let n = 0;
  for (const r of plan.rows) { const d = dinnerById(r.id); for (const it of d.items) if (!it.opt) { addItem(it.n, it.q || 1, it.main ? DAY_LONG[r.day] : null, d.name); n++; } }
  document.querySelectorAll("#stapleSuggest input:checked").forEach(c => { addItem(c.dataset.n, +c.dataset.q, null, "Faste varer"); n++; });
  if ($("#kosToggle").checked) for (const it of dinnerById("helgekos").items) if (!it.opt) { addItem(it.n, 1, null, "Helgekos"); n++; }
  saveBasket(); toast(`${n} varer lagt i kurven`); switchTab("kurv");
};

// ---------- render: Middager ----------
function tile(d) {
  return el("button", { class: "tile", onclick: () => openPackage(d) },
    el("b", {}, d.name),
    el("span", {}, d.items.filter(x => !x.opt).map(x => x.n).join(", ")),
    d.freq != null ? el("div", { class: "ins" }, `${d.freq} uker siste år`) : null);
}
function renderDinners() {
  $("#newDinner").onclick = () => openEditor(null);
  $("#dinnerGrid").replaceChildren(...[...DINNERS].sort((a, b) => b.freq - a.freq).map(tile));
  $("#extraGrid").replaceChildren(...EXTRAS.map(tile));
}
function openPackage(d) {
  let day = null;
  const isDinner = DINNERS.includes(d);
  const dayRow = isDinner ? el("div", { class: "days" }, ...DAYS.map(x => el("button", { class: "chip", onclick: e => {
    day = day === x ? null : x; e.currentTarget.parentNode.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c.textContent.toLowerCase() === day));
  } }, cap(x)))) : null;
  const rows = d.items.map(it => el("label", { class: "row" },
    el("input", { type: "checkbox", checked: !it.opt, "data-n": it.n, "data-q": it.q || 1, "data-main": it.main ? 1 : "" }),
    el("span", {}, (it.q > 1 ? it.q + "x " : "") + it.n), it.opt ? el("span", { class: "meta" }, "ofte hjemme") : null));
  openSheet(el("div", {},
    el("h2", {}, d.name),
    isDinner ? el("p", { class: "hint" }, "Dag (valgfritt) – påføres hovedvaren, slik dere pleier: «Kjøttdeig (fredag)».") : null,
    dayRow, ...rows,
    el("div", { class: "actions" },
      isDinner ? el("button", { class: "ghost", onclick: () => openEditor(d) }, "Rediger") : el("button", { class: "ghost", onclick: closeSheet }, "Avbryt"),
      el("button", { class: "primary", onclick: () => {
        let n = 0;
        $("#sheet").querySelectorAll("input:checked").forEach(c => { addItem(c.dataset.n, +c.dataset.q, c.dataset.main && day ? DAY_LONG[day] : null, d.name); n++; });
        if (isDinner) basket.forEach(b => b.from && b.from.includes(d.name) && (b.dinner = d.id));
        saveBasket(); closeSheet(); toast(`${d.name}: ${n} varer i kurven`);
      } }, "Legg i kurv"))));
}

// ---------- rediger middag ----------
function openEditor(orig) {
  const isBase = orig && window.DINNERS.some(b => b.id === orig.id);
  const days = new Set(orig ? orig.days : []);
  const items = orig ? orig.items.map(it => ({ ...it })) : [{ n: "", main: true }];
  const name = el("input", { class: "field", placeholder: "Navn på middagen", value: orig ? orig.name : "" });
  const dayRow = el("div", { class: "days" }, ...DAYS.map(x => el("button", { type: "button", class: "chip" + (days.has(x) ? " on" : ""), onclick: e => {
    days.has(x) ? days.delete(x) : days.add(x); e.currentTarget.classList.toggle("on", days.has(x));
  } }, cap(x))));
  const list = el("div", {});
  const flag = (it, k, label) => el("button", { type: "button", class: "chip" + (it[k] ? " on" : ""), onclick: e => { it[k] = !it[k]; e.currentTarget.classList.toggle("on", it[k]); } }, label);
  const drawItems = () => list.replaceChildren(...items.map((it, i) => {
    const num = el("span", {}, it.q || 1);
    const step = d => () => { it.q = Math.max(1, (it.q || 1) + d); num.textContent = it.q; };
    return el("div", { class: "edit-item" },
      el("div", { class: "edit-top" },
        el("input", { class: "field", placeholder: "Vare", value: it.n, oninput: e => it.n = e.target.value }),
        el("button", { type: "button", class: "icon-btn", "aria-label": "Fjern vare", onclick: () => { items.splice(i, 1); drawItems(); } }, "Fjern")),
      el("div", { class: "edit-flags" }, flag(it, "main", "Hovedvare"), flag(it, "opt", "Ofte hjemme"),
        el("div", { class: "qty" }, el("button", { type: "button", onclick: step(-1), "aria-label": "Færre" }, "−"), num,
          el("button", { type: "button", onclick: step(1), "aria-label": "Flere" }, "+"))));
  }));
  drawItems();
  const save = () => {
    const clean = items.filter(it => it.n.trim()).map(it => {
      const o = { n: cap(it.n.trim()) };
      if (it.q > 1) o.q = it.q; if (it.main) o.main = true; if (it.opt) o.opt = true; return o;
    });
    if (!name.value.trim()) return toast("Gi middagen et navn");
    if (!clean.length) return toast("Legg til minst én vare");
    const id = orig ? orig.id : "egen-" + Date.now().toString(36);
    myDinners[id] = { id, name: name.value.trim(), freq: orig ? orig.freq : 4, days: DAYS.filter(x => days.has(x)), items: clean };
    store.set("myDinners", myDinners); loadDinners(); renderDinners(); renderPlan(); closeSheet(); toast("Lagret");
  };
  const remove = () => {
    if (!confirm(`Slette «${orig.name}» på denne telefonen?`)) return;
    delete myDinners[orig.id]; if (isBase) hidden.push(orig.id);
    store.set("myDinners", myDinners); store.set("hidden", hidden); loadDinners(); renderDinners(); renderPlan(); closeSheet(); toast("Slettet");
  };
  const reset = () => { delete myDinners[orig.id]; store.set("myDinners", myDinners); loadDinners(); renderDinners(); renderPlan(); closeSheet(); toast("Tilbakestilt"); };
  openSheet(el("div", {},
    el("h2", {}, orig ? "Rediger middag" : "Ny middag"),
    name,
    el("h3", { class: "sect" }, "Typiske dager"), dayRow,
    el("h3", { class: "sect" }, "Varer"),
    el("p", { class: "hint" }, "Hovedvare får dagen påført, f.eks. «Kjøttdeig (fredag)». Ofte hjemme er ikke huket av som standard."),
    list,
    el("button", { type: "button", class: "ghost", onclick: () => { items.push({ n: "" }); drawItems(); list.lastChild.querySelector("input").focus(); } }, "Legg til vare"),
    el("div", { class: "actions" },
      el("button", { class: "ghost", onclick: closeSheet }, "Avbryt"),
      el("button", { class: "primary", onclick: save }, "Lagre")),
    orig ? el("div", { class: "actions" },
      el("button", { class: "link", onclick: remove }, "Slett middag"),
      isBase && myDinners[orig.id] ? el("button", { class: "link", onclick: reset }, "Tilbakestill til standard") : null) : null,
    hidden.length && !orig ? el("button", { class: "link", onclick: () => { hidden = []; store.set("hidden", hidden); loadDinners(); renderDinners(); closeSheet(); toast("Slettede standardmiddager er tilbake"); } }, `Hent tilbake ${hidden.length} slettede standardmiddager`) : null));
}

// ---------- render: Varer ----------
function renderStaples(filter = "") {
  const f = norm(filter), wrap = $("#stapleCats");
  const cats = STAPLES.map(c => ({ cat: c.cat, items: c.items.filter(i => !f || norm(i.n).includes(f)) })).filter(c => c.items.length);
  const kids = cats.map(c => el("div", { class: "cat" }, el("h3", {}, c.cat),
    el("div", { class: "chips" }, ...[...c.items].sort((a, b) => b.p - a.p).map(i => el("button", { class: "chip", "data-n": i.n, onclick: () => { addItem(i.n, stapleQty(i), null, "Faste varer"); saveBasket(); toast(`+ ${i.n}`); } }, i.n)))));
  if (f) kids.unshift(el("button", { class: "ghost", style: "margin-bottom:12px", onclick: () => { addItem(filter, 1); saveBasket(); toast(`+ ${cap(filter)}`); $("#stapleSearch").value = ""; renderStaples(); } }, `Legg til «${cap(filter.trim())}»`));
  wrap.replaceChildren(...kids); renderStapleChipsState();
}
function renderStapleChipsState() {
  document.querySelectorAll("#stapleCats .chip").forEach(c => {
    const b = basket.find(x => norm(x.n) === norm(c.dataset.n));
    c.classList.toggle("in", !!b); c.querySelector(".q")?.remove();
    if (b) c.append(el("span", { class: "q" }, "×" + b.q));
  });
}
$("#stapleSearch").addEventListener("input", e => renderStaples(e.target.value));
$("#stapleSearch").addEventListener("keydown", e => { if (e.key === "Enter" && e.target.value.trim()) { addItem(e.target.value, 1); saveBasket(); toast(`+ ${cap(e.target.value.trim())}`); e.target.value = ""; renderStaples(); } });

// ---------- render: Kurv ----------
function renderBadge() { const b = $("#badge"); b.textContent = basket.length; b.classList.toggle("zero", !basket.length); }
function renderBasket() {
  const ul = $("#basketList");
  if (!basket.length) { ul.replaceChildren(el("li", { class: "empty" }, "Kurven er tom. Trykk på en middag eller en vare.")); return; }
  let last = -1;
  ul.replaceChildren(...sortedBasket().flatMap(({ b, i, a }) => {
    const head = a !== last ? el("li", { class: "aisle" }, aisleName(a)) : null; last = a;
    return [head, el("li", {},
      el("div", { class: "t" }, b.n + (b.tag ? ` (${b.tag})` : ""),
        el("small", {}, (b.from || []).join(" · "))),
      el("div", { class: "qty" },
        el("button", { onclick: () => { b.q > 1 ? b.q-- : basket.splice(i, 1); saveBasket(); renderBasket(); }, "aria-label": "Færre" }, "−"),
        el("span", {}, b.q),
        el("button", { onclick: () => { b.q++; saveBasket(); renderBasket(); }, "aria-label": "Flere" }, "+")))].filter(Boolean);
  }));
  const rev = $("#reverseToggle"); rev.checked = reverse;
  rev.onchange = () => { reverse = rev.checked; store.set("reverse", reverse); };
}
$("#addOwn").onsubmit = e => { e.preventDefault(); const v = $("#ownInput").value.trim(); if (!v) return; addItem(v); $("#ownInput").value = ""; saveBasket(); renderBasket(); };
$("#clearBtn").onclick = () => { if (basket.length && confirm("Tømme handlekurven?")) { basket = []; saveBasket(); renderBasket(); } };

function recordHistory(items) {
  const now = Date.now();
  for (const b of items) { history.s[norm(b.n)] = now; for (const f of b.from || []) { const d = DINNERS.find(x => x.name === f); if (d) history.d[d.id] = now; } }
  store.set("history", history);
}

// ---------- tabs / sheet / toast ----------
function switchTab(t) {
  document.querySelectorAll(".tab").forEach(s => s.classList.toggle("active", s.id === "tab-" + t));
  document.querySelectorAll(".tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === t));
  if (t === "kurv") renderBasket();
  if (t === "uke") { renderPlan(); renderStapleSuggest(); }
  window.scrollTo(0, 0);
}
document.querySelectorAll(".tabs button").forEach(b => b.onclick = () => switchTab(b.dataset.tab));
function openSheet(content) { $("#sheet").replaceChildren(content); $("#sheet").classList.add("open"); $("#sheetBg").classList.add("open"); }
function closeSheet() { $("#sheet").classList.remove("open"); $("#sheetBg").classList.remove("open"); }
$("#sheetBg").onclick = closeSheet;
let toastT; function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200); }

// ---------- eksport ----------
const listText = () => { const l = sortedBasket().map(x => itemTitle(x.b)); return (reverse ? l.reverse() : l).join("\n"); };
function exported() { recordHistory(basket); store.set("lastExport", Date.now()); renderPlan(); renderStapleSuggest(); }
// Snarveien «Handleliste» deler opp teksten per linje og legger hver vare i To Do
$("#sendBtn").onclick = () => {
  if (!basket.length) return toast("Kurven er tom");
  location.href = "shortcuts://run-shortcut?name=Handleliste&input=text&text=" + encodeURIComponent(listText());
  exported();
};
$("#copyBtn").onclick = async () => {
  if (!basket.length) return toast("Kurven er tom");
  try { await navigator.clipboard.writeText(listText()); exported(); toast("Kopiert"); }
  catch { openSheet(el("div", {}, el("h2", {}, "Kopier listen"), el("p", { class: "hint" }, "Marker alt og kopier."), el("textarea", { style: "width:100%;height:50vh" }, listText()))); exported(); }
};
$("#shareBtn").onclick = async () => {
  if (!basket.length) return toast("Kurven er tom");
  if (navigator.share) { try { await navigator.share({ text: listText() }); exported(); } catch {} }
  else toast("Deling støttes ikke her – bruk Kopier");
};
// ---------- start ----------
$("#weekLabel").textContent = weekLabel();
renderBadge(); renderPlan(); renderStapleSuggest(); renderDinners(); renderStaples();
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js");
})();
