/* SIDEBAR */

function menuHtml() {
  const aktivniStanicaId = appState.section === "form" && appState.formKontext
    ? appState.formKontext.stanicaId
    : appState.stanicaId;
  const adminAktivni = appState.section === "admin"
    || (appState.section === "form" && appState.formKontext && (appState.formKontext.typ === "stanice" || appState.formKontext.typ === "taxonomie" || appState.formKontext.typ === "osoba"));

  // Přepínač motivu
  const jeTmavy = document.documentElement.getAttribute("data-bs-theme") === "dark";
  const motiv = jeTmavy
    ? { ikona: "bi-sun-fill", trida: "bg-warning-subtle text-warning-emphasis", nazev: "světlý" }
    : { ikona: "bi-moon-stars-fill", trida: "btn-dark", nazev: "tmavý" };

  const stanoviste = DB.stanoviste.map(s => {
    const active = (appState.section === "stanoviste" || appState.section === "form") && aktivniStanicaId === s.id;
    const stav = stanicaStav(s);
    const dot = { ok: "text-success", omezeny: "text-warning", porucha: "text-danger" }[stav] || "text-success";
    const cls = active ? "active bg-primary-subtle text-primary-emphasis fw-semibold" : "link-body-emphasis";
    const zmeny = pocetZmenDnesProStanici(s.id);
    return `
      <a href="#" class="nav-link d-flex align-items-center gap-2 py-2 ps-4 pe-3 mx-2 ${cls}"
         onclick="navigate('stanoviste', {stanicaId: ${s.id}}); return false;">
        <i class="bi bi-circle-fill ${dot}" style="font-size:.5rem;"></i>
        <span class="text-truncate flex-grow-1">${s.nazev}</span>
        ${zmeny ? `<span class="badge text-bg-danger" style="font-size:.65rem;">${zmeny}</span>` : ""}
      </a>`;
  }).join("");

  const link = (section, icon, label) => {
    const active = appState.section === section;
    const cls = active ? "active bg-primary-subtle text-primary-emphasis fw-semibold" : "link-body-emphasis";
    return `
      <a href="#" class="nav-link d-flex align-items-center gap-2 py-2 px-3 mx-2 ${cls}"
         onclick="navigate('${section}'); return false;">
        <i class="bi ${icon} fs-5"></i> ${label}
      </a>`;
  };

  const adminLink = (tab, icon, label) => {
    const active = adminAktivni && appState.adminTab === tab;
    const cls = active ? "active bg-primary-subtle text-primary-emphasis fw-semibold" : "link-body-emphasis";
    return `
      <a href="#" class="nav-link d-flex align-items-center gap-2 py-2 ps-4 pe-3 mx-2 ${cls}"
         onclick="navigate('admin', {adminTab: '${tab}'}); return false;">
        <i class="bi ${icon}"></i> ${label}
      </a>`;
  };

  return `
    <div class="p-3 border-bottom">
      <div class="d-flex align-items-center gap-2">
        <div class="bg-primary-subtle text-primary-emphasis d-flex align-items-center justify-content-center flex-shrink-0" style="width:2.75rem;height:2.75rem;">
          <i class="bi bi-buildings fs-4"></i>
        </div>
        <div class="flex-grow-1">
          <div class="fw-semibold">Interní portál</div>
          <div class="text-muted small">Přehled stanovišť</div>
        </div>
        <button type="button" class="btn btn-sm ${motiv.trida}" onclick="prepnoutMotiv()" title="Přepnout na ${motiv.nazev} režim">
          <i class="bi ${motiv.ikona}"></i>
        </button>
      </div>
    </div>
    <nav class="nav flex-column py-2">
      ${link("dashboard", "bi-speedometer2", "Dashboard")}
      ${link("denni", "bi-calendar3", "Denní přehled")}

      <div class="px-3 pt-3 pb-1 text-uppercase text-muted small fw-semibold">Stanoviště</div>
      ${stanoviste}

      <hr class="my-2 mx-3">
      <div class="px-3 pt-1 pb-1 text-uppercase text-muted small fw-semibold">Administrace</div>
      ${adminLink("stanoviste", "bi-building-gear", "Stanoviště")}
      ${adminLink("osoby", "bi-people", "Osoby")}
      ${adminLink("typy", "bi-tags", "Typy událostí")}
      ${adminLink("stavy-techniky", "bi-toggle2-on", "Stavy techniky")}
      ${adminLink("stavy-zaznamu", "bi-flag", "Stavy záznamů")}
      ${adminLink("udrzba", "bi-tools", "Typy údržby")}
      ${adminLink("logy", "bi-clock-history", "Logy")}
    </nav>
  `;
}

function renderSidebar() {
  document.getElementById("sidebarContent").innerHTML = menuHtml();
  document.getElementById("sidebarContentMobile").innerHTML = menuHtml();
}

/* BREADCRUMB */

function renderBreadcrumb() {
  const items = [`<li class="breadcrumb-item"><a href="#" onclick="navigate('dashboard'); return false;">Dashboard</a></li>`];

  if (appState.section === "stanoviste") {
    const s = getStanice(appState.stanicaId);
    items.push(`<li class="breadcrumb-item active" aria-current="page">${s ? s.nazev : "Stanoviště"}</li>`);
  } else if (appState.section === "denni") {
    items.push(`<li class="breadcrumb-item active" aria-current="page">Denní přehled</li>`);
  } else if (appState.section === "admin") {
    const nazvy = { stanoviste: "Stanoviště", osoby: "Osoby", logy: "Logy", "typy": "Typy událostí", "stavy-techniky": "Stavy techniky", "stavy-zaznamu": "Stavy záznamů", "udrzba": "Typy údržby" };
    items.push(`<li class="breadcrumb-item active" aria-current="page">Administrace – ${nazvy[appState.adminTab] || appState.adminTab}</li>`);
  } else if (appState.section === "form") {
    const ctx = appState.formKontext || {};
    if (ctx.stanicaId) {
      const s = getStanice(ctx.stanicaId);
      items.push(`<li class="breadcrumb-item"><a href="#" onclick="navigateHash('#/stanoviste/${ctx.stanicaId}'); return false;">${s ? s.nazev : "Stanoviště"}</a></li>`);
    } else {
      items.push(`<li class="breadcrumb-item"><a href="#" onclick="navigate('admin', {adminTab: 'stanoviste'}); return false;">Administrace</a></li>`);
    }
    items.push(`<li class="breadcrumb-item active" aria-current="page">${ctx.akce === "upravit" ? "Úprava" : "Nový záznam"}</li>`);
  } else {
    items[0] = `<li class="breadcrumb-item active" aria-current="page">Dashboard</li>`;
  }

  document.getElementById("breadcrumb").innerHTML = items.join("");
}

