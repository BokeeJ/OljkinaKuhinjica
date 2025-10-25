// src/constants/taxonomy.js

/** Kanonske sekcije po kategoriji — tačno kako backend očekuje */
export const SECTIONS_BY_CATEGORY = {
    slano: ["Rucak", "Dorucak/Vecera", "Predjela", "Pite i peciva", "Posno", "Zimnica"],
    slatko: ["Kolaci", "Torte", "Dezerti", "Pite i peciva", "Zimnica"],
};

/** Kanonske podkategorije — postoje SAMO za: Rucak, Kolaci, Torte */
export const SUBS_BY_SECTION = {
    // SLANO
    Rucak: ["Supe i čorbe", "Meso", "Riba", "Povrce", "Paste i spagete", "Posno"],

    // SLATKO (OBAVEZNO mala slova i bez dijakritike — backend ih tako čuva)
    Kolaci: ["cokoladni", "vocni", "kremasti", "biskvitni", "posni kolaci", "sitni kolaci i keks", "Brzi kolaci"],
    Torte: ["klasicne", "cokoladne", "vocne", "brze torte bez pecenja", "posne torte", "biskviti za torte"],
};

/** Pretty label mapa (za prikaz na UI) — vrednosti su dekorativne */
const PRETTY_LABELS_ENTRIES = [
    // Sekcije
    ["Rucak", "Ručak"],
    ["Dorucak/Vecera", "Doručak/Večera"],
    ["Predjela", "Predjela"],
    ["Pite i peciva", "Pite i peciva"],
    ["Posno", "Posno"],
    ["Zimnica", "Zimnica"],
    ["Kolaci", "Kolači"],
    ["Torte", "Torte"],
    ["Dezerti", "Dezerti"],

    // Ručak subovi
    ["Supe i čorbe", "Supe i čorbe"],
    ["Meso", "Meso"],
    ["Riba", "Riba"],
    ["Povrce", "Povrće"],
    ["Paste i spagete", "Paste i špagete"],
    ["Posno", "Posno"],

    // Kolači subovi
    ["cokoladni", "Čokoladni"],
    ["vocni", "Voćni"],
    ["kremasti", "Kremasti"],
    ["biskvitni", "Biskvitni"],
    ["posni kolaci", "Posni kolači"],
    ["sitni kolaci i keks", "Sitni kolači i keks"],

    // Torte subovi
    ["klasicne", "Klasične"],
    ["cokoladne", "Čokoladne"],
    ["vocne", "Voćne"],
    ["brze torte bez pecenja", "Brze torte bez pečenja"],
    ["posne torte", "Posne torte"],
    ["biskviti za torte", "Biskviti za torte"],
];
const PRETTY_MAP = new Map(PRETTY_LABELS_ENTRIES);

/** UI helper: vrati lep prikaz za sekciju/podkategoriju (ako postoji) */
export const prettyLabel = (s = "") => PRETTY_MAP.get(s) ?? s;

/** Normalizacija dijakritika za FE alias-e (stari linkovi da rade) */
const rmDia = (str = "") =>
    String(str).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** (UI alias) — stari linkovi tipa ?section=pecivo ili ?section=dorucak da rade */
export const normalizeSectionFE = (s = "") => {
    const k = rmDia(s);
    // Dorucak/Vecera
    if (["dorucak", "vecera", "dorucak vecera", "dorucak/vecera"].includes(k)) {
        return "Dorucak/Vecera";
    }
    // Pite i peciva
    if (
        ["pecivo", "peciva", "pite", "pite i pecivo", "pite-peciva", "pite & peciva", "pite i peciva"].includes(k)
    ) {
        return "Pite i peciva";
    }
    return s;
};
