// src/utils/text.js
export const stripDia = (s = "") =>
    s.normalize("NFD").replace(/\p{Diacritic}/gu, "");

export const canon = (s = "") =>
    stripDia(String(s).trim().replace(/-/g, " ").replace(/\s+/g, " ")).toLowerCase();
