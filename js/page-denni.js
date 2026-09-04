/* DENNÍ PŘEHLED */

function posunDen(smer) {
  const novy = pridejDny(appState.denAktualni, smer);
  if (novy < DEN_MIN || novy > DNES) return;
  appState.denAktualni = novy;
  rerenderDenniKontext();
}

function skocNaDnes() {
  appState.denAktualni = DNES;
  rerenderDenniKontext();
}

function rerenderDenniKontext() {
  if (appState.section === "denni") renderDenniPrehled();
  else if (appState.section === "stanoviste") renderStanoviste();
}

function renderDenniPrehled() {
  const den = appState.denAktualni;
  const udalosti = DB.denniUdalosti[den] || [];

  const staniceBloky = DB.stanoviste.map(s => {
    const zaznamy = udalosti.filter(u => u.stanovisteId === s.id).sort((a, b) => a.cas.localeCompare(b.cas));
    const barva = zaznamy.length ? "primary" : "secondary";
    return `
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-header bg-body-tertiary d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div class="d-flex align-items-center gap-3">
            <div class="icon-badge icon-badge-sm bg-${barva}-subtle text-${barva}-emphasis"><i class="bi bi-geo-alt-fill"></i></div>
            <div>
              <div class="fw-semibold">${s.nazev}</div>
              <div class="text-muted small">${s.lokace}</div>
            </div>
          </div>
          ${zaznamy.length ? `<span class="badge text-bg-light border">${zaznamy.length} záznamů</span>` : ""}
        </div>
        <div class="card-body">
          ${zaznamy.length ? timelineHtml(zaznamy) : prazdnyDenText("Pro tento den nejsou u tohoto stanoviště evidovány žádné záznamy.")}
        </div>
      </div>`;
  }).join("");

  document.getElementById("app").innerHTML = `
    <h4 class="mb-1">Denní přehled</h4>
    <div class="text-muted mb-4">Souhrnný přehled za všechna stanoviště, řazeno chronologicky v rámci každé jednotky. Úpravy záznamů se provádí přímo v detailu jednotlivého stanoviště.</div>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body d-flex align-items-center justify-content-between flex-wrap gap-2">
        <button class="btn btn-outline-secondary btn-sm" ${den <= DEN_MIN ? "disabled" : ""} onclick="posunDen(-1)">
          <i class="bi bi-chevron-left"></i> Předchozí den
        </button>

        <div class="text-center">
          <div class="fw-semibold fs-5">${formatDatumDlouhy(den)}</div>
          ${den !== DNES ? `<button class="btn btn-link btn-sm p-0" onclick="skocNaDnes()">Přejít na dnešek</button>` : `<span class="badge bg-primary-subtle text-primary-emphasis">Dnes</span>`}
        </div>

        <button class="btn btn-outline-secondary btn-sm" ${den >= DNES ? "disabled" : ""} onclick="posunDen(1)">
          Následující den <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>

    ${staniceBloky}
  `;
}

