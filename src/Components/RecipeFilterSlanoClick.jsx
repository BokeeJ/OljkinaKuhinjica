import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

/** Sekcije i Ručak → podkategorije */
const SECTIONS = ["Rucak", "Dorucak", "Vecera", "Predjela", "Peciva", "Posno", "Zimnica"];
const RUCAK_SUBS = ["Supe i čorbe", "Meso", "Riba", "Povrce", "Paste i spagete"];

export default function RecipeFilterSlanoClick() {
    const [sp, setSp] = useSearchParams();
    const [openRucak, setOpenRucak] = useState(false);

    const category = (sp.get("category") || "slano").toLowerCase();
    const section = sp.get("section") || "";
    const subcategory = sp.get("subcategory") || "";

    const setParam = (key, val) => {
        const next = new URLSearchParams(sp);
        if (val === "" || val == null) next.delete(key);
        else next.set(key, val);
        next.set("page", "1");
        setSp(next, { replace: true });
    };

    const setOnly = (obj) => {
        const next = new URLSearchParams();
        for (const [k, v] of Object.entries(obj)) {
            if (v != null && v !== "") next.set(k, v);
        }
        next.set("page", "1");
        setSp(next, { replace: true });
    };

    const reset = () => {
        setOnly({ category: "slano" });
        setOpenRucak(false);
    };

    const pickSection = (sec) => {
        // klik na „Rucak“ samo otvara/zaklapa i čisti subcategory
        if (sec === "Rucak") {
            setParam("category", "slano");
            setParam("section", "Rucak");
            setParam("subcategory", "");
            setOpenRucak((v) => !v);
            return;
        }
        // ostale sekcije su „leaf“ (nema subcategory)
        setOnly({ category: "slano", section: sec });
        setOpenRucak(false);
    };

    const pickRucakSub = (sub) => {
        setOnly({ category: "slano", section: "Rucak", subcategory: sub });
    };

    const label = useMemo(() => {
        if (category !== "slano") return "SLANO";
        if (section && subcategory) return `SLANO • ${section} • ${subcategory}`;
        if (section) return `SLANO • ${section}`;
        return "SLANO • sve";
    }, [category, section, subcategory]);

    return (
        <div className="space-y-3">
            {/* Header + Reset */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-300">{label}</span>
                <button
                    type="button"
                    onClick={reset}
                    className="ml-auto px-3 py-1.5 rounded-full text-sm bg-zinc-200 text-black hover:bg-zinc-300 transition"
                >
                    Resetuj
                </button>
            </div>

            {/* Glavne sekcije (klik) */}
            <div className="flex flex-wrap gap-2">
                {SECTIONS.map((sec) => {
                    const active = section === sec && (sec !== "Rucak" || (sec === "Rucak" && !subcategory && openRucak)) ||
                        (sec === "Rucak" && section === "Rucak" && !!subcategory);
                    return (
                        <button
                            key={sec}
                            type="button"
                            onClick={() => pickSection(sec)}
                            className={`px-3 py-1.5 rounded-full text-sm transition ${active ? "bg-pink-500 text-white" : "bg-white text-black"
                                }`}
                        >
                            {sec}
                            {sec === "Rucak" && (
                                <span className="ml-1 opacity-70">{openRucak ? "▲" : "▼"}</span>
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
                        <div className="mt-2 flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-white p-2">
                            {RUCAK_SUBS.map((sub) => (
                                <button
                                    key={sub}
                                    type="button"
                                    onClick={() => pickRucakSub(sub)}
                                    className={`px-3 py-1.5 rounded-full text-sm transition ${subcategory === sub ? "bg-pink-500 text-white" : "bg-zinc-100 text-black"
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
                    <Chip onClear={() => setParam("section", "")}>
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
        <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm bg-pink-500 text-white">
            {children}
            <button
                className="text-white/80 hover:text-white"
                onClick={onClear}
                aria-label="Ukloni filter"
            >
                ×
            </button>
        </span>
    );
}
