/* STAV APLIKACE + ROUTING */

const appState = {
  section: "dashboard",     // dashboard | stanoviste | denni | admin | form
  stanicaId: null,
  denAktualni: DNES,
  adminTab: "stanoviste",   // stanoviste | logy | typy | stavy-techniky | stavy-zaznamu
  formKontext: null,
  formDirty: false,         // rozpracovaný formulář
  zaznamFiltry: {},         // filtry (rok / řazení) pro tabulky poruch a závad
  novaPorouchyBloky: null,
  novyZaznamKlic: null,
  modalZaznamKontext: null,
};

/* Hashe formulářů */
function hashPridatProstredek(sid) { return `#/stanoviste/${sid}/prostredky/novy`; }
function hashUpravitProstredek(sid, pid) { return `#/stanoviste/${sid}/prostredky/upravit/${pid}`; }
function hashPridatPohotovost(sid) { return `#/stanoviste/${sid}/pohotovosti/novy`; }
function hashUpravitPohotovost(sid, idx) { return `#/stanoviste/${sid}/pohotovosti/upravit/${idx}`; }
function hashPridatUdalost(sid, datum) { return `#/stanoviste/${sid}/denni/${datum}/novy`; }
function hashUpravitUdalost(sid, datum, idx) { return `#/stanoviste/${sid}/denni/${datum}/upravit/${idx}`; }
function hashPridatZaznam(kategorie, sid, pid) { return `#/stanoviste/${sid}/${kategorie === "porucha" ? "poruchy" : "zavady"}/${pid}/novy`; }
function hashUpravitZaznam(kategorie, sid, pid, zid) { return `#/stanoviste/${sid}/${kategorie === "porucha" ? "poruchy" : "zavady"}/${pid}/upravit/${zid}`; }
function hashTisk(kategorie, sid, pid, zid) { return `#/stanoviste/${sid}/${kategorie === "porucha" ? "poruchy" : "zavady"}/${pid}/tisk/${zid}`; }
function hashPridatStanici() { return `#/admin/stanoviste/novy`; }
function hashUpravitStanici(sid) { return `#/admin/stanoviste/upravit/${sid}`; }
function hashPridatOsobu() { return `#/admin/osoby/novy`; }
function hashUpravitOsobu(id) { return `#/admin/osoby/upravit/${id}`; }

function computeHash(section, extra) {
  extra = extra || {};
  if (section === "stanoviste") return `#/stanoviste/${extra.stanicaId}`;
  if (section === "denni") return "#/denni";
  if (section === "admin") return `#/admin/${extra.adminTab || "stanoviste"}`;
  return "#/dashboard";
}

function applyHash() {
  const hash = window.location.hash || "#/dashboard";
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  appState.formKontext = null;

  if (parts[0] === "stanoviste" && parts[1] && getStanice(parts[1])) {
    const stanicaId = Number(parts[1]);
    // Reset na DNES při přepnutí stanoviště
    if (appState.stanicaId !== stanicaId) {
      appState.denAktualni = DNES;
    }
    appState.stanicaId = stanicaId;

    if (parts.length === 2) {
      appState.section = "stanoviste";
    } else {
      const sekce = parts[2];
      if (sekce === "prostredky" && parts[3] === "novy") {
        appState.section = "form";
        appState.formKontext = { typ: "prostredek", akce: "novy", stanicaId };
      } else if (sekce === "prostredky" && parts[3] === "upravit" && parts[4]) {
        appState.section = "form";
        appState.formKontext = { typ: "prostredek", akce: "upravit", stanicaId, prostredekId: Number(parts[4]) };
      } else if (sekce === "pohotovosti" && parts[3] === "novy") {
        appState.section = "form";
        appState.formKontext = { typ: "pohotovost", akce: "novy", stanicaId };
      } else if (sekce === "pohotovosti" && parts[3] === "upravit" && parts[4] !== undefined) {
        appState.section = "form";
        appState.formKontext = { typ: "pohotovost", akce: "upravit", stanicaId, index: Number(parts[4]) };
      } else if (sekce === "denni" && parts[3] && parts[4] === "novy") {
        appState.section = "form";
        appState.formKontext = { typ: "denni", akce: "novy", stanicaId, datum: parts[3] };
      } else if (sekce === "denni" && parts[3] && parts[4] === "upravit" && parts[5] !== undefined) {
        appState.section = "form";
        appState.formKontext = { typ: "denni", akce: "upravit", stanicaId, datum: parts[3], index: Number(parts[5]) };
      } else if ((sekce === "poruchy" || sekce === "zavady") && parts[3] && parts[4] === "tisk" && parts[5]) {
        appState.section = "form";
        appState.formKontext = { typ: "tiskZaznam", stanicaId, kategorie: sekce === "poruchy" ? "porucha" : "zavada", prostredekId: Number(parts[3]), zaznamId: parts[5] };
      } else if ((sekce === "poruchy" || sekce === "zavady") && parts[3] && parts[4] === "novy") {
        appState.section = "form";
        appState.formKontext = { typ: "zaznam", akce: "novy", stanicaId, kategorie: sekce === "poruchy" ? "porucha" : "zavada", prostredekId: Number(parts[3]) };
      } else if ((sekce === "poruchy" || sekce === "zavady") && parts[3] && parts[4] === "upravit" && parts[5]) {
        appState.section = "form";
        appState.formKontext = { typ: "zaznam", akce: "upravit", stanicaId, kategorie: sekce === "poruchy" ? "porucha" : "zavada", prostredekId: Number(parts[3]), zaznamId: parts[5] };
      } else {
        appState.section = "stanoviste";
      }
    }
  } else if (parts[0] === "denni") {
    appState.section = "denni";
  } else if (parts[0] === "admin") {
    if (parts[1] === "stanoviste" && parts[2] === "novy") {
      appState.section = "form";
      appState.formKontext = { typ: "stanice", akce: "novy" };
      appState.adminTab = "stanoviste";
    } else if (parts[1] === "stanoviste" && parts[2] === "upravit" && parts[3]) {
      appState.section = "form";
      appState.formKontext = { typ: "stanice", akce: "upravit", stanicaId: Number(parts[3]) };
      appState.adminTab = "stanoviste";
    } else if (parts[1] === "osoby" && parts[2] === "novy") {
      appState.section = "form";
      appState.formKontext = { typ: "osoba", akce: "novy" };
      appState.adminTab = "osoby";
    } else if (parts[1] === "osoby" && parts[2] === "upravit" && parts[3]) {
      appState.section = "form";
      appState.formKontext = { typ: "osoba", akce: "upravit", osobaId: Number(parts[3]) };
      appState.adminTab = "osoby";
    } else if (SADY_TAXONOMII.includes(parts[1]) && parts[2] === "novy") {
      appState.section = "form";
      appState.formKontext = { typ: "taxonomie", akce: "novy", sada: parts[1] };
      appState.adminTab = parts[1];
    } else if (SADY_TAXONOMII.includes(parts[1]) && parts[2] === "upravit" && parts[3]) {
      appState.section = "form";
      appState.formKontext = { typ: "taxonomie", akce: "upravit", sada: parts[1], klic: parts[3] };
      appState.adminTab = parts[1];
    } else {
      appState.section = "admin";
      appState.adminTab = ["logy", "osoby", ...SADY_TAXONOMII].includes(parts[1]) ? parts[1] : "stanoviste";
    }
  } else {
    appState.section = "dashboard";
  }
  render();
}

function navigateHash(hash) {
  const goNow = () => {
    appState.formDirty = false;
    appState.novaPorouchyBloky = null;
    appState.novyZaznamKlic = null;
    if (window.location.hash === hash) {
      applyHash();
    } else {
      window.location.hash = hash;
    }
    if (window.innerWidth < 992) {
      const oc = bootstrap.Offcanvas.getInstance(document.getElementById("sidebarOffcanvas"));
      if (oc) oc.hide();
    }
  };

  if (appState.formDirty) {
    const modalEl = document.getElementById("unsavedModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    const btn = document.getElementById("unsavedDiscardBtn");
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener("click", () => {
      modal.hide();
      goNow();
    });
    modal.show();
    return;
  }
  goNow();
}

function navigate(section, extra) {
  navigateHash(computeHash(section, extra));
}

window.addEventListener("hashchange", applyHash);

/* FORMULÁŘ – dispečer */

function renderForm() {
  const ctx = appState.formKontext;
  if (!ctx) { navigate("dashboard"); return; }
  if (ctx.typ === "prostredek") renderFormProstredek(ctx);
  else if (ctx.typ === "pohotovost") renderFormPohotovost(ctx);
  else if (ctx.typ === "denni") renderFormDenni(ctx);
  else if (ctx.typ === "zaznam") renderFormZaznam(ctx);
  else if (ctx.typ === "tiskZaznam") renderTisk(ctx);
  else if (ctx.typ === "stanice") renderFormStanice(ctx);
  else if (ctx.typ === "osoba") renderFormOsoba(ctx);
  else if (ctx.typ === "taxonomie") renderFormTaxonomie(ctx);
  else navigate("dashboard");
}

/* RENDER / ROUTER */

function render() {
  renderSidebar();
  renderBreadcrumb();

  switch (appState.section) {
    case "stanoviste": renderStanoviste(); break;
    case "denni":       renderDenniPrehled(); break;
    case "admin":       renderAdmin(); break;
    case "form":        renderForm(); break;
    default:            renderDashboard();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  zkontrolujDokonceneServisy();
  if (!window.location.hash) {
    window.location.hash = "#/dashboard";
  } else {
    applyHash();
  }
});
