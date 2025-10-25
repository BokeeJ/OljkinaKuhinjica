// src/Components/RecipeFilterSlanoClick.jsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, X } from "lucide-react";

// ⬇️ centralna taksonomija (isti izvor kao Add/Izmeni/SviRecepti)
import { SECTIONS_BY_CATEGORY, SUBS_BY_SECTION } from "../constants/taxonomy";

// helper: trim string
const t = (v) => (typeof v === "string" ? v.trim() : v);

export default function RecipeFilterSlanoClick() {
    const [sp, setSp] = useSearchParams();
    const [openRucak, setOpenRucak] = useState(false);

    // uvek forsiramo slano u ovoj komponenti
    const category = "slano";
    const section = sp.get("section") || "";
    const subcategory = sp.get("subcategory") || "";

    // sekcije i ručak podsekcije iz taksonomije
    const SLANO_SECTIONS = SECTIONS_BY_CATEGORY.slano || [];
    const RUCAK_SUBS = SUBS_BY_SECTION.Rucak || [];

    // ako URL dođe spolja na ručak → drži collapse otvoren
    useEffect(() => {
        setOpenRucak(section === "Rucak");
    }, [section]);

    // set param (pojedinačno)
    const setParam = (key, val) => {
        const next = new URLSearchParams(sp);
        const vv = t(val);
        if (vv === "" || vv == null) next.delete(key);
        else next.set(key, vv);
        next.set("page", "1");
        setSp(next, { replace: true });
    };

    // setOnly: rekonstruiše ceo query (i uvek `category=slano`)
    const setOnly = (obj) => {
        const next = new URLSearchParams();
        next.set("category", "slano");
        for (const [k, v] of Object.entries(obj)) {
            const vv = t(v);
            if (vv != null && vv !== "") next.set(k, vv);
        }
        next.set("page", "1");
        setSp(next, { replace: true });
    };

    const reset = () => {
        setOnly({});              // ostaje samo category=slano
        setOpenRucak(false);
    };

    const pickSection = (secRaw) => {
        const sec = t(secRaw);
        if (sec === "Rucak") {
            // toggle i očisti subcategory
            setParam("category", "slano");
            setParam("section", "Rucak");
            setParam("subcategory", "");
            setOpenRucak((v) => !v);
            return;
        }
        // sekcije bez podkategorija
        setOpenRucak(false);
        setOnly({ section: sec }); // subcategory se neće slati (čime se i briše)
    };

    const pickRucakSub = (subRaw) => {
        const sub = t(subRaw);
        setOnly({ section: "Rucak", subcategory: sub });
    };

    const label = useMemo(() => {
        if (section && subcategory) return `SLANO • ${section} • ${subcategory}`;
        if (section) return `SLANO • ${section}`;
        return "SLANO • sve";
    }, [section, subcategory]);

    // 💡 specifičan clear za section: briše i subcategory (da ne ostane “viseći”)
    const clearSection = () => {
        const next = new URLSearchParams(sp);
        next.delete("section");
        next.delete("subcategory");      // ← bitno
        next.set("category", "slano");   // ova komponenta uvek radi u slano
        next.set("page", "1");
        setSp(next, { replace: true });
        setOpenRucak(false);
    };

    return (
        <div className="space-y-3">
            {/* Header + Reset */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-700">{label}</span>
                <button
                    type="button"
                    onClick={reset}
                    className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                >
                    <X size={14} /> Reset
                </button>
            </div>

            {/* Glavne sekcije (klik) */}
            <div className="flex flex-wrap gap-2">
                {SLANO_SECTIONS.map((sec) => {
                    const isRucak = sec === "Rucak";
                    const active =
                        (section === sec && (!isRucak || (isRucak && !subcategory && openRucak))) ||
                        (isRucak && section === "Rucak" && !!subcategory);

                    return (
                        <button
                            key={sec}
                            type="button"
                            onClick={() => pickSection(sec)}
                            className={`px-3 py-1.5 rounded-full text-sm transition inline-flex items-center gap-1.5 ${active
                                    ? "bg-emerald-600 text-white"
                                    : "bg-white/90 border border-zinc-300 text-zinc-800 hover:bg-white"
                                }`}
                        >
                            {sec}
                            {isRucak && (
                                <span className="ml-1 opacity-80">
                                    {openRucak ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Ručak → podkategorije (collapse na klik) */}
            <AnimatePresence initial={false}>
                {section === "Rucak" && openRucak && (
                    <motion.div
                        key="rucak-subs"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-2 flex flex-wrap gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-2">
                            {RUCAK_SUBS.map((sub) => (
                                <button
                                    key={sub}
                                    type="button"
                                    onClick={() => pickRucakSub(sub)}
                                    className={`px-3 py-1.5 rounded-full text-sm transition ${subcategory === sub
                                            ? "bg-pink-500 text-white"
                                            : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
                                        }`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Aktivni čipovi */}
            <div className="flex flex-wrap gap-2">
                {section && (
                    <Chip onClear={clearSection /* ← umesto setParam("section","") */}>
                        section: {section}
                    </Chip>
                )}
                {subcategory && (
                    <Chip onClear={() => setParam("subcategory", "")}>
                        subcategory: {subcategory}
                    </Chip>
                )}
            </div>
        </div>
    );
}

function Chip({ children, onClear }) {
    return (
        <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm">
            {children}
            <button
                className="text-white/90 hover:text-white"
                onClick={onClear}
                aria-label="Ukloni filter"
            >
                ×
            </button>
        </span>
    );
}
