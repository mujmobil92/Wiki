/* ADMINISTRACE */

function renderAdmin() {
  document.getElementById("app").innerHTML = `
    <h4 class="mb-1">Administrace</h4>
    <div class="text-muted mb-4">${renderAdminPopisek()}</div>
    <div id="adminObsah"></div>
  `;

  if (appState.adminTab === "logy") renderAdminLogy();
  else if (appState.adminTab === "stanoviste") renderAdminStanoviste();
  else if (appState.adminTab === "osoby") renderAdminOsoby();
  else if (SADY_TAXONOMII.includes(appState.adminTab)) renderAdminTaxonomie(appState.adminTab);
  else renderAdminStanoviste();
}

function renderAdminPopisek() {
  if (appState.adminTab === "logy") return "Záznam všech změn provedených v systému.";
  if (appState.adminTab === "stanoviste") return "Přidávání, úprava a odebírání stanovišť. Prostředky, pohotovosti a denní záznamy se spravují přímo v detailu daného stanoviště.";
  if (appState.adminTab === "osoby") return "Registr osob pro rychlý výběr při zakládání pohotovosti (jméno a hodnost se doplní i s kontaktem).";
  if (SADY_TAXONOMII.includes(appState.adminTab)) return `Správa číselníku „${TAXONOMIE[appState.adminTab].nazevSady}“ používaného napříč celým systémem.`;
  return "";
}

function renderAdminStanoviste() {
  const radky = DB.stanoviste.map(s => `
    <tr>
      <td class="fw-semibold">${s.nazev}</td>
      <td class="text-muted">${s.lokace}</td>
      <td>${s.prostredky.length}</td>
      <td class="text-end">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" onclick="navigateHash('${hashUpravitStanici(s.id)}')" title="Upravit">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-danger" onclick="smazatStanici(${s.id})" title="Odebrat">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>`).join("");

  document.getElementById("adminObsah").innerHTML = `
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-body-tertiary d-flex justify-content-between align-items-center">
        <span class="fw-semibold">Seznam stanovišť</span>
        <button class="btn btn-sm btn-primary" onclick="navigateHash('${hashPridatStanici()}')">
          <i class="bi bi-plus-lg"></i> Přidat stanoviště
        </button>
      </div>
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-header-tema"><tr><th>Název</th><th>Lokace</th><th>Počet prostředků</th><th></th></tr></thead>
          <tbody>${radky}</tbody>
        </table>
      </div>
    </div>
  `;
}

function smazatStanici(id) {
  const s = getStanice(id);
  confirmAction("Odebrat stanoviště", `Opravdu chcete odebrat „${s.nazev}“ včetně přiřazených prostředků?`, () => {
    DB.stanoviste = DB.stanoviste.filter(x => x.id !== id);
    renderSidebar();
    zapisLog(`Odebráno stanoviště „${s.nazev}“.`);
    showToast("Stanoviště bylo odebráno.");
    navigateHash("#/admin/stanoviste");
  });
}

/* --- Stanoviště: samostatná stránka přidání / úpravy (jen v hlavní administraci) --- */

function renderFormStanice(ctx) {
  const editace = ctx.akce === "upravit";
  const s = editace ? getStanice(ctx.stanicaId) : null;
  if (editace && !s) { navigate("admin", { adminTab: "stanoviste" }); return; }

  const zpet = "#/admin/stanoviste";
  const formId = "formStanice";

  const obsah = `
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Název stanoviště</label>
        <input type="text" class="form-control" id="fStaniceNazev" required oninput="appState.formDirty = true" value="${escAttr(s ? s.nazev : "")}" placeholder="např. Stanoviště Západ">
        <div class="invalid-feedback">Vyplňte prosím název stanoviště.</div>
      </div>
      <div class="col-md-6">
        <label class="form-label">Lokace</label>
        <input type="text" class="form-control" id="fStaniceLokace" oninput="appState.formDirty = true" value="${escAttr(s ? s.lokace : "")}" placeholder="např. Praha 5 – Smíchov">
      </div>
    </div>
    <div class="mt-4 d-flex align-items-center flex-wrap gap-2">
      ${editace ? `<button type="button" class="btn btn-outline-danger" onclick="smazatStanici(${s.id})"><i class="bi bi-trash"></i> Smazat stanoviště</button>` : ""}
      <button type="button" class="btn btn-primary ms-auto" onclick="if (validujFormular('${formId}')) ulozitFormStanici(${editace ? s.id : "null"})"><i class="bi bi-check2"></i> Uložit</button>
    </div>
  `;

  document.getElementById("app").innerHTML = formShell(
    editace ? "Upravit stanoviště" : "Přidat stanoviště",
    zpet, formId, obsah
  );
}

function ulozitFormStanici(stanicaId) {
  const nazev = document.getElementById("fStaniceNazev").value.trim();
  const lokace = document.getElementById("fStaniceLokace").value.trim();
  if (!nazev) { showToast("Vyplňte prosím název stanoviště."); return; }

  if (stanicaId) {
    const s = getStanice(stanicaId);
    s.nazev = nazev; s.lokace = lokace || "—";
    zapisLog(`Upraveno stanoviště „${nazev}“.`);
    showToast("Stanoviště bylo upraveno.");
  } else {
    DB.stanoviste.push({ id: ++stanovisteAutoId, nazev, lokace: lokace || "—", prostredky: [] });
    zapisLog(`Přidáno nové stanoviště „${nazev}“.`);
    showToast("Stanoviště bylo přidáno.");
  }
  appState.formDirty = false;
  renderSidebar();
  navigateHash("#/admin/stanoviste");
}

/* --- Generická administrace číselníků (Typy událostí / Stavy techniky / Stavy záznamů) --- */

function renderAdminTaxonomie(sada) {
  const cfg = TAXONOMIE[sada];
  const seznam = cfg.data();
  const extraSloupec = cfg.flag || cfg.cislo;
  const pocetSloupcu = extraSloupec ? 4 : 3;

  const radky = seznam.map(p => `
    <tr>
      <td class="fw-semibold">${p.nazev}</td>
      <td><span class="badge text-bg-${p.barva}">Ukázka</span></td>
      ${cfg.flag ? `<td>${p[cfg.flag.klic] ? '<i class="bi bi-check-lg text-success"></i> Ano' : '<i class="bi bi-dash text-muted"></i> Ne'}</td>` : ""}
      ${cfg.cislo ? `<td>${p[cfg.cislo.klic]} ${sklonovatDny(p[cfg.cislo.klic])}</td>` : ""}
      <td class="text-end">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" onclick="navigateHash('#/admin/${sada}/upravit/${p.klic}')" title="Upravit"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-outline-danger" onclick="smazatTaxonomii('${sada}', '${p.klic}')" title="Odebrat"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>`).join("") || `<tr><td colspan="${pocetSloupcu}" class="text-center text-muted py-3">Zatím žádné položky.</td></tr>`;

  document.getElementById("adminObsah").innerHTML = `
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-body-tertiary d-flex justify-content-between align-items-center">
        <span class="fw-semibold">${cfg.nazevSady}</span>
        <button class="btn btn-sm btn-primary" onclick="navigateHash('#/admin/${sada}/novy')"><i class="bi bi-plus-lg"></i> Přidat</button>
      </div>
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-header-tema"><tr><th>Název</th><th>Barva</th>${cfg.flag ? `<th>${cfg.flag.label}</th>` : ""}${cfg.cislo ? `<th>${cfg.cislo.label}</th>` : ""}<th></th></tr></thead>
          <tbody>${radky}</tbody>
        </table>
      </div>
    </div>
  `;
}

function smazatTaxonomii(sada, klic) {
  const cfg = TAXONOMIE[sada];
  const seznam = cfg.data();
  const p = seznam.find(x => x.klic === klic);
  if (!p) return;
  confirmAction("Odebrat položku", `Opravdu chcete odebrat „${p.nazev}“?`, () => {
    const idx = seznam.indexOf(p);
    seznam.splice(idx, 1);
    zapisLog(`Odebrána položka „${p.nazev}“ (${cfg.nazevSady}).`);
    showToast("Položka byla odebrána.");
    navigateHash(`#/admin/${sada}`);
  });
}

function renderFormTaxonomie(ctx) {
  const cfg = TAXONOMIE[ctx.sada];
  const seznam = cfg.data();
  const editace = ctx.akce === "upravit";
  const p = editace ? seznam.find(x => x.klic === ctx.klic) : null;
  if (editace && !p) { navigate("admin", { adminTab: ctx.sada }); return; }

  const zpet = `#/admin/${ctx.sada}`;
  const formId = "formTaxonomie";
  const vybranaBarva = p ? p.barva : "primary";
  const barvyRadio = ["primary", "secondary", "success", "danger", "warning", "info", "dark"].map(b => `
    <input type="radio" class="btn-check" name="fTaxBarva" id="fTaxBarva_${b}" value="${b}" autocomplete="off" ${b === vybranaBarva ? "checked" : ""} onchange="appState.formDirty = true">
    <label class="btn btn-${b} barva-swatch" for="fTaxBarva_${b}" title="${b}"><i class="bi bi-check-lg"></i></label>
  `).join("");

  const obsah = `
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Název</label>
        <input type="text" class="form-control" id="fTaxNazev" required oninput="appState.formDirty = true" value="${escAttr(p ? p.nazev : "")}">
        <div class="invalid-feedback">Vyplňte prosím název.</div>
      </div>
      <div class="col-md-6">
        <label class="form-label d-block">Barva odznaku</label>
        <div class="d-flex flex-wrap gap-2">${barvyRadio}</div>
      </div>
      ${cfg.flag ? `
      <div class="col-12">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="fTaxFlag" onchange="appState.formDirty = true" ${p && p[cfg.flag.klic] ? "checked" : ""}>
          <label class="form-check-label" for="fTaxFlag">${cfg.flag.label}</label>
        </div>
      </div>` : ""}
      ${cfg.cislo ? `
      <div class="col-md-6">
        <label class="form-label">${cfg.cislo.label}</label>
        <input type="number" class="form-control" id="fTaxCislo" min="${cfg.cislo.min || 1}" required oninput="appState.formDirty = true" value="${p ? p[cfg.cislo.klic] : (cfg.cislo.min || 1)}">
        <div class="invalid-feedback">Vyplňte prosím platnou hodnotu.</div>
      </div>` : ""}
    </div>
    <div class="mt-4 d-flex align-items-center flex-wrap gap-2">
      ${editace ? `<button type="button" class="btn btn-outline-danger" onclick="smazatTaxonomii('${ctx.sada}', '${p.klic}')"><i class="bi bi-trash"></i> Smazat</button>` : ""}
      <button type="button" class="btn btn-primary ms-auto" onclick="if (validujFormular('${formId}')) ulozitFormTaxonomii('${ctx.sada}'${editace ? `, '${p.klic}'` : ""})"><i class="bi bi-check2"></i> Uložit</button>
    </div>
  `;

  document.getElementById("app").innerHTML = formShell(
    (editace ? "Upravit" : "Přidat") + " – " + cfg.nazevSady,
    zpet, formId, obsah
  );
}

function ulozitFormTaxonomii(sada, klic) {
  const cfg = TAXONOMIE[sada];
  const seznam = cfg.data();
  const nazev = document.getElementById("fTaxNazev").value.trim();
  const barvaEl = document.querySelector('input[name="fTaxBarva"]:checked');
  const barva = barvaEl ? barvaEl.value : "primary";
  const flagVal = cfg.flag ? document.getElementById("fTaxFlag").checked : undefined;
  const cisloVal = cfg.cislo ? Number(document.getElementById("fTaxCislo").value) : undefined;
  if (!nazev) { showToast("Vyplňte prosím název."); return; }

  if (klic) {
    const p = seznam.find(x => x.klic === klic);
    p.nazev = nazev; p.barva = barva;
    if (cfg.flag) p[cfg.flag.klic] = flagVal;
    if (cfg.cislo) p[cfg.cislo.klic] = cisloVal;
    zapisLog(`Upravena položka „${nazev}“ (${cfg.nazevSady}).`);
    showToast("Položka byla upravena.");
  } else {
    const existujiciKlice = seznam.map(x => x.klic);
    const novyKlic = vytvorKlic(nazev, existujiciKlice);
    const nova = { klic: novyKlic, nazev, barva };
    if (cfg.flag) nova[cfg.flag.klic] = !!flagVal;
    if (cfg.cislo) nova[cfg.cislo.klic] = cisloVal;
    seznam.push(nova);
    zapisLog(`Přidána položka „${nazev}“ (${cfg.nazevSady}).`);
    showToast("Položka byla přidána.");
  }
  appState.formDirty = false;
  navigateHash(`#/admin/${sada}`);
}

function renderAdminLogy() {
  const radky = DB.logy.length ? DB.logy.map(l => `
    <tr>
      <td class="text-muted text-nowrap">${l.cas}</td>
      <td>${l.text}</td>
    </tr>`).join("") : `<tr><td colspan="2" class="text-center text-muted py-4">Zatím nejsou zaznamenány žádné změny. Zkuste něco upravit na některém ze stanovišť.</td></tr>`;

  document.getElementById("adminObsah").innerHTML = `
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-body-tertiary fw-semibold">Log změn</div>
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-header-tema"><tr><th style="width:11rem;">Čas</th><th>Popis změny</th></tr></thead>
          <tbody>${radky}</tbody>
        </table>
      </div>
    </div>
  `;
}

/* --- Registr osob (pro rychlý výběr do pohotovosti) --- */

function renderAdminOsoby() {
  const radky = DB.osoby.map(o => `
    <tr>
      <td class="fw-semibold">${o.jmeno}</td>
      <td>${o.kontakt || "—"}</td>
      <td class="text-end">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" onclick="navigateHash('${hashUpravitOsobu(o.id)}')" title="Upravit"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-outline-danger" onclick="smazatOsobu(${o.id})" title="Odebrat"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>`).join("") || `<tr><td colspan="3" class="text-center text-muted py-3">Zatím žádné osoby.</td></tr>`;

  document.getElementById("adminObsah").innerHTML = `
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-body-tertiary d-flex justify-content-between align-items-center">
        <span class="fw-semibold">Seznam osob</span>
        <button class="btn btn-sm btn-primary" onclick="navigateHash('${hashPridatOsobu()}')">
          <i class="bi bi-plus-lg"></i> Přidat osobu
        </button>
      </div>
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-header-tema"><tr><th>Jméno a hodnost</th><th>Kontakt</th><th></th></tr></thead>
          <tbody>${radky}</tbody>
        </table>
      </div>
    </div>
  `;
}

function smazatOsobu(id) {
  const o = DB.osoby.find(x => x.id === id);
  if (!o) return;
  confirmAction("Odebrat osobu", `Opravdu chcete odebrat „${o.jmeno}“ z registru osob?`, () => {
    DB.osoby = DB.osoby.filter(x => x.id !== id);
    zapisLog(`Odebrána osoba „${o.jmeno}“ z registru osob.`);
    showToast("Osoba byla odebrána.");
    navigateHash("#/admin/osoby");
  });
}

function renderFormOsoba(ctx) {
  const editace = ctx.akce === "upravit";
  const o = editace ? DB.osoby.find(x => x.id === ctx.osobaId) : null;
  if (editace && !o) { navigate("admin", { adminTab: "osoby" }); return; }

  const zpet = "#/admin/osoby";
  const formId = "formOsoba";

  const obsah = `
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Jméno a hodnost</label>
        <input type="text" class="form-control" id="fOsobaJmeno" required oninput="appState.formDirty = true" value="${escAttr(o ? o.jmeno : "")}" placeholder="např. nprap. Petr Svoboda">
        <div class="invalid-feedback">Vyplňte prosím jméno.</div>
      </div>
      <div class="col-md-6">
        <label class="form-label">Kontakt</label>
        <input type="text" class="form-control" id="fOsobaKontakt" oninput="appState.formDirty = true" value="${escAttr(o ? o.kontakt : "")}" placeholder="např. 725 100 112">
        <div class="form-text">Nepovinné.</div>
      </div>
    </div>
    <div class="mt-4 d-flex align-items-center flex-wrap gap-2">
      ${editace ? `<button type="button" class="btn btn-outline-danger" onclick="smazatOsobu(${o.id})"><i class="bi bi-trash"></i> Smazat osobu</button>` : ""}
      <button type="button" class="btn btn-primary ms-auto" onclick="if (validujFormular('${formId}')) ulozitFormOsoba(${editace ? o.id : "null"})"><i class="bi bi-check2"></i> Uložit</button>
    </div>
  `;

  document.getElementById("app").innerHTML = formShell(
    editace ? "Upravit osobu" : "Přidat osobu",
    zpet, formId, obsah
  );
}

function ulozitFormOsoba(osobaId) {
  const jmeno = document.getElementById("fOsobaJmeno").value.trim();
  const kontakt = document.getElementById("fOsobaKontakt").value.trim();
  if (!jmeno) { showToast("Vyplňte prosím jméno."); return; }

  if (osobaId) {
    const o = DB.osoby.find(x => x.id === osobaId);
    o.jmeno = jmeno; o.kontakt = kontakt;
    zapisLog(`Upravena osoba „${jmeno}“ v registru osob.`);
    showToast("Osoba byla upravena.");
  } else {
    DB.osoby.push({ id: ++osobaAutoId, jmeno, kontakt });
    zapisLog(`Přidána osoba „${jmeno}“ do registru osob.`);
    showToast("Osoba byla přidána.");
  }
  appState.formDirty = false;
  navigateHash("#/admin/osoby");
}
