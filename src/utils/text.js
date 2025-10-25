// src/utils/text.js

/** Ukloni dijakritike (č, ć, ž, š, đ → c, c, z, s, dj) */
export const stripDia = (s = "") =>
    String(s).normalize("NFD").replace(/\p{Diacritic}/gu, "");

/** Kanonska forma (za URL/bazu) */
export const canon = (s = "") =>
    stripDia(String(s).trim().replace(/-/g, " ").replace(/\s+/g, " ")).toLowerCase();

/** Prvo slovo veliko (za prikaz jedne reči/izraza) */
export const capFirst = (s = "") => {
    const t = String(s).trim();
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
};

/** Title Case (svaka reč počinje velikim slovom; radi i sa dijakriticima) */
export const toTitle = (s = "") =>
    String(s)
        .trim()
        .toLowerCase()
        // svaku reč (slova + kombinacione marke) pretvori u CapFirst
        .replace(/\p{L}[\p{L}\p{M}]*/gu, (w) => w.charAt(0).toUpperCase() + w.slice(1));

/** Lep prikaz podkategorije u UI (Kolaci/Torte → Title Case; ostalo kako je uneto) */
export const displaySub = (section = "", sub = "") => {
    const sec = canon(section);
    const t = String(sub).trim();
    if (!t) return "";
    if (sec === "kolaci" || sec === "torte") return toTitle(t);
    return t;
};
