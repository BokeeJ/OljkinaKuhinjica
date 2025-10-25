// src/constants/taxonomy.js
export const SECTIONS_BY_CATEGORY = {
    slano: ["Rucak", "Dorucak/Vecera", "Predjela", "Pite i peciva", "Posno", "Zimnica"],
    slatko: ["Kolaci", "Torte", "Dezerti", "Pite i peciva", "Zimnica"],
};

// Prave podkategorije postoje SAMO za: Rucak, Kolaci, Torte
export const SUBS_BY_SECTION = {
    Rucak: ["Supe i čorbe", "Meso", "Riba", "Povrce", "Paste i spagete", "Posno"],
    Kolaci: ["Čokoladni", "Voćni", "Kremasti", "Biskvitni", "Posni kolaci", "Sitni kolaci i keks"],
    Torte: ["Klasicne", "Čokoladne", "Voćne", "Brze torte bez pečenja", "Posne torte", "Biskviti za torte"],
};

// (UI alias) — stari linkovi tipa ?section=pecivo ili ?section=dorucak da rade
export const normalizeSectionFE = (s = "") => {
    const k = s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    if ([
        "dorucak", "vecera", "dorucak vecera", "dorucak/vecera"
    ].includes(k)) return "Dorucak/Vecera";
    if ([
        "pecivo", "peciva", "pite", "pite i pecivo", "pite-peciva", "pite & peciva", "pite i peciva"
    ].includes(k)) return "Pite i peciva";
    return s;
};
