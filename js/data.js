/* DATABÁZE */

const DB = {

  stanoviste: [
    {
      id: 1,
      nazev: "Stanoviště Sever",
      lokace: "Praha 8 – Libeň",
      prostredky: [
        { id: 101, nazev: "CAS 20 Tatra Terrno", typ: "Cisternová automobilová stříkačka", stav: "ok" },
        { id: 102, nazev: "RZA Ford Transit", typ: "Rychlý zásahový automobil", stav: "porucha" },
        { id: 103, nazev: "Motorová stříkačka PS12", typ: "Přenosná technika", stav: "ok" },
      ]
    },
    {
      id: 2,
      nazev: "Stanoviště Jih",
      lokace: "Praha 4 – Krč",
      prostredky: [
        { id: 201, nazev: "CAS 30 Scania", typ: "Cisternová automobilová stříkačka", stav: "ok" },
        { id: 202, nazev: "Plošina AP27", typ: "Automobilová plošina", stav: "omezeny" },
        { id: 203, nazev: "Generátor Honda EU70", typ: "Přenosná technika", stav: "ok" },
      ]
    },
    {
      id: 3,
      nazev: "Stanoviště Centrum",
      lokace: "Praha 1 – Staré Město",
      prostredky: [
        { id: 301, nazev: "CAS 20 MAN", typ: "Cisternová automobilová stříkačka", stav: "ok" },
        { id: 302, nazev: "Velitelský vůz Škoda Kodiaq", typ: "Osobní vozidlo", stav: "ok" },
        { id: 303, nazev: "Člun Zodiac", typ: "Vodní technika", stav: "mimo" },
      ]
    },
    {
      id: 4,
      nazev: "Stanoviště Východ",
      lokace: "Praha 9 – Hloubětín",
      prostredky: [
        { id: 401, nazev: "CAS 24 Iveco", typ: "Cisternová automobilová stříkačka", stav: "porucha" },
        { id: 402, nazev: "RZA VW Transporter", typ: "Rychlý zásahový automobil", stav: "ok" },
      ]
    },
  ],

  // Poruchy
  poruchy: [
    { id: "P-2026-014", stanovisteId: 1, prostredekId: 102, prostredek: "RZA Ford Transit",
      datum: "2026-09-01", popis: "Nefunkční výstražný maják, nepravidelné blikání.",
      stav: "reseni", planovaneDo: "2026-09-05", reseni: "" },
    { id: "P-2026-012", stanovisteId: 2, prostredekId: 202, prostredek: "Plošina AP27",
      datum: "2026-08-27", popis: "Únik hydraulického oleje na výsuvném rameni.",
      stav: "reseni", planovaneDo: "2026-09-10", reseni: "" },
    { id: "P-2026-011", stanovisteId: 3, prostredekId: 303, prostredek: "Člun Zodiac",
      datum: "2026-08-20", popis: "Poškozený trup, prasklina po nárazu do překážky.",
      stav: "reseni", planovaneDo: null, reseni: "" },
    { id: "P-2026-009", stanovisteId: 4, prostredekId: 401, prostredek: "CAS 24 Iveco",
      datum: "2026-08-15", popis: "Porucha čerpadla, neudrží požadovaný tlak.",
      stav: "reseni", planovaneDo: "2026-09-08", reseni: "" },
    { id: "P-2026-005", stanovisteId: 1, prostredekId: 101, prostredek: "CAS 20 Tatra Terrno",
      datum: "2026-07-30", popis: "Prasklá hadice chladicího systému motoru.",
      stav: "opraveno", reseniDatum: "2026-08-02", reseni: "Vyměněna hadice, doplněna chladicí kapalina, provedena zkouška na stojanu." },
    { id: "P-2026-002", stanovisteId: 2, prostredekId: 201, prostredek: "CAS 30 Scania",
      datum: "2026-07-10", popis: "Vadný senzor tlaku v pneumatice přední nápravy.",
      stav: "opraveno", reseniDatum: "2026-07-14", reseni: "Výměna senzoru, kalibrace systému TPMS." },
    { id: "P-2025-031", stanovisteId: 1, prostredekId: 101, prostredek: "CAS 20 Tatra Terrno",
      datum: "2025-11-12", popis: "Porucha startéru za nízkých teplot.",
      stav: "opraveno", reseniDatum: "2025-11-15", reseni: "Výměna startéru, otestováno v mrazicím boxu." },
  ],

  // Závady
  zavady: [
    { id: "Z-2026-021", stanovisteId: 1, prostredekId: 101, prostredek: "CAS 20 Tatra Terrno",
      datum: "2026-08-30", popis: "Neúplná lékárnička – chybí obvazový materiál.",
      stav: "reseni", planovaneDo: "2026-09-06", reseni: "" },
    { id: "Z-2026-020", stanovisteId: 1, prostredekId: 103, prostredek: "Motorová stříkačka PS12",
      datum: "2026-08-22", popis: "Opotřebené sací hadice, drobná netěsnost.",
      stav: "opraveno", reseniDatum: "2026-09-02", reseni: "Sací hadice vyměněny za nové." },
    { id: "Z-2026-019", stanovisteId: 2, prostredekId: 201, prostredek: "CAS 30 Scania",
      datum: "2026-08-18", popis: "Prasklé stěrače předního skla.",
      stav: "opraveno", reseniDatum: "2026-08-19", reseni: "Stěrače vyměněny za nové." },
    { id: "Z-2026-018", stanovisteId: 3, prostredekId: 302, prostredek: "Velitelský vůz Škoda Kodiaq",
      datum: "2026-08-29", popis: "Nefunkční osvětlení zavazadlového prostoru.",
      stav: "reseni", planovaneDo: null, reseni: "" },
    { id: "Z-2026-017", stanovisteId: 4, prostredekId: 402, prostredek: "RZA VW Transporter",
      datum: "2026-08-26", popis: "Opotřebené pneumatiky blížící se limitu dezénu.",
      stav: "reseni", planovaneDo: "2026-09-12", reseni: "" },
    { id: "Z-2026-022", stanovisteId: 2, prostredekId: 203, prostredek: "Generátor Honda EU70",
      datum: "2026-09-03", popis: "Netěsnost palivové nádrže.",
      stav: "reseni", planovaneDo: null, reseni: "" },
    { id: "Z-2025-009", stanovisteId: 1, prostredekId: 101, prostredek: "CAS 20 Tatra Terrno",
      datum: "2025-06-02", popis: "Odřená polepová grafika na dveřích.",
      stav: "opraveno", reseniDatum: "2025-06-10", reseni: "Polep obnoven." },
  ],

  // Pohotovosti
  pohotovosti: [
    { stanovisteId: 1, tyden: "35", od: "2026-08-25", do: "2026-08-31", jmeno: "prap. Jana Nováková", kontakt: "725 100 111" },
    { stanovisteId: 1, tyden: "36", od: "2026-09-01", do: "2026-09-07", jmeno: "nprap. Petr Svoboda", kontakt: "725 100 112" },
    { stanovisteId: 1, tyden: "37", od: "2026-09-08", do: "2026-09-14", jmeno: "rtm. Martin Dvořák", kontakt: "725 100 113" },
    { stanovisteId: 1, tyden: "38", od: "2026-09-15", do: "2026-09-21", jmeno: "prap. Lucie Procházková", kontakt: "725 100 114" },

    { stanovisteId: 2, tyden: "35", od: "2026-08-25", do: "2026-08-31", jmeno: "nprap. Tomáš Horák", kontakt: "725 200 111" },
    { stanovisteId: 2, tyden: "36", od: "2026-09-01", do: "2026-09-07", jmeno: "rtm. Eva Bartošová", kontakt: "725 200 112" },
    { stanovisteId: 2, tyden: "37", od: "2026-09-08", do: "2026-09-14", jmeno: "prap. Jakub Novotný", kontakt: "725 200 113" },
    { stanovisteId: 2, tyden: "38", od: "2026-09-15", do: "2026-09-21", jmeno: "nprap. Kateřina Veselá", kontakt: "725 200 114" },

    { stanovisteId: 3, tyden: "35", od: "2026-08-25", do: "2026-08-31", jmeno: "rtm. Pavel Kučera", kontakt: "725 300 111" },
    { stanovisteId: 3, tyden: "36", od: "2026-09-01", do: "2026-09-07", jmeno: "prap. Michaela Malá", kontakt: "725 300 112" },
    { stanovisteId: 3, tyden: "37", od: "2026-09-08", do: "2026-09-14", jmeno: "nprap. David Beneš", kontakt: "725 300 113" },
    { stanovisteId: 3, tyden: "38", od: "2026-09-15", do: "2026-09-21", jmeno: "rtm. Hana Sedláková", kontakt: "725 300 114" },

    { stanovisteId: 4, tyden: "35", od: "2026-08-25", do: "2026-08-31", jmeno: "prap. Jiří Král", kontakt: "725 400 111" },
    { stanovisteId: 4, tyden: "36", od: "2026-09-01", do: "2026-09-07", jmeno: "nprap. Barbora Marková", kontakt: "725 400 112" },
    { stanovisteId: 4, tyden: "37", od: "2026-09-08", do: "2026-09-14", jmeno: "rtm. Ondřej Pospíšil", kontakt: "725 400 113" },
    { stanovisteId: 4, tyden: "38", od: "2026-09-15", do: "2026-09-21", jmeno: "prap. Nikola Fialová", kontakt: "725 400 114" },
  ],

  // Denní přehled
  denniUdalosti: {
    "2026-08-28": [
      { cas: "08:00", typ: "info", stanovisteId: 2, text: "Pravidelná kontrola tlakových lahví." },
    ],
    "2026-09-01": [
      { cas: "09:00", typ: "info", stanovisteId: 1, text: "Pravidelná údržba – CAS 20 Tatra Terrno." },
      { cas: "13:20", typ: "info", stanovisteId: 1, text: "Kontrola hasicích přístrojů." },
      { cas: "15:45", typ: "porucha", stanovisteId: 1, text: "Nahlášena porucha P-2026-014 – RZA Ford Transit." },
    ],
    "2026-09-02": [
      { cas: "16:40", typ: "zasah", stanovisteId: 3, text: "Výjezd – technická pomoc." },
    ],
    "2026-09-03": [
      { cas: "07:30", typ: "info", stanovisteId: 1, text: "Ranní kontrola techniky." },
      { cas: "10:15", typ: "zasah", stanovisteId: 2, text: "Výjezd – dopravní nehoda." },
      { cas: "14:00", typ: "porucha", stanovisteId: 2, text: "Kontrola stavu poruchy P-2026-012 – Plošina AP27, oprava pokračuje." },
      { cas: "16:00", typ: "info", stanovisteId: 2, text: "Plánovaná revize – Plošina AP27." },
    ],
  },

  // Číselníky
  typyUdalosti: [
    { klic: "info", nazev: "Info", barva: "primary" },
    { klic: "zasah", nazev: "Zásah", barva: "danger" },
    { klic: "porucha", nazev: "Porucha", barva: "warning" },
    { klic: "skoleni", nazev: "Školení", barva: "secondary" },
  ],

  stavyTechniky: [
    { klic: "ok", nazev: "Bojeschopný", barva: "success", provoz: true },
    { klic: "omezeny", nazev: "Omezeně bojeschopný", barva: "warning", provoz: true },
    { klic: "porucha", nazev: "Nebojeschopný – porucha", barva: "danger", provoz: false },
    { klic: "mimo", nazev: "Vyřazen z provozu", barva: "secondary", provoz: false },
    // servis
    { klic: "servis", nazev: "V servisu", barva: "info", provoz: false },
  ],

  stavyZaznamu: [
    { klic: "reseni", nazev: "V řešení", barva: "warning", otevreny: true },
    { klic: "opraveno", nazev: "Opraveno", barva: "success", otevreny: false },
  ],

  // Typy údržby
  typyUdrzby: [
    { klic: "mo1", nazev: "MO-1 – denní údržba", trvaniDni: 1, barva: "warning" },
    { klic: "mo2", nazev: "MO-2 – týdenní údržba", trvaniDni: 3, barva: "warning" },
    { klic: "rocni-revize", nazev: "Roční revize", trvaniDni: 5, barva: "info" },
  ],

  // Osoby
  osoby: [
    { id: 1, jmeno: "prap. Jana Nováková", kontakt: "725 100 111" },
    { id: 2, jmeno: "nprap. Petr Svoboda", kontakt: "725 100 112" },
    { id: 3, jmeno: "rtm. Martin Dvořák", kontakt: "725 100 113" },
    { id: 4, jmeno: "prap. Lucie Procházková", kontakt: "725 100 114" },
    { id: 5, jmeno: "nprap. Tomáš Horák", kontakt: "725 200 111" },
    { id: 6, jmeno: "rtm. Eva Bartošová", kontakt: "725 200 112" },
    { id: 7, jmeno: "prap. Jakub Novotný", kontakt: "725 200 113" },
    { id: 8, jmeno: "nprap. Kateřina Veselá", kontakt: "725 200 114" },
    { id: 9, jmeno: "rtm. Pavel Kučera", kontakt: "725 300 111" },
    { id: 10, jmeno: "prap. Michaela Malá", kontakt: "725 300 112" },
    { id: 11, jmeno: "nprap. David Beneš", kontakt: "725 300 113" },
    { id: 12, jmeno: "rtm. Hana Sedláková", kontakt: "725 300 114" },
    { id: 13, jmeno: "prap. Jiří Král", kontakt: "725 400 111" },
    { id: 14, jmeno: "nprap. Barbora Marková", kontakt: "725 400 112" },
    { id: 15, jmeno: "rtm. Ondřej Pospíšil", kontakt: "725 400 113" },
    { id: 16, jmeno: "prap. Nikola Fialová", kontakt: "725 400 114" },
  ],

  // Logy
  logy: [],
};

let osobaAutoId = 100;

// Rozsah dní denního přehledu
let DEN_MIN = "2026-08-25";
// Horní hranice = DNES

// Simulovaný aktuální čas
const AKTUALNI_CAS_SIMULACE = new Date("2026-09-03T09:15:00");

function provozniDen(datumCas) {
  const d = new Date(datumCas);
  if (d.getHours() < 8) d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DNES = provozniDen(AKTUALNI_CAS_SIMULACE);

let stanovisteAutoId = 500;
let prostredekAutoId = 900;

// Číselníky
const TAXONOMIE = {
  "typy": { data: () => DB.typyUdalosti, nazevSady: "Typy denních událostí", flag: null },
  "stavy-techniky": { data: () => DB.stavyTechniky, nazevSady: "Stavy techniky", flag: { klic: "provoz", label: "Znamená \"v provozu\"" } },
  "stavy-zaznamu": { data: () => DB.stavyZaznamu, nazevSady: "Stavy poruch a závad", flag: { klic: "otevreny", label: "Otevřený (nedokončený) stav" } },
  "udrzba": { data: () => DB.typyUdrzby, nazevSady: "Typy údržby", cislo: { klic: "trvaniDni", label: "Doba trvání (dní)", min: 1 } },
};
const SADY_TAXONOMII = Object.keys(TAXONOMIE);

