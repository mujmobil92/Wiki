/* DASHBOARD */

function kpiCard(icon, barva, label, hodnota) {
  return `
    <div class="col-6 col-lg-3">
      <div class="card h-100 border-0 shadow-sm">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="icon-badge bg-${barva}-subtle text-${barva}-emphasis">
            <i class="bi ${icon}"></i>
          </div>
          <div>
            <div class="text-muted small">${label}</div>
            <div class="fs-2 fw-bold lh-1 mt-1">${hodnota}</div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderDashboard() {
  const pocetStanovist = DB.stanoviste.length;
  const pocetProstredku = DB.stanoviste.reduce((sum, s) => sum + s.prostredky.length, 0);
  const poruchyReseni = DB.poruchy.filter(p => jeZaznamOtevreny(p.stav)).length;
  const zavadyReseni = DB.zavady.filter(z => jeZaznamOtevreny(z.stav)).length;

  const staniceSekce = DB.stanoviste.map(s => {
    const stav = stanicaStav(s);
    const barva = stavColor(stav);
    const pocetVporucha = s.prostredky.filter(p => p.stav === "porucha").length;
    const zmeny = pocetZmenDnesProStanici(s.id);
    const pohotovost = aktualniPohotovostProStanici(s.id);

    const radky = s.prostredky.map(p => `
      <tr>
        <td class="fw-semibold">${p.nazev}</td>
        <td class="text-center">${provozIcon(p.stav)}</td>
        <td>${stavBadge(p.stav)}${p.servis ? `<div class="mt-1">${servisInfoHtml(p)}</div>` : ""}</td>
        <td class="align-top">${poruchySeznamHtml(p.id)}</td>
        <td class="align-top text-center">${poruchyOdDoHtml(p.id, "od")}</td>
        <td class="align-top text-center">${poruchyOdDoHtml(p.id, "do")}</td>
      </tr>`).join("");

    return `
      <div class="card border-0 shadow-sm mb-4 border-start border-4 border-${barva} card-hover">
        <div class="card-header bg-body-tertiary d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div class="d-flex align-items-center gap-3">
            <div class="icon-badge icon-badge-sm bg-${barva}-subtle text-${barva}-emphasis"><i class="bi bi-building"></i></div>
            <div>
              <div class="fw-semibold d-flex align-items-center gap-2">${s.nazev} ${notifBadge(zmeny)}</div>
              <div class="text-muted small"><i class="bi bi-geo-alt"></i> ${s.lokace}</div>
              <div class="text-muted small">${s.prostredky.length} prostředků${pocetVporucha ? `, <span class="text-danger fw-semibold">${pocetVporucha} v poruše</span>` : ""}</div>
              <div class="text-muted small">Pohotovost: ${pohotovost ? `<span class="fw-semibold">${pohotovost.jmeno}</span>` : "—"}</div>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            ${stavBadge(stav)}
            <button class="btn btn-sm btn-primary" onclick="navigate('stanoviste', {stanicaId: ${s.id}})">
              Podrobnosti stanoviště <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead class="table-header-tema">
              <tr><th>Název</th><th class="text-center">Provoz</th><th>Stav</th><th>Poruchy</th><th class="text-center">Od</th><th class="text-center">Do</th></tr>
            </thead>
            <tbody>${radky}</tbody>
          </table>
        </div>
      </div>`;
  }).join("");

  document.getElementById("app").innerHTML = `
    <div class="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-4">
      <div>
        <h4 class="mb-1">Dashboard</h4>
        <div class="text-muted">Přehled provozuschopnosti a stavu jednotlivých stanovišť.</div>
      </div>
      <div class="text-end">
        <span class="badge text-bg-light border fs-6 fw-normal py-2 px-3">
          <i class="bi bi-calendar-check me-1"></i>${formatDatumDlouhy(DNES)}
        </span>
        <div class="text-muted small mt-1">Provozní den se přepíná v 8:00 (předání směny)</div>
      </div>
    </div>

    <div class="row g-3 mb-4">
      ${kpiCard("bi-buildings", "primary", "Stanoviště", pocetStanovist)}
      ${kpiCard("bi-truck", "secondary", "Prostředky celkem", pocetProstredku)}
      ${kpiCard("bi-exclamation-octagon", "danger", "Poruchy v řešení", poruchyReseni)}
      ${kpiCard("bi-flag", "warning", "Závady v řešení", zavadyReseni)}
    </div>

    ${staniceSekce}
  `;
}

