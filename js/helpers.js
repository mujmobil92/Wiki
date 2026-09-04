/* POMOCNÉ FUNKCE */

function najdiVCiselniku(seznam, klic) {
  return seznam.find(t => t.klic === klic) || { klic, nazev: klic, barva: "secondary" };
}

function vytvorKlic(nazev, existujici) {
  const zaklad = nazev.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "polozka";
  let klic = zaklad, i = 2;
  while (existujici.includes(klic)) { klic = `${zaklad}-${i}`; i++; }
  return klic;
}

// Stav badge
function stavBadge(stavKlic) {
  const s = najdiVCiselniku(DB.stavyTechniky, stavKlic);
  return `<span class="badge text-bg-${s.barva}">${s.nazev}</span>`;
}

// Provoz ikona (servis = žlutá)
function provozIcon(stavKlic) {
  if (stavKlic === "servis") {
    return `<i class="bi bi-dash-circle-fill text-warning fs-5" title="V servisu"></i>`;
  }
  const s = najdiVCiselniku(DB.stavyTechniky, stavKlic);
  return s.provoz
    ? `<i class="bi bi-check-circle-fill text-success fs-5" title="V provozu"></i>`
    : `<i class="bi bi-x-circle-fill text-danger fs-5" title="Mimo provoz"></i>`;
}

function jeZaznamOtevreny(stavKlic) {
  const s = DB.stavyZaznamu.find(x => x.klic === stavKlic);
  return s ? s.otevreny : true;
}

function zaznamStavBadge(stavKlic) {
  const s = najdiVCiselniku(DB.stavyZaznamu, stavKlic);
  return `<span class="badge text-bg-${s.barva}">${s.nazev}</span>`;
}

function udalostBadge(typKlic) {
  const t = najdiVCiselniku(DB.typyUdalosti, typKlic);
  return `<span class="badge text-bg-${t.barva}">${t.nazev}</span>`;
}

function stavOptionsHtml(aktualni) {
  return DB.stavyTechniky.map(s => `<option value="${s.klic}" ${s.klic === aktualni ? "selected" : ""}>${s.nazev}</option>`).join("");
}

// Stav + zahájení údržby
function stavOptionsSUdrzbouHtml(aktualni) {
  const zakladni = stavOptionsHtml(aktualni);
  const udrzbaOptions = DB.typyUdrzby.map(t => `<option value="udrzba:${t.klic}">${t.nazev} – zahájit (${t.trvaniDni} ${sklonovatDny(t.trvaniDni)})</option>`).join("");
  return `${zakladni}<optgroup label="Zahájit údržbu">${udrzbaOptions}</optgroup>`;
}

function typOptionsHtml(aktualni) {
  return DB.typyUdalosti.map(t => `<option value="${t.klic}" ${t.klic === aktualni ? "selected" : ""}>${t.nazev}</option>`).join("");
}

function stavZaznamuOptionsHtml(aktualni) {
  return DB.stavyZaznamu.map(s => `<option value="${s.klic}" ${s.klic === aktualni ? "selected" : ""}>${s.nazev}</option>`).join("");
}

function formatDatum(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}. ${m}. ${y}`;
}

function formatTermin(iso) {
  return iso ? formatDatum(iso) : "Není určeno";
}

function formatDatumDlouhy(iso) {
  const dny = ["neděle", "pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota"];
  const dt = new Date(iso + "T00:00:00");
  const nazev = dny[dt.getDay()];
  return `${nazev.charAt(0).toUpperCase()}${nazev.slice(1)} ${formatDatum(iso)}`;
}

function formatCasTed() {
  const d = new Date();
  const den = String(d.getDate()).padStart(2, "0");
  const mesic = String(d.getMonth() + 1).padStart(2, "0");
  const rok = d.getFullYear();
  const hod = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${den}. ${mesic}. ${rok} ${hod}:${min}`;
}

// Přičtení dnů k datu
function pridejDny(iso, pocet) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + pocet);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function stanicaStav(stanice) {
  // Agregovaný stav stanoviště
  if (stanice.prostredky.some(p => p.stav === "porucha")) return "porucha";
  if (stanice.prostredky.some(p => p.stav === "omezeny" || p.stav === "mimo")) return "omezeny";
  return "ok";
}

function stavColor(stav) {
  return { ok: "success", omezeny: "warning", porucha: "danger", mimo: "secondary" }[stav] || "success";
}

function getStanice(id) {
  return DB.stanoviste.find(s => s.id === Number(id));
}

function escAttr(text) {
  return String(text || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function aktualniPohotovostProStanici(stanicaId) {
  return DB.pohotovosti.find(p => p.stanovisteId === stanicaId && DNES >= p.od && DNES <= p.do) || null;
}

// Viditelné záznamy (grace období)
function viditelneZaznamyProstredku(prostredekId) {
  return [...DB.poruchy, ...DB.zavady]
    .filter(z => z.prostredekId === prostredekId)
    .filter(z => jeZaznamOtevreny(z.stav) || (z.reseniDatum && pridejDny(z.reseniDatum, 1) >= DNES))
    .sort((a, b) => a.datum.localeCompare(b.datum));
}

function poruchySeznamHtml(prostredekId) {
  const zaznamy = viditelneZaznamyProstredku(prostredekId);
  if (!zaznamy.length) return `<span class="text-muted">—</span>`;
  return zaznamy.map(z => jeZaznamOtevreny(z.stav)
    ? `<div class="small text-danger radek-poruchy"><i class="bi bi-exclamation-triangle-fill me-1"></i>${z.popis}</div>`
    : `<div class="small text-muted text-decoration-line-through radek-poruchy"><i class="bi bi-check-circle me-1 text-success"></i>${z.popis}</div>`
  ).join("");
}

// Sloupce Od/Do
function poruchyOdDoHtml(prostredekId, sloupec) {
  const zaznamy = viditelneZaznamyProstredku(prostredekId);
  if (!zaznamy.length) return `<span class="text-muted">—</span>`;
  return zaznamy.map(z => {
    const hodnota = sloupec === "od"
      ? formatDatum(z.datum)
      : (jeZaznamOtevreny(z.stav) ? formatTermin(z.planovaneDo) : formatDatum(z.reseniDatum));
    return `<div class="small text-muted radek-poruchy">${hodnota}</div>`;
  }).join("");
}

// Nejstarší otevřený záznam
function otevrenyZaznamProstredku(prostredekId) {
  return [...DB.poruchy, ...DB.zavady]
    .filter(z => z.prostredekId === prostredekId && jeZaznamOtevreny(z.stav))
    .sort((a, b) => a.datum.localeCompare(b.datum))[0] || null;
}

// Notifikace – dnešní změny
function pocetZmenDnesProStanici(stanicaId) {
  return [...DB.poruchy, ...DB.zavady].filter(z =>
    z.stanovisteId === stanicaId && (z.datum === DNES || z.reseniDatum === DNES)
  ).length;
}

function notifBadge(pocet) {
  return pocet ? `<span class="badge text-bg-danger">${pocet}</span>` : "";
}

// Roky záznamů
function rokyZeZaznamu(zaznamy) {
  const set = new Set(zaznamy.map(z => Number(z.datum.slice(0, 4))));
  if (!set.size) set.add(Number(DNES.slice(0, 4)));
  return [...set].sort((a, b) => a - b);
}

function getZaznamFiltr(kategorie, prostredekId) {
  const key = kategorie + "_" + prostredekId;
  if (!appState.zaznamFiltry[key]) {
    appState.zaznamFiltry[key] = { rok: null, razeni: "desc" };
  }
  return appState.zaznamFiltry[key];
}

// Nadpis sekce
function sectionHeading(icon, barva, title, subtitle, akceHtml) {
  return `
    <div class="section-heading d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div class="d-flex align-items-center gap-3">
        <div class="icon-badge bg-${barva}-subtle text-${barva}-emphasis"><i class="bi ${icon}"></i></div>
        <div>
          <h5>${title}</h5>
          ${subtitle ? `<div class="text-muted section-subtitle">${subtitle}</div>` : ""}
        </div>
      </div>
      ${akceHtml || ""}
    </div>`;
}

// Časová osa (needitovatelná)
function timelineHtml(zaznamy) {
  return `
    <div class="timeline-den">
      ${zaznamy.map(u => {
        const t = najdiVCiselniku(DB.typyUdalosti, u.typ);
        return `
        <div class="timeline-item" style="--dot-barva: var(--bs-${t.barva});">
          <div class="d-flex align-items-start gap-3 flex-wrap">
            <span class="fw-semibold text-nowrap timeline-time">${u.cas}</span>
            ${udalostBadge(u.typ)}
            <span class="flex-grow-1">${u.text}</span>
          </div>
        </div>`;
      }).join("")}
    </div>`;
}

// Časová osa (editovatelná)
function timelineEditovatelnyHtml(polozky, stanicaId, den) {
  return `
    <div class="timeline-den">
      ${polozky.map(({ u, idx }) => {
        const t = najdiVCiselniku(DB.typyUdalosti, u.typ);
        return `
        <div class="timeline-item" style="--dot-barva: var(--bs-${t.barva});">
          <div class="d-flex align-items-start gap-3 flex-wrap">
            <span class="fw-semibold text-nowrap timeline-time">${u.cas}</span>
            ${udalostBadge(u.typ)}
            <span class="flex-grow-1">${u.text}</span>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-secondary py-0 px-1" title="Upravit" onclick="navigateHash('${hashUpravitUdalost(stanicaId, den, idx)}')">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger py-0 px-1" title="Odebrat" onclick="smazatUdalost('${den}', ${idx})">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>`;
      }).join("")}
    </div>`;
}

function prazdnyDenText(text) {
  return `<div class="text-muted small py-1"><i class="bi bi-dash-circle me-1"></i>${text}</div>`;
}

function showToast(text) {
  document.getElementById("mainToastBody").textContent = text;
  const toastEl = document.getElementById("mainToast");
  bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2500 }).show();
}

/* Potvrzovací okno */
function confirmAction(title, body, onConfirm) {
  document.getElementById("confirmModalTitle").textContent = title;
  document.getElementById("confirmModalBody").textContent = body;
  const modalEl = document.getElementById("confirmModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  const btn = document.getElementById("confirmModalOkBtn");
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  newBtn.addEventListener("click", () => {
    modal.hide();
    onConfirm();
  });
  modal.show();
}

function zapisLog(text) {
  DB.logy.unshift({ cas: formatCasTed(), text });
}

/* Obálka formulářové stránky */
function formShell(nadpis, zpetHash, formId, obsahHtml) {
  return `
    <div class="mb-4">
      <button class="btn btn-sm btn-outline-secondary mb-3" onclick="navigateHash('${zpetHash}')">
        <i class="bi bi-arrow-left"></i> Zpět
      </button>
      <h4 class="mb-0">${nadpis}</h4>
    </div>
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <form id="${formId}" novalidate>
          ${obsahHtml}
        </form>
      </div>
    </div>
  `;
}


/* PDF GENERÁTOR (offline, bez diakritiky) */

function stripDiakritika(str) {
  const mapa = {
    "á": "a", "č": "c", "ď": "d", "é": "e", "ě": "e", "í": "i", "ň": "n", "ó": "o", "ř": "r", "š": "s", "ť": "t", "ú": "u", "ů": "u", "ý": "y", "ž": "z",
    "Á": "A", "Č": "C", "Ď": "D", "É": "E", "Ě": "E", "Í": "I", "Ň": "N", "Ó": "O", "Ř": "R", "Š": "S", "Ť": "T", "Ú": "U", "Ů": "U", "Ý": "Y", "Ž": "Z",
  };
  return String(str || "").replace(/[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/g, ch => mapa[ch] || ch);
}

function pdfEscape(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function zalomText(text, maxZnaku) {
  const slova = String(text).split(/\s+/);
  const radky = [];
  let radek = "";
  slova.forEach(slovo => {
    if ((radek + " " + slovo).trim().length > maxZnaku) {
      if (radek) radky.push(radek);
      radek = slovo;
    } else {
      radek = (radek ? radek + " " : "") + slovo;
    }
  });
  if (radek) radky.push(radek);
  return radky;
}

// kontext: nadpis, id, radky, popisCs, popisEn, reseni
function vytvorPdfBajty(kontext) {
  const A4W = 595.28, A4H = 841.89;
  const marginX = 50, marginTop = 60, marginBottom = 55;
  const lineH = 14, maxChars = 92;

  let pages = [[]];
  let pageIdx = 0;
  let y = A4H - marginTop;

  function ensureSpace(potreba) {
    if (y - potreba < marginBottom) {
      pageIdx++;
      pages[pageIdx] = [];
      y = A4H - marginTop;
    }
  }
  function text(x, size, bold, t) {
    pages[pageIdx].push({ type: "text", x, y, size, bold, text: pdfEscape(stripDiakritika(t)) });
  }
  function pridejRadek(label, value) {
    ensureSpace(lineH);
    text(marginX, 10, true, label);
    text(marginX + 150, 10, false, value || "-");
    y -= lineH;
  }
  function pridejOdstavec(nadpis, obsah) {
    ensureSpace(20);
    text(marginX, 9, true, nadpis.toUpperCase());
    y -= 14;
    zalomText(stripDiakritika(obsah || "-"), maxChars).forEach(r => {
      ensureSpace(lineH);
      text(marginX, 10, false, r);
      y -= lineH;
    });
    y -= 8;
  }

  text(marginX, 16, true, kontext.nadpis);
  text(A4W - marginX - 110, 12, true, kontext.id);
  y -= 22;
  pages[pageIdx].push({ type: "line", x1: marginX, y1: y, x2: A4W - marginX, y2: y });
  y -= 20;

  kontext.radky.forEach(([l, v]) => pridejRadek(l, v));
  y -= 8;

  pridejOdstavec("Popis (cesky)", kontext.popisCs);
  if (kontext.popisEn) pridejOdstavec("Description (English)", kontext.popisEn);
  if (kontext.reseni) pridejOdstavec("Reseni", kontext.reseni);

  const objs = [];
  const fontRegNum = objs.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);
  const fontBoldNum = objs.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`);

  const pocetStranek = pages.length;
  const pagesObjNum = 3;
  const pageObjNums = [];
  const contentObjNums = [];
  for (let i = 0; i < pocetStranek; i++) {
    pageObjNums.push(4 + i);
    contentObjNums.push(4 + pocetStranek + i);
  }

  objs.push(null); // Pages
  function sestavStream(ops) {
    let stream = "";
    ops.forEach(op => {
      if (op.type === "text") {
        const font = op.bold ? "/F2" : "/F1";
        stream += `BT ${font} ${op.size} Tf ${op.x.toFixed(2)} ${op.y.toFixed(2)} Td (${op.text}) Tj ET\n`;
      } else if (op.type === "line") {
        stream += `${op.x1.toFixed(2)} ${op.y1.toFixed(2)} m ${op.x2.toFixed(2)} ${op.y2.toFixed(2)} l S\n`;
      }
    });
    return stream;
  }
  pages.forEach((ops, i) => {
    objs.push(`<< /Type /Page /Parent ${pagesObjNum} 0 R /Resources << /Font << /F1 ${fontRegNum} 0 R /F2 ${fontBoldNum} 0 R >> >> /MediaBox [0 0 ${A4W} ${A4H}] /Contents ${contentObjNums[i]} 0 R >>`);
  });
  pages.forEach(ops => {
    const stream = sestavStream(ops);
    objs.push(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
  });
  objs[2] = `<< /Type /Pages /Kids [${pageObjNums.map(n => n + " 0 R").join(" ")}] /Count ${pocetStranek} >>`;

  const catalogNum = objs.push(`<< /Type /Catalog /Pages ${pagesObjNum} 0 R >>`);

  let out = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objs.length; i++) {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${objs[i]}\nendobj\n`;
  }
  const xrefStart = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objs.length; i++) {
    out += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  }
  out += `trailer\n<< /Size ${objs.length + 1} /Root ${catalogNum} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return out;
}

function stahnoutPdf(kontext, nazevSouboru) {
  const bajty = vytvorPdfBajty(kontext);
  const pole = new Uint8Array(bajty.length);
  for (let i = 0; i < bajty.length; i++) pole[i] = bajty.charCodeAt(i) & 0xff;
  const blob = new Blob([pole], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nazevSouboru;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* Validace formuláře */
function validujFormular(formId) {
  const form = document.getElementById(formId);
  if (!form) return true;
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    const prvniChybne = form.querySelector(":invalid");
    if (prvniChybne) prvniChybne.focus();
    showToast("Zkontrolujte prosím zvýrazněná povinná pole.");
    return false;
  }
  form.classList.add("was-validated");
  return true;
}

/* PLÁNOVANÁ ÚDRŽBA */

function sklonovatDny(n) {
  if (n === 1) return "den";
  if (n >= 2 && n <= 4) return "dny";
  return "dní";
}

function servisInfoHtml(prostredek) {
  if (!prostredek.servis) return `<span class="text-muted">—</span>`;
  const typ = najdiVCiselniku(DB.typyUdrzby, prostredek.servis.typKlic);
  return `<span class="badge text-bg-warning">${typ.nazev} do ${formatDatum(prostredek.servis.konec)}</span>`;
}

// Automatické ukončení servisu
function zkontrolujDokonceneServisy() {
  DB.stanoviste.forEach(s => {
    s.prostredky.forEach(p => {
      if (p.servis && p.servis.konec <= DNES) {
        const typ = najdiVCiselniku(DB.typyUdrzby, p.servis.typKlic);
        if (!DB.denniUdalosti[p.servis.konec]) DB.denniUdalosti[p.servis.konec] = [];
        DB.denniUdalosti[p.servis.konec].push({
          cas: "08:00", typ: "info", stanovisteId: s.id,
          text: `Ukončení ${typ.nazev} na prostředku ${p.nazev}.`,
        });
        zapisLog(`Servis (${typ.nazev}) prostředku „${p.nazev}“ na stanovišti ${s.nazev} byl automaticky ukončen, stav vrácen na původní hodnotu.`);
        p.stav = p.servis.puvodniStav || "ok";
        p.servis = null;
      }
    });
  });
}

/* Doplnění osoby do formuláře */
function vyplnitOsobu(osobaId) {
  if (!osobaId) return;
  const o = DB.osoby.find(x => x.id === Number(osobaId));
  if (!o) return;
  const jmenoEl = document.getElementById("fPohotovostJmeno");
  const kontaktEl = document.getElementById("fPohotovostKontakt");
  if (jmenoEl) jmenoEl.value = o.jmeno;
  if (kontaktEl) kontaktEl.value = o.kontakt || "";
  appState.formDirty = true;
}

/* Přepínač motivu */
function prepnoutMotiv() {
  const aktualni = document.documentElement.getAttribute("data-bs-theme") === "dark" ? "dark" : "light";
  const novy = aktualni === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-bs-theme", novy);
  try { localStorage.setItem("motiv", novy); } catch (e) {}
  renderSidebar();
}
