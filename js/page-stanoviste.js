/* DETAIL STANOVIŠTĚ */

function otevriZaznamModal(kategorie, id) {
  const zdroj = kategorie === "porucha" ? DB.poruchy : DB.zavady;
  const z = zdroj.find(x => x.id === id);
  if (!z) return;
  const uzavreny = !jeZaznamOtevreny(z.stav);

  appState.modalZaznamKontext = { kategorie, id: z.id, stanicaId: z.stanovisteId, prostredekId: z.prostredekId };

  document.getElementById("poruchaModalLabel").textContent = kategorie === "porucha" ? "Detail poruchy" : "Detail závady";
  document.getElementById("pmId").textContent = "– " + z.id;
  document.getElementById("pmProstredek").textContent = z.prostredek;
  document.getElementById("pmDatum").textContent = formatDatum(z.datum) + (z.cas ? `, ${z.cas}` : "");
  document.getElementById("pmStav").innerHTML = zaznamStavBadge(z.stav);
  document.getElementById("pmTermin").textContent = uzavreny ? formatTermin(z.reseniDatum) : formatTermin(z.planovaneDo);
  document.getElementById("pmTerminLabel").textContent = uzavreny ? "Datum opravy" : "Předpokládaný termín";
  document.getElementById("pmPopis").textContent = z.popis;
  document.getElementById("pmReseni").textContent = z.reseni ? z.reseni : "Zatím nevyplněno.";

  const enRadek = document.getElementById("pmPopisEnRadek");
  const enHodnota = document.getElementById("pmPopisEn");
  if (z.popisEn) {
    enHodnota.textContent = z.popisEn;
    enRadek.classList.remove("d-none");
    enHodnota.classList.remove("d-none");
  } else {
    enRadek.classList.add("d-none");
    enHodnota.classList.add("d-none");
  }

  bootstrap.Modal.getOrCreateInstance(document.getElementById("poruchaModal")).show();
}

function tiskZAktualnihoModalu() {
  const k = appState.modalZaznamKontext;
  if (!k) return;
  const modalEl = document.getElementById("poruchaModal");
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();
  navigateHash(hashTisk(k.kategorie, k.stanicaId, k.prostredekId, k.id));
}

function renderStanoviste() {
  const s = getStanice(appState.stanicaId);
  if (!s) { navigate("dashboard"); return; }

  const stav = stanicaStav(s);
  const barva = stavColor(stav);
  const zmeny = pocetZmenDnesProStanici(s.id);

  const denniAkce = `<button class="btn btn-sm btn-primary" onclick="navigateHash('${hashPridatUdalost(s.id, appState.denAktualni)}')"><i class="bi bi-plus-lg"></i> Přidat záznam pro tento den</button>`;
  const pohotovostiAkce = `<button class="btn btn-sm btn-primary" onclick="navigateHash('${hashPridatPohotovost(s.id)}')"><i class="bi bi-plus-lg"></i> Přidat pohotovost</button>`;
  const prostredkyAkce = `<button class="btn btn-sm btn-primary" onclick="navigateHash('${hashPridatProstredek(s.id)}')"><i class="bi bi-plus-lg"></i> Přidat prostředek</button>`;

  document.getElementById("app").innerHTML = `
    <div class="card border-0 shadow-sm mb-4 border-start border-4 border-${barva}">
      <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="icon-badge bg-${barva}-subtle text-${barva}-emphasis"><i class="bi bi-building"></i></div>
          <div>
            <h4 class="mb-1 d-flex align-items-center gap-2">${s.nazev} ${notifBadge(zmeny)}</h4>
            <div class="text-muted"><i class="bi bi-geo-alt"></i> ${s.lokace}</div>
          </div>
        </div>
        <div>${stavBadge(stav)}</div>
      </div>
    </div>

    <div class="section-block">
      ${sectionHeading("bi-calendar3", "primary", "Denní přehled", "Aktuální dění na stanovišti podle jednotlivých dnů", denniAkce)}
      ${stanicaDenniHtml(s)}
    </div>

    <div class="section-block">
      ${sectionHeading("bi-person-badge", "info", "Pohotovosti", "Týdenní rozpis pohotovostní služby", pohotovostiAkce)}
      ${stanicaPohotovostiHtml(s)}
    </div>

    <div class="section-block">
      ${sectionHeading("bi-truck", "secondary", "Prostředky", "Přehled techniky a jejího aktuálního stavu", prostredkyAkce)}
      ${stanicaProstredkyHtml(s)}
    </div>

    ${stanicaZaznamySekceHtml(s, "porucha")}
    ${stanicaZaznamySekceHtml(s, "zavada")}
  `;
}

/* --- Prostředky --- */

function stanicaProstredkyHtml(s) {
  const radky = s.prostredky.map(p => `
    <tr>
      <td class="fw-semibold">${p.nazev}</td>
      <td class="text-muted">${p.typ}</td>
      <td class="text-center">${provozIcon(p.stav)}</td>
      <td>
        <select class="form-select form-select-sm" style="min-width:14rem;" onchange="zmenitStavProstredku(${s.id}, ${p.id}, this.value)">
          ${stavOptionsSUdrzbouHtml(p.stav)}
        </select>
        ${p.servis ? `<div class="mt-1">${servisInfoHtml(p)}</div>` : ""}
      </td>
      <td class="align-top">${poruchySeznamHtml(p.id)}</td>
      <td class="align-top text-center">${poruchyOdDoHtml(p.id, "od")}</td>
      <td class="align-top text-center">${poruchyOdDoHtml(p.id, "do")}</td>
      <td class="text-end">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" onclick="navigateHash('${hashUpravitProstredek(s.id, p.id)}')" title="Upravit">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-danger" onclick="smazatProstredek(${s.id}, ${p.id})" title="Odebrat">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>`).join("") || `<tr><td colspan="7" class="text-center text-muted py-3">Zatím nejsou přiřazeny žádné prostředky.</td></tr>`;

  return `
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-header bg-body-tertiary">
        <span class="fw-semibold">Seznam prostředků</span>
      </div>
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-header-tema">
            <tr><th>Název</th><th>Typ</th><th class="text-center">Provoz</th><th>Stav</th><th>Poruchy</th><th class="text-center">Od</th><th class="text-center">Do</th><th></th></tr>
          </thead>
          <tbody>${radky}</tbody>
        </table>
      </div>
    </div>
  `;
}

function zmenitStavProstredku(stanicaId, prostredekId, novaHodnota) {
  const s = getStanice(stanicaId);
  const p = s.prostredky.find(x => x.id === prostredekId);

  if (novaHodnota.startsWith("udrzba:")) {
    const typKlic = novaHodnota.slice("udrzba:".length);
    const typ = najdiVCiselniku(DB.typyUdrzby, typKlic);
    const zahajeno = DNES;
    const konec = pridejDny(zahajeno, typ.trvaniDni || 1);
    const puvodniStav = p.stav === "servis" && p.servis ? p.servis.puvodniStav : p.stav;

    p.servis = { typKlic, zahajeno, konec, puvodniStav };
    p.stav = "servis";

    if (!DB.denniUdalosti[zahajeno]) DB.denniUdalosti[zahajeno] = [];
    DB.denniUdalosti[zahajeno].push({
      cas: "08:00", typ: "info", stanovisteId: s.id,
      text: `Zahájení ${typ.nazev} na prostředku ${p.nazev}.`,
    });

    renderSidebar();
    renderStanoviste();
    zapisLog(`Zahájen servis (${typ.nazev}) prostředku „${p.nazev}“ na stanovišti ${s.nazev}, plánovaný konec ${formatDatum(konec)}.`);
    showToast(`Servis ${typ.nazev} byl zahájen, plánovaný konec ${formatDatum(konec)}.`);
    return;
  }

  p.stav = novaHodnota;
  if (novaHodnota !== "servis") p.servis = null;
  renderSidebar();
  renderStanoviste();
  zapisLog(`Změněn stav prostředku „${p.nazev}“ na stanovišti ${s.nazev}.`);
  showToast("Stav prostředku byl aktualizován.");
}

function smazatProstredek(stanicaId, prostredekId) {
  const s = getStanice(stanicaId);
  const p = s.prostredky.find(x => x.id === prostredekId);
  confirmAction("Odebrat prostředek", `Opravdu chcete odebrat „${p.nazev}“ ze stanoviště ${s.nazev}?`, () => {
    s.prostredky = s.prostredky.filter(x => x.id !== prostredekId);
    renderSidebar();
    zapisLog(`Odebrán prostředek „${p.nazev}“ ze stanoviště ${s.nazev}.`);
    showToast("Prostředek byl odebrán.");
    navigateHash(`#/stanoviste/${stanicaId}`);
  });
}

/* --- Prostředek: samostatná stránka přidání / úpravy --- */

function renderFormProstredek(ctx) {
  const s = getStanice(ctx.stanicaId);
  if (!s) { navigate("dashboard"); return; }
  const editace = ctx.akce === "upravit";
  const p = editace ? s.prostredky.find(x => x.id === ctx.prostredekId) : null;
  if (editace && !p) { navigate("stanoviste", { stanicaId: s.id }); return; }

  const zpet = `#/stanoviste/${s.id}`;
  const formId = "formProstredek";

  const obsah = `
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Název</label>
        <input type="text" class="form-control" id="fProstredekNazev" required oninput="appState.formDirty = true" value="${escAttr(p ? p.nazev : "")}" placeholder="např. CAS 20 Renault">
        <div class="invalid-feedback">Vyplňte prosím název prostředku.</div>
      </div>
      <div class="col-md-6">
        <label class="form-label">Typ</label>
        <input type="text" class="form-control" id="fProstredekTyp" oninput="appState.formDirty = true" value="${escAttr(p ? p.typ : "")}" placeholder="např. Cisternová automobilová stříkačka">
      </div>
      <div class="col-md-6">
        <label class="form-label">Stav</label>
        <select class="form-select" id="fProstredekStav" onchange="appState.formDirty = true">${stavOptionsHtml(p ? p.stav : DB.stavyTechniky[0].klic)}</select>
      </div>
    </div>
    <div class="mt-4 d-flex align-items-center flex-wrap gap-2">
      ${editace ? `<button type="button" class="btn btn-outline-danger" onclick="smazatProstredek(${s.id}, ${p.id})"><i class="bi bi-trash"></i> Smazat prostředek</button>` : ""}
      <button type="button" class="btn btn-primary ms-auto" onclick="if (validujFormular('${formId}')) ulozitFormProstredek(${s.id}${editace ? `, ${p.id}` : ""})"><i class="bi bi-check2"></i> Uložit</button>
    </div>
  `;

  document.getElementById("app").innerHTML = formShell(
    editace ? `Upravit prostředek – ${s.nazev}` : `Přidat prostředek – ${s.nazev}`,
    zpet, formId, obsah
  );
}

function ulozitFormProstredek(stanicaId, prostredekId) {
  const nazev = document.getElementById("fProstredekNazev").value.trim();
  const typ = document.getElementById("fProstredekTyp").value.trim();
  const stav = document.getElementById("fProstredekStav").value;
  if (!nazev) { showToast("Vyplňte prosím název prostředku."); return; }

  const s = getStanice(stanicaId);
  if (prostredekId) {
    const p = s.prostredky.find(x => x.id === prostredekId);
    p.nazev = nazev; p.typ = typ || "—"; p.stav = stav;
    zapisLog(`Upraven prostředek „${nazev}“ na stanovišti ${s.nazev}.`);
    showToast("Prostředek byl upraven.");
  } else {
    s.prostredky.push({ id: ++prostredekAutoId, nazev, typ: typ || "—", stav });
    zapisLog(`Přidán prostředek „${nazev}“ na stanovišti ${s.nazev}.`);
    showToast("Prostředek byl přidán.");
  }
  appState.formDirty = false;
  renderSidebar();
  navigateHash(`#/stanoviste/${stanicaId}`);
}

/* --- Pohotovosti --- */

function stanicaPohotovostiHtml(s) {
  const radky = DB.pohotovosti
    .map((p, index) => ({ p, index }))
    .filter(({ p }) => p.stanovisteId === s.id)
    .sort((a, b) => a.p.od.localeCompare(b.p.od))
    .map(({ p, index }) => {
      const aktivni = DNES >= p.od && DNES <= p.do;
      return `
        <tr class="${aktivni ? "table-primary" : ""}">
          <td class="fw-semibold">${p.tyden}</td>
          <td>${formatDatum(p.od)} – ${formatDatum(p.do)}</td>
          <td>${p.jmeno}</td>
          <td>${p.kontakt}</td>
          <td>${aktivni ? '<span class="badge bg-primary-subtle text-primary-emphasis">Aktuální týden</span>' : ""}</td>
          <td class="text-end">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-secondary" onclick="navigateHash('${hashUpravitPohotovost(s.id, index)}')" title="Upravit">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger" onclick="smazatPohotovost(${index})" title="Odebrat">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>`;
    }).join("") || `<tr><td colspan="6" class="text-center text-muted py-3">Zatím nejsou evidovány žádné pohotovosti.</td></tr>`;

  return `
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-header bg-body-tertiary">
        <span class="fw-semibold">Rozpis pohotovostí</span>
      </div>
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-header-tema"><tr><th>Týden</th><th>Období</th><th>Jméno a hodnost</th><th>Kontakt</th><th></th><th></th></tr></thead>
          <tbody>${radky}</tbody>
        </table>
      </div>
    </div>
  `;
}

function smazatPohotovost(index) {
  const p = DB.pohotovosti[index];
  const s = getStanice(p.stanovisteId);
  confirmAction("Odebrat pohotovost", `Opravdu chcete odebrat pohotovost (týden ${p.tyden}, ${p.jmeno})?`, () => {
    DB.pohotovosti.splice(index, 1);
    zapisLog(`Odebrána pohotovost (týden ${p.tyden}, ${p.jmeno}) na stanovišti ${s ? s.nazev : "?"}.`);
    showToast("Pohotovost byla odebrána.");
    navigateHash(s ? `#/stanoviste/${s.id}` : "#/dashboard");
  });
}

/* --- Pohotovost: samostatná stránka přidání / úpravy --- */

function renderFormPohotovost(ctx) {
  const s = getStanice(ctx.stanicaId);
  if (!s) { navigate("dashboard"); return; }
  const editace = ctx.akce === "upravit";
  const p = editace ? DB.pohotovosti[ctx.index] : null;
  if (editace && !p) { navigate("stanoviste", { stanicaId: s.id }); return; }

  const zpet = `#/stanoviste/${s.id}`;
  const formId = "formPohotovost";

  const obsah = `
    <div class="row g-3">
      <div class="col-md-3">
        <label class="form-label">Týden</label>
        <input type="text" class="form-control" id="fPohotovostTyden" required oninput="appState.formDirty = true" value="${escAttr(p ? p.tyden : "")}" placeholder="např. 40">
        <div class="invalid-feedback">Vyplňte prosím číslo týdne.</div>
      </div>
      <div class="col-md-4">
        <label class="form-label">Od</label>
        <input type="date" class="form-control" id="fPohotovostOd" required oninput="appState.formDirty = true" value="${p ? p.od : ""}">
        <div class="invalid-feedback">Vyplňte prosím počátek období.</div>
      </div>
      <div class="col-md-5">
        <label class="form-label">Do</label>
        <input type="date" class="form-control" id="fPohotovostDo" required oninput="appState.formDirty = true" value="${p ? p.do : ""}">
        <div class="invalid-feedback">Vyplňte prosím konec období.</div>
      </div>
      <div class="col-12">
        <label class="form-label">Rychlá volba osoby</label>
        <select class="form-select" onchange="vyplnitOsobu(this.value)">
          <option value="">— vybrat z registru osob (nepovinné) —</option>
          ${DB.osoby.map(o => `<option value="${o.id}">${o.jmeno}</option>`).join("")}
        </select>
        <div class="form-text">Doplní jméno i kontakt níže – oba údaje jde ještě ručně upravit. Osoby se spravují v Administraci.</div>
      </div>
      <div class="col-md-6">
        <label class="form-label">Jméno a hodnost</label>
        <input type="text" class="form-control" id="fPohotovostJmeno" required oninput="appState.formDirty = true" value="${escAttr(p ? p.jmeno : "")}" placeholder="např. nprap. Petr Svoboda">
        <div class="invalid-feedback">Vyplňte prosím jméno.</div>
      </div>
      <div class="col-md-6">
        <label class="form-label">Kontakt</label>
        <input type="text" class="form-control" id="fPohotovostKontakt" oninput="appState.formDirty = true" value="${escAttr(p ? p.kontakt : "")}" placeholder="např. 725 100 112">
        <div class="form-text">Nepovinné.</div>
      </div>
    </div>
    <div class="mt-4 d-flex align-items-center flex-wrap gap-2">
      ${editace ? `<button type="button" class="btn btn-outline-danger" onclick="smazatPohotovost(${ctx.index})"><i class="bi bi-trash"></i> Smazat</button>` : ""}
      <button type="button" class="btn btn-primary ms-auto" onclick="if (validujFormular('${formId}')) ulozitFormPohotovost(${s.id}${editace ? `, ${ctx.index}` : ""})"><i class="bi bi-check2"></i> Uložit</button>
    </div>
  `;

  document.getElementById("app").innerHTML = formShell(
    editace ? `Upravit pohotovost – ${s.nazev}` : `Přidat pohotovost – ${s.nazev}`,
    zpet, formId, obsah
  );
}

function ulozitFormPohotovost(stanicaId, index) {
  const tyden = document.getElementById("fPohotovostTyden").value.trim();
  const od = document.getElementById("fPohotovostOd").value;
  const doD = document.getElementById("fPohotovostDo").value;
  const jmeno = document.getElementById("fPohotovostJmeno").value.trim();
  const kontakt = document.getElementById("fPohotovostKontakt").value.trim();
  if (!tyden || !od || !doD || !jmeno) { showToast("Vyplňte prosím týden, období a jméno."); return; }

  const s = getStanice(stanicaId);
  if (index !== undefined) {
    const p = DB.pohotovosti[index];
    p.tyden = tyden; p.od = od; p.do = doD; p.jmeno = jmeno; p.kontakt = kontakt || "—";
    zapisLog(`Upravena pohotovost (týden ${tyden}, ${jmeno}) na stanovišti ${s.nazev}.`);
    showToast("Pohotovost byla upravena.");
  } else {
    DB.pohotovosti.push({ stanovisteId: stanicaId, tyden, od, do: doD, jmeno, kontakt: kontakt || "—" });
    zapisLog(`Přidána pohotovost (týden ${tyden}, ${jmeno}) na stanovišti ${s.nazev}.`);
    showToast("Pohotovost byla přidána.");
  }
  appState.formDirty = false;
  navigateHash(`#/stanoviste/${stanicaId}`);
}

/* --- Denní přehled konkrétního stanoviště --- */

function stanicaDenniHtml(s) {
  const den = appState.denAktualni;
  const polozky = (DB.denniUdalosti[den] || [])
    .map((u, idx) => ({ u, idx }))
    .filter(({ u }) => u.stanovisteId === s.id)
    .sort((a, b) => a.u.cas.localeCompare(b.u.cas));

  const obsah = polozky.length
    ? timelineEditovatelnyHtml(polozky, s.id, den)
    : `<div class="text-center text-muted py-4">
         <i class="bi bi-calendar-x fs-2 d-block mb-2"></i>
         Pro tento den nejsou u tohoto stanoviště evidovány žádné záznamy.
       </div>`;

  return `
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-header bg-body-tertiary d-flex align-items-center justify-content-between flex-wrap gap-2">
        <button class="btn btn-outline-secondary btn-sm" ${den <= DEN_MIN ? "disabled" : ""} onclick="posunDen(-1)">
          <i class="bi bi-chevron-left"></i> Předchozí den
        </button>

        <div class="text-center">
          <div class="fw-semibold">${formatDatumDlouhy(den)}</div>
          ${den !== DNES ? `<button class="btn btn-link btn-sm p-0" onclick="skocNaDnes()">Přejít na dnešek</button>` : `<span class="badge bg-primary-subtle text-primary-emphasis">Dnes</span>`}
        </div>

        <button class="btn btn-outline-secondary btn-sm" ${den >= DNES ? "disabled" : ""} onclick="posunDen(1)">
          Následující den <i class="bi bi-chevron-right"></i>
        </button>
      </div>

      <div class="card-body">
        ${obsah}
      </div>
    </div>
  `;
}

function smazatUdalost(datum, idx) {
  const u = DB.denniUdalosti[datum][idx];
  const s = u.stanovisteId !== null ? getStanice(u.stanovisteId) : null;
  confirmAction("Odebrat záznam", `Opravdu chcete odebrat záznam „${u.text}“?`, () => {
    DB.denniUdalosti[datum].splice(idx, 1);
    zapisLog(`Odebrán denní záznam (${formatDatum(datum)} ${u.cas})${s ? ` na stanovišti ${s.nazev}` : ""}: „${u.text}“.`);
    showToast("Záznam byl odebrán.");
    if (s) navigateHash(`#/stanoviste/${s.id}`);
    else rerenderDenniKontext();
  });
}

/* --- Denní záznam: samostatná stránka přidání / úpravy --- */

function renderFormDenni(ctx) {
  const s = getStanice(ctx.stanicaId);
  if (!s) { navigate("dashboard"); return; }
  const editace = ctx.akce === "upravit";
  const u = editace ? (DB.denniUdalosti[ctx.datum] || [])[ctx.index] : null;
  if (editace && !u) { navigate("stanoviste", { stanicaId: s.id }); return; }

  const zpet = `#/stanoviste/${s.id}`;
  const formId = "formDenni";

  const obsah = `
    <div class="row g-3">
      <div class="col-md-4">
        <label class="form-label">Datum</label>
        <input type="text" class="form-control" value="${formatDatum(ctx.datum)}" disabled>
      </div>
      <div class="col-md-3">
        <label class="form-label">Čas</label>
        <input type="time" class="form-control" id="fUdalostCas" required oninput="appState.formDirty = true" value="${u ? u.cas : "08:00"}">
        <div class="invalid-feedback">Vyplňte prosím čas.</div>
      </div>
      <div class="col-md-5">
        <label class="form-label">Typ</label>
        <select class="form-select" id="fUdalostTyp" onchange="appState.formDirty = true">
          ${typOptionsHtml(u ? u.typ : DB.typyUdalosti[0].klic)}
        </select>
      </div>
      <div class="col-12">
        <label class="form-label">Popis události</label>
        <textarea class="form-control" id="fUdalostText" rows="4" required oninput="appState.formDirty = true" placeholder="např. Výjezd – technická pomoc.">${escAttr(u ? u.text : "")}</textarea>
        <div class="invalid-feedback">Vyplňte prosím popis události.</div>
      </div>
    </div>
    <div class="mt-4 d-flex align-items-center flex-wrap gap-2">
      ${editace ? `<button type="button" class="btn btn-outline-danger" onclick="smazatUdalost('${ctx.datum}', ${ctx.index})"><i class="bi bi-trash"></i> Smazat záznam</button>` : ""}
      <button type="button" class="btn btn-primary ms-auto" onclick="if (validujFormular('${formId}')) ulozitFormUdalost(${s.id}, '${ctx.datum}'${editace ? `, ${ctx.index}` : ""})"><i class="bi bi-check2"></i> Uložit</button>
    </div>
  `;

  document.getElementById("app").innerHTML = formShell(
    (editace ? "Upravit denní záznam – " : "Přidat denní záznam – ") + s.nazev,
    zpet, formId, obsah
  );
}

function ulozitFormUdalost(stanicaId, datum, index) {
  const cas = document.getElementById("fUdalostCas").value;
  const typ = document.getElementById("fUdalostTyp").value;
  const text = document.getElementById("fUdalostText").value.trim();
  if (!cas || !text) { showToast("Vyplňte prosím čas a popis události."); return; }

  const s = getStanice(stanicaId);
  if (!DB.denniUdalosti[datum]) DB.denniUdalosti[datum] = [];

  if (index !== undefined) {
    const u = DB.denniUdalosti[datum][index];
    u.cas = cas; u.typ = typ; u.text = text;
    zapisLog(`Upraven denní záznam (${formatDatum(datum)} ${cas}) na stanovišti ${s.nazev}.`);
    showToast("Záznam byl upraven.");
  } else {
    DB.denniUdalosti[datum].push({ cas, typ, stanovisteId: stanicaId, text });
    zapisLog(`Přidán denní záznam (${formatDatum(datum)} ${cas}) na stanovišti ${s.nazev}: „${text}“.`);
    showToast("Záznam byl přidán.");
  }

  if (datum < DEN_MIN) DEN_MIN = datum;

  appState.formDirty = false;
  appState.denAktualni = datum;
  navigateHash(`#/stanoviste/${stanicaId}`);
}

/* --- Poruchy / Závady – samostatná tabulka pro každý prostředek --- */

function posunRokZaznamu(kategorie, prostredekId, smer) {
  const zdroj = kategorie === "porucha" ? DB.poruchy : DB.zavady;
  const roky = rokyZeZaznamu(zdroj.filter(z => z.prostredekId === prostredekId));
  const filtr = getZaznamFiltr(kategorie, prostredekId);
  const idx = roky.indexOf(filtr.rok);
  const novyIdx = idx + smer;
  if (novyIdx < 0 || novyIdx >= roky.length) return;
  filtr.rok = roky[novyIdx];
  renderStanoviste();
}

function prepniRazeniZaznamu(kategorie, prostredekId) {
  const filtr = getZaznamFiltr(kategorie, prostredekId);
  filtr.razeni = filtr.razeni === "asc" ? "desc" : "asc";
  renderStanoviste();
}

function stanicaZaznamyProstredekHtml(kategorie, prostredek, stanicaId) {
  const zdroj = kategorie === "porucha" ? DB.poruchy : DB.zavady;
  const vsechnyZaznamy = zdroj.filter(z => z.prostredekId === prostredek.id);
  const roky = rokyZeZaznamu(vsechnyZaznamy);

  const filtr = getZaznamFiltr(kategorie, prostredek.id);
  if (filtr.rok === null || !roky.includes(filtr.rok)) filtr.rok = roky[roky.length - 1];

  const zaznamy = vsechnyZaznamy
    .filter(z => Number(z.datum.slice(0, 4)) === filtr.rok)
    .sort((a, b) => (filtr.razeni === "asc" ? a.datum.localeCompare(b.datum) : b.datum.localeCompare(a.datum)));

  const razeniIcon = filtr.razeni === "asc" ? "bi-sort-numeric-down" : "bi-sort-numeric-up-alt";
  const razeniLabel = filtr.razeni === "asc" ? "Řazeno od nejstarších" : "Řazeno od nejnovějších";

  const radky = zaznamy.length ? zaznamy.map(z => `
    <tr>
      <td class="text-center text-muted">${formatDatum(z.datum)}</td>
      <td class="text-center">${z.id}</td>
      <td>${z.popis}</td>
      <td class="text-center">${zaznamStavBadge(z.stav)}</td>
      <td class="text-end">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" onclick="otevriZaznamModal('${kategorie}', '${z.id}')" title="Detail">
            <i class="bi bi-info-circle"></i>
          </button>
          <button class="btn btn-outline-secondary" onclick="navigateHash('${hashTisk(kategorie, stanicaId, prostredek.id, z.id)}')" title="Tisk / PDF">
            <i class="bi bi-printer"></i>
          </button>
          <button class="btn btn-outline-secondary" onclick="navigateHash('${hashUpravitZaznam(kategorie, stanicaId, prostredek.id, z.id)}')" title="Upravit">
            <i class="bi bi-pencil"></i>
          </button>
          ${jeZaznamOtevreny(z.stav) ? `<button class="btn btn-outline-success" onclick="oznacitVyreseno('${kategorie}', '${z.id}')" title="Označit jako opraveno"><i class="bi bi-check2"></i></button>` : ""}
          <button class="btn btn-outline-danger" onclick="smazatZaznam('${kategorie}', '${z.id}')" title="Odebrat">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>`).join("") : `
    <tr><td colspan="5" class="text-center text-muted py-3">V roce ${filtr.rok} nejsou evidovány žádné záznamy.</td></tr>`;

  return `
    <div class="card border-0 shadow-sm mb-3">
      <div class="card-header bg-body-tertiary d-flex justify-content-between align-items-center flex-wrap gap-2">
        <span class="fw-semibold"><i class="bi bi-truck me-1 text-muted"></i>${prostredek.nazev}</span>
        <div class="d-flex align-items-center gap-2">
          <div class="btn-group btn-group-sm" role="group" aria-label="Výběr roku">
            <button class="btn btn-outline-secondary" ${filtr.rok === roky[0] ? "disabled" : ""} onclick="posunRokZaznamu('${kategorie}', ${prostredek.id}, -1)">
              <i class="bi bi-chevron-left"></i>
            </button>
            <span class="btn btn-outline-secondary disabled fw-semibold">${filtr.rok}</span>
            <button class="btn btn-outline-secondary" ${filtr.rok === roky[roky.length - 1] ? "disabled" : ""} onclick="posunRokZaznamu('${kategorie}', ${prostredek.id}, 1)">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
          <button class="btn btn-sm btn-outline-secondary" onclick="prepniRazeniZaznamu('${kategorie}', ${prostredek.id})" title="${razeniLabel}">
            <i class="bi ${razeniIcon}"></i>
          </button>
          <button class="btn btn-sm btn-primary" onclick="navigateHash('${hashPridatZaznam(kategorie, stanicaId, prostredek.id)}')">
            <i class="bi bi-plus-lg"></i> Přidat záznam
          </button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-header-tema">
            <tr><th class="text-center" style="width:9rem;">Datum</th><th class="text-center" style="width:9rem;">ID</th><th>Popis</th><th class="text-center" style="width:9rem;">Stav</th><th></th></tr>
          </thead>
          <tbody>${radky}</tbody>
        </table>
      </div>
    </div>
  `;
}

function stanicaZaznamySekceHtml(s, kategorie) {
  const nadpis = kategorie === "porucha" ? "Poruchy" : "Závady";
  const icon = kategorie === "porucha" ? "bi-exclamation-octagon" : "bi-flag";
  const barva = kategorie === "porucha" ? "danger" : "warning";
  const popisek = kategorie === "porucha"
    ? "Poruchy techniky snižující nebo vylučující bojeschopnost. Evidováno samostatně pro každý prostředek."
    : "Nedostatky menšího charakteru, které neomezují nasazení techniky. Evidováno samostatně pro každý prostředek.";

  const tabulky = s.prostredky.length
    ? s.prostredky.map(p => stanicaZaznamyProstredekHtml(kategorie, p, s.id)).join("")
    : `<div class="text-muted text-center py-3">Stanoviště zatím nemá přiřazené žádné prostředky.</div>`;

  return `
    <div class="section-block">
      ${sectionHeading(icon, barva, nadpis, popisek)}
      ${tabulky}
    </div>`;
}

function oznacitVyreseno(kategorie, id) {
  const zdroj = kategorie === "porucha" ? DB.poruchy : DB.zavady;
  const z = zdroj.find(x => x.id === id);
  confirmAction("Označit jako opraveno", `Opravdu chcete záznam ${z.id} označit jako opravený?`, () => {
    const uzavrenyStav = DB.stavyZaznamu.find(x => !x.otevreny) || DB.stavyZaznamu[DB.stavyZaznamu.length - 1];
    z.stav = uzavrenyStav.klic;
    z.reseniDatum = DNES;
    renderSidebar();
    renderStanoviste();
    const s = getStanice(z.stanovisteId);
    zapisLog(`Záznam ${z.id}${s ? ` (${s.nazev})` : ""} byl označen jako opravený.`);
    showToast("Záznam byl označen jako opravený.");
  });
}

function smazatZaznam(kategorie, id) {
  const zdroj = kategorie === "porucha" ? DB.poruchy : DB.zavady;
  const z = zdroj.find(x => x.id === id);
  confirmAction("Odebrat záznam", `Opravdu chcete odebrat záznam ${z.id}?`, () => {
    if (kategorie === "porucha") DB.poruchy = DB.poruchy.filter(x => x.id !== id);
    else DB.zavady = DB.zavady.filter(x => x.id !== id);
    renderSidebar();
    const s = getStanice(z.stanovisteId);
    zapisLog(`Odebrán záznam ${z.id}${s ? ` (${s.nazev})` : ""}.`);
    showToast("Záznam byl odebrán.");
    navigateHash(s ? `#/stanoviste/${s.id}` : "#/dashboard");
  });
}

/* --- Porucha/Závada --- */

function renderFormZaznam(ctx) {
  if (ctx.akce === "novy") renderFormZaznamNovy(ctx);
  else renderFormZaznamUpravit(ctx);
}

/* --- Přidání víc záznamů najednou --- */

function pripravBlokyZaznamu(kategorie, stanicaId, prostredekId) {
  const klic = kategorie + "_" + stanicaId + "_" + prostredekId;
  if (appState.novyZaznamKlic !== klic || !appState.novaPorouchyBloky) {
    appState.novaPorouchyBloky = [{ datum: DNES, cas: "", termin: "", popis: "", popisEn: "" }];
    appState.novyZaznamKlic = klic;
  }
  return appState.novaPorouchyBloky;
}

function nacistBlokyZDom(pocet) {
  const out = [];
  for (let i = 0; i < pocet; i++) {
    const d = document.getElementById("nDatum_" + i);
    const c = document.getElementById("nCas_" + i);
    const t = document.getElementById("nTermin_" + i);
    const p = document.getElementById("nPopis_" + i);
    const pe = document.getElementById("nPopisEn_" + i);
    out.push({
      datum: d ? d.value : DNES,
      cas: c ? c.value : "",
      termin: t ? t.value : "",
      popis: p ? p.value : "",
      popisEn: pe ? pe.value : "",
    });
  }
  return out;
}

function pridatBlokZaznamu(kategorie, stanicaId, prostredekId) {
  const pocetPred = pripravBlokyZaznamu(kategorie, stanicaId, prostredekId).length;
  appState.novaPorouchyBloky = nacistBlokyZDom(pocetPred);
  appState.novaPorouchyBloky.push({ datum: DNES, cas: "", termin: "", popis: "", popisEn: "" });
  appState.formDirty = true;
  renderForm();
}

function odebratBlokZaznamu(kategorie, stanicaId, prostredekId, index) {
  const pocetPred = pripravBlokyZaznamu(kategorie, stanicaId, prostredekId).length;
  const bloky = nacistBlokyZDom(pocetPred);
  bloky.splice(index, 1);
  if (!bloky.length) bloky.push({ datum: DNES, cas: "", termin: "", popis: "", popisEn: "" });
  appState.novaPorouchyBloky = bloky;
  appState.formDirty = true;
  renderForm();
}

function renderFormZaznamNovy(ctx) {
  const s = getStanice(ctx.stanicaId);
  if (!s) { navigate("dashboard"); return; }
  const prostredek = s.prostredky.find(p => p.id === ctx.prostredekId);
  if (!prostredek) { navigate("stanoviste", { stanicaId: s.id }); return; }

  const bloky = pripravBlokyZaznamu(ctx.kategorie, s.id, prostredek.id);
  const zpet = `#/stanoviste/${s.id}`;
  const formId = "formNovyZaznam";
  const nazevKategorie = ctx.kategorie === "porucha" ? "poruchu" : "závadu";
  const nazevKategorieCJ = ctx.kategorie === "porucha" ? "Porucha" : "Závada";
  const icon = ctx.kategorie === "porucha" ? "bi-exclamation-octagon" : "bi-flag";

  const blokyHtml = bloky.map((b, i) => `
    <div class="blok-zaznamu mb-3">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="fw-semibold text-muted"><i class="bi ${icon} me-1"></i>${nazevKategorieCJ} č. ${i + 1}</span>
        ${bloky.length > 1 ? `
        <button type="button" class="btn btn-sm btn-outline-danger" onclick="odebratBlokZaznamu('${ctx.kategorie}', ${s.id}, ${prostredek.id}, ${i})">
          <i class="bi bi-trash"></i> Odebrat
        </button>` : ""}
      </div>
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Datum nahlášení</label>
          <input type="date" class="form-control" id="nDatum_${i}" required oninput="appState.formDirty = true" value="${b.datum || DNES}">
          <div class="invalid-feedback">Vyplňte prosím datum.</div>
        </div>
        <div class="col-md-4">
          <label class="form-label">Čas poruchy</label>
          <input type="time" class="form-control" id="nCas_${i}" oninput="appState.formDirty = true" value="${b.cas || ""}">
          <div class="form-text">Nepovinné.</div>
        </div>
        <div class="col-md-4">
          <label class="form-label">Termín (předp. oprava)</label>
          <input type="date" class="form-control" id="nTermin_${i}" oninput="appState.formDirty = true" value="${b.termin || ""}">
          <div class="form-text">Nepovinné – zobrazí se „Není určeno“.</div>
        </div>
        <div class="col-12">
          <label class="form-label">Popis</label>
          <textarea class="form-control" id="nPopis_${i}" rows="3" required oninput="appState.formDirty = true" placeholder="Stručný popis poruchy / závady">${escAttr(b.popis || "")}</textarea>
          <div class="invalid-feedback">Vyplňte prosím popis.</div>
        </div>
        <div class="col-12">
          <label class="form-label">Popis anglicky</label>
          <textarea class="form-control" id="nPopisEn_${i}" rows="3" oninput="appState.formDirty = true" placeholder="Nepovinné">${escAttr(b.popisEn || "")}</textarea>
        </div>
      </div>
    </div>`).join("");

  const obsah = `
    <div class="mb-3 text-muted"><i class="bi bi-truck me-1"></i>${prostredek.nazev} – ${s.nazev}</div>
    ${blokyHtml}
    <button type="button" class="btn btn-outline-secondary btn-sm mb-4" onclick="pridatBlokZaznamu('${ctx.kategorie}', ${s.id}, ${prostredek.id})">
      <i class="bi bi-plus-lg"></i> Přidat další ${nazevKategorie}
    </button>
    <div class="d-flex align-items-center flex-wrap gap-2">
      <button type="button" class="btn btn-primary ms-auto" onclick="if (validujFormular('${formId}')) ulozitNoveZaznamy('${ctx.kategorie}', ${s.id}, ${prostredek.id})">
        <i class="bi bi-check2"></i> Uložit
      </button>
    </div>
  `;

  document.getElementById("app").innerHTML = formShell(
    `Přidat ${nazevKategorie} – ${prostredek.nazev}`, zpet, formId, obsah
  );
}

function ulozitNoveZaznamy(kategorie, stanicaId, prostredekId) {
  const s = getStanice(stanicaId);
  const prostredek = s.prostredky.find(p => p.id === prostredekId);
  const zdroj = kategorie === "porucha" ? DB.poruchy : DB.zavady;
  const vychoziStav = (DB.stavyZaznamu.find(x => x.otevreny) || DB.stavyZaznamu[0]).klic;
  const prefix = kategorie === "porucha" ? "P" : "Z";
  const pocet = (appState.novaPorouchyBloky || []).length;
  let pridano = 0;

  for (let i = 0; i < pocet; i++) {
    const datum = document.getElementById("nDatum_" + i).value;
    const cas = document.getElementById("nCas_" + i).value;
    const termin = document.getElementById("nTermin_" + i).value;
    const popis = document.getElementById("nPopis_" + i).value.trim();
    const popisEn = document.getElementById("nPopisEn_" + i).value.trim();
    if (!datum || !popis) continue;

    const rok = datum.slice(0, 4);
    const poradi = zdroj.filter(z => z.id.startsWith(`${prefix}-${rok}`)).length + 1;
    const id = `${prefix}-${rok}-${String(100 + poradi)}`;
    zdroj.push({ id, stanovisteId: s.id, prostredekId: prostredek.id, prostredek: prostredek.nazev, datum, cas, stav: vychoziStav, popis, popisEn, reseni: "", planovaneDo: termin || null });
    pridano++;
  }

  appState.formDirty = false;
  appState.novaPorouchyBloky = null;
  appState.novyZaznamKlic = null;
  renderSidebar();
  zapisLog(`Přidáno ${pridano} ${kategorie === "porucha" ? "poruch(y)" : "závad(y)"} u prostředku „${prostredek.nazev}“ na stanovišti ${s.nazev}.`);
  showToast(pridano === 1 ? (kategorie === "porucha" ? "Porucha byla přidána." : "Závada byla přidána.") : `Přidáno záznamů: ${pridano}.`);
  navigateHash(`#/stanoviste/${stanicaId}`);
}

/* --- Úprava existující poruchy/závady (jeden konkrétní záznam) --- */

function renderFormZaznamUpravit(ctx) {
  const s = getStanice(ctx.stanicaId);
  if (!s) { navigate("dashboard"); return; }
  const prostredek = s.prostredky.find(p => p.id === ctx.prostredekId);
  if (!prostredek) { navigate("stanoviste", { stanicaId: s.id }); return; }

  const zdroj = ctx.kategorie === "porucha" ? DB.poruchy : DB.zavady;
  const z = zdroj.find(x => x.id === ctx.zaznamId);
  if (!z) { navigate("stanoviste", { stanicaId: s.id }); return; }

  const zpet = `#/stanoviste/${s.id}`;
  const formId = "formUpravitZaznam";
  const nazevKategorie = ctx.kategorie === "porucha" ? "poruchu" : "závadu";

  const obsah = `
    <div class="mb-3 text-muted"><i class="bi bi-truck me-1"></i>${prostredek.nazev}</div>
    <div class="row g-3">
      <div class="col-md-4">
        <label class="form-label">Datum nahlášení</label>
        <input type="date" class="form-control" id="fZaznamDatum" required oninput="appState.formDirty = true" value="${z.datum}">
        <div class="invalid-feedback">Vyplňte prosím datum.</div>
      </div>
      <div class="col-md-4">
        <label class="form-label">Čas poruchy</label>
        <input type="time" class="form-control" id="fZaznamCas" oninput="appState.formDirty = true" value="${z.cas || ""}">
        <div class="form-text">Nepovinné.</div>
      </div>
      <div class="col-md-4">
        <label class="form-label">Stav</label>
        <select class="form-select" id="fZaznamStav" onchange="appState.formDirty = true; prekresliPovinnostReseni();">
          ${stavZaznamuOptionsHtml(z.stav)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label">Termín (předp. oprava / datum opravy)</label>
        <input type="date" class="form-control" id="fZaznamTermin" oninput="appState.formDirty = true" value="${z.planovaneDo || z.reseniDatum || ""}">
        <div class="form-text">Nepovinné – pokud necháte prázdné, zobrazí se „Není určeno“.</div>
      </div>
      <div class="col-12">
        <label class="form-label">Popis</label>
        <textarea class="form-control" id="fZaznamPopis" rows="4" required oninput="appState.formDirty = true" placeholder="Stručný popis poruchy / závady">${escAttr(z.popis)}</textarea>
        <div class="invalid-feedback">Vyplňte prosím popis.</div>
      </div>
      <div class="col-12">
        <label class="form-label">Popis anglicky</label>
        <textarea class="form-control" id="fZaznamPopisEn" rows="4" oninput="appState.formDirty = true" placeholder="Nepovinné – pro tiskový záznam v angličtině">${escAttr(z.popisEn)}</textarea>
        <div class="form-text">Nepovinné, vyplňte ručně (offline překlad zde bohužel není k dispozici).</div>
      </div>
      <div class="col-12">
        <label class="form-label" id="fZaznamReseniLabel">Řešení</label>
        <textarea class="form-control" id="fZaznamReseni" rows="4" oninput="appState.formDirty = true" placeholder="Jak byla porucha/závada vyřešena">${escAttr(z.reseni)}</textarea>
        <div class="invalid-feedback">U ukončeného záznamu je řešení povinné.</div>
      </div>
    </div>
    <div class="mt-4 d-flex align-items-center flex-wrap gap-2">
      <button type="button" class="btn btn-outline-danger" onclick="smazatZaznam('${ctx.kategorie}', '${z.id}')"><i class="bi bi-trash"></i> Smazat záznam</button>
      <button type="button" class="btn btn-outline-secondary" onclick="navigateHash('${hashTisk(ctx.kategorie, s.id, prostredek.id, z.id)}')"><i class="bi bi-printer"></i> Tisk / PDF</button>
      <button type="button" class="btn btn-primary ms-auto" onclick="if (validujFormular('${formId}')) ulozitFormZaznam('${ctx.kategorie}', ${s.id}, ${prostredek.id}, '${z.id}')"><i class="bi bi-check2"></i> Uložit</button>
    </div>
  `;

  document.getElementById("app").innerHTML = formShell(
    `Upravit ${nazevKategorie} – ${prostredek.nazev}`, zpet, formId, obsah
  );

  prekresliPovinnostReseni();
}

function prekresliPovinnostReseni() {
  const stavSelect = document.getElementById("fZaznamStav");
  const label = document.getElementById("fZaznamReseniLabel");
  const pole = document.getElementById("fZaznamReseni");
  if (!stavSelect || !label || !pole) return;
  const otevreny = jeZaznamOtevreny(stavSelect.value);
  label.innerHTML = otevreny ? `Řešení <span class="text-muted">(nepovinné, dokud je záznam otevřený)</span>` : `Řešení <span class="text-danger">*</span>`;
  pole.required = !otevreny;
}

function ulozitFormZaznam(kategorie, stanicaId, prostredekId, zaznamId) {
  const s = getStanice(stanicaId);
  const prostredek = s.prostredky.find(p => p.id === prostredekId);
  const zdroj = kategorie === "porucha" ? DB.poruchy : DB.zavady;

  const datum = document.getElementById("fZaznamDatum").value;
  const cas = document.getElementById("fZaznamCas").value;
  const termin = document.getElementById("fZaznamTermin").value;
  const popis = document.getElementById("fZaznamPopis").value.trim();
  const popisEn = document.getElementById("fZaznamPopisEn").value.trim();
  const stavZaznamu = document.getElementById("fZaznamStav").value;
  const reseni = document.getElementById("fZaznamReseni").value.trim();

  const z = zdroj.find(x => x.id === zaznamId);
  z.datum = datum; z.cas = cas; z.stav = stavZaznamu; z.popis = popis; z.popisEn = popisEn; z.reseni = reseni;
  if (!jeZaznamOtevreny(stavZaznamu)) { z.reseniDatum = termin || z.reseniDatum || datum; delete z.planovaneDo; }
  else { z.planovaneDo = termin || null; delete z.reseniDatum; }

  appState.formDirty = false;
  renderSidebar();
  zapisLog(`Upraven záznam ${z.id} (${kategorie === "porucha" ? "porucha" : "závada"}) u prostředku „${prostredek.nazev}“ na stanovišti ${s.nazev}.`);
  showToast("Záznam byl upraven.");
  navigateHash(`#/stanoviste/${stanicaId}`);
}

/* --- Tiskový náhled --- */

function pripravTiskKontext(kategorie, zaznamId) {
  const zdroj = kategorie === "porucha" ? DB.poruchy : DB.zavady;
  const z = zdroj.find(x => x.id === zaznamId);
  if (!z) return null;
  const s = getStanice(z.stanovisteId);
  const prostredek = s ? s.prostredky.find(p => p.id === z.prostredekId) : null;
  const stavInfo = najdiVCiselniku(DB.stavyZaznamu, z.stav);
  const uzavreny = !jeZaznamOtevreny(z.stav);
  return {
    nadpis: kategorie === "porucha" ? "Záznam o poruše" : "Záznam o závadě",
    id: z.id,
    radky: [
      ["Stanoviště", s ? `${s.nazev} (${s.lokace})` : "—"],
      ["Prostředek", prostredek ? `${prostredek.nazev} (${prostredek.typ})` : (z.prostredek || "—")],
      ["Datum nahlášení", formatDatum(z.datum)],
      ["Čas poruchy", z.cas || "Neuvedeno"],
      ["Stav", stavInfo.nazev],
      [uzavreny ? "Datum opravy" : "Předpokládaný termín", uzavreny ? formatTermin(z.reseniDatum) : formatTermin(z.planovaneDo)],
    ],
    popisCs: z.popis || "—",
    popisEn: z.popisEn || "",
    reseni: z.reseni || "",
    stanicaId: z.stanovisteId,
  };
}

function stahnoutTiskPdf(kategorie, zaznamId) {
  const kontext = pripravTiskKontext(kategorie, zaznamId);
  if (!kontext) { showToast("Záznam nebyl nalezen."); return; }
  stahnoutPdf(kontext, `${kontext.id}.pdf`);
  showToast("PDF bylo staženo (zjednodušená verze bez diakritiky).");
}

function poslatTiskEmailem(kategorie, zaznamId) {
  const kontext = pripravTiskKontext(kategorie, zaznamId);
  if (!kontext) { showToast("Záznam nebyl nalezen."); return; }
  const predmet = encodeURIComponent(`${kontext.nadpis} ${kontext.id}`);
  const telo = encodeURIComponent(
    `${kontext.nadpis} ${kontext.id}\n\n` +
    kontext.radky.map(([l, v]) => `${l}: ${v || "-"}`).join("\n") +
    `\n\nPopis:\n${kontext.popisCs}\n` +
    (kontext.popisEn ? `\nDescription (EN):\n${kontext.popisEn}\n` : "") +
    (kontext.reseni ? `\nŘešení:\n${kontext.reseni}\n` : "") +
    `\n\n(Přílohu PDF prosím připojte ručně - z bezpečnostních důvodů ji prohlížeč nemůže do e-mailu vložit automaticky. Nejdřív si soubor stáhněte tlačítkem "Stáhnout PDF".)`
  );
  showToast("Otevírám e-mailového klienta…");
  window.location.href = `mailto:?subject=${predmet}&body=${telo}`;
}

function renderTisk(ctx) {
  const kontext = pripravTiskKontext(ctx.kategorie, ctx.zaznamId);
  if (!kontext) { navigate("stanoviste", { stanicaId: ctx.stanicaId }); return; }
  const s = getStanice(ctx.stanicaId);

  document.getElementById("app").innerHTML = `
    <div class="d-print-none mb-4 d-flex align-items-center gap-2 flex-wrap">
      <button class="btn btn-sm btn-outline-secondary" onclick="navigateHash('#/stanoviste/${ctx.stanicaId}')">
        <i class="bi bi-arrow-left"></i> Zpět
      </button>
      <div class="ms-auto d-flex gap-2 flex-wrap">
        <button class="btn btn-sm btn-outline-secondary" onclick="stahnoutTiskPdf('${ctx.kategorie}', '${ctx.zaznamId}')">
          <i class="bi bi-file-earmark-arrow-down"></i> Stáhnout PDF
        </button>
        <button class="btn btn-sm btn-outline-secondary" onclick="window.print()">
          <i class="bi bi-printer"></i> Vytisknout
        </button>
        <button class="btn btn-sm btn-outline-secondary" onclick="poslatTiskEmailem('${ctx.kategorie}', '${ctx.zaznamId}')">
          <i class="bi bi-envelope"></i> Poslat e-mailem
        </button>
      </div>
    </div>

    <div class="tisk-dokument">
      <div class="tisk-hlavicka">
        <div>
          <div class="tisk-nadpis">${kontext.nadpis}</div>
          <div class="text-muted">${s ? s.nazev + " – " + s.lokace : ""}</div>
        </div>
        <div class="tisk-id">${kontext.id}</div>
      </div>

      <table class="table table-bordered tisk-tabulka">
        <tbody>
          ${kontext.radky.map(([l, v]) => `<tr><th>${l}</th><td>${v}</td></tr>`).join("")}
        </tbody>
      </table>

      <div class="tisk-blok">
        <div class="tisk-blok-nadpis">Popis (česky)</div>
        <div class="tisk-blok-text">${kontext.popisCs.replace(/\n/g, "<br>")}</div>
      </div>

      ${kontext.popisEn ? `
      <div class="tisk-blok">
        <div class="tisk-blok-nadpis">Description (English)</div>
        <div class="tisk-blok-text">${kontext.popisEn.replace(/\n/g, "<br>")}</div>
      </div>` : ""}

      ${kontext.reseni ? `
      <div class="tisk-blok">
        <div class="tisk-blok-nadpis">Řešení</div>
        <div class="tisk-blok-text">${kontext.reseni.replace(/\n/g, "<br>")}</div>
      </div>` : ""}

      <div class="tisk-podpisy">
        <div class="tisk-podpis"><div class="tisk-podpis-cara"></div>Nahlásil</div>
        <div class="tisk-podpis"><div class="tisk-podpis-cara"></div>Převzal / opravil</div>
      </div>
    </div>

    <div class="d-print-none text-muted small mt-3 mx-auto" style="max-width: 800px;">
      <i class="bi bi-info-circle me-1"></i>
      „Stáhnout PDF“ vytvoří zjednodušený dokument bez diakritiky, funguje kompletně offline.
      Pro plnou kvalitu s diakritikou použijte „Vytisknout“ a v dialogu zvolte „Uložit jako PDF“.
    </div>
  `;
}
