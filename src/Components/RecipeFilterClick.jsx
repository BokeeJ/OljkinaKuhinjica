// src/Components/RecipeFilterClick.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, X } from "lucide-react";

/* -------------------- KONFIG -------------------- */
/** SLANO */
const SLANO_SECTIONS = ["Rucak", "Dorucak", "Vecera", "Predjela", "Peciva", "Posno", "Zimnica"];
const RUCAK_SUBS = ["Supe i čorbe", "Meso", "Riba", "Povrce", "Paste i spagete"];

/** SLATKO */
const SLATKO_SECTIONS = ["Kolaci", "Torte", "Dezerti", "Peciva", "Zimnica"];
const KOLACI_SUBS = [
    "Svi kolaci", "cokoladni", "vocni", "kremasti", "biskvitni", "posni kolaci", "sitni kolaci i keks"
];
const TORTE_SUBS = [
    "Sve torte", "klasicne", "cokoladne", "vocne", "brze torte bez pecenja", "posne torte", "biskviti za torte"
];

/* -------------------- UI Helpers -------------------- */
function Tab({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-4 py-1.5 rounded-full text-sm transition shadow-sm ${active ? "bg-emerald-600 text-white" : "bg-white/80 border border-zinc-300 text-zinc-800 hover:bg-white"
                }`}
        >
            {children}
        </button>
    );
}

function Pill({ active, onClick, children, caret = null, subtle = false }) {
    const base = subtle
        ? (active ? "bg-pink-500 text-white" : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200")
        : (active ? "bg-emerald-600 text-white" : "bg-white/90 border border-zinc-300 text-zinc-800 hover:bg-white");
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-sm transition ${base} inline-flex items-center gap-1.5`}
        >
            <span>{children}</span>
            {caret}
        </button>
    );
}

function Chip({ children, onClear }) {
    return (
        <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm">
            {children}
            <button className="text-white/90 hover:text-white" onClick={onClear} aria-label="Ukloni filter"><X size={14} /></button>
        </span>
    );
}

/* -------------------- FILTER -------------------- */
export default function RecipeFilterClick() {
    const [sp, setSp] = useSearchParams();

    // URL state
    const category = (sp.get("category") || "").toLowerCase(); // "", "slano", "slatko"
    const section = sp.get("section") || "";
    const subcategory = sp.get("subcategory") || "";

    // Aktivni tab ("" = sve); automatski prati URL
    const [activeTab, setActiveTab] = useState(category || "");
    useEffect(() => setActiveTab(category || ""), [category]);

    // Collapse state (lokalno – da radi odmah na klik, nezavisno od URL re-rendera)
    const [openRucak, setOpenRucak] = useState(false);
    const [openKolaci, setOpenKolaci] = useState(false);
    const [openTorte, setOpenTorte] = useState(false);

    // Kad URL kaže da smo u grani, drži collapse otvoren
    useEffect(() => {
        setOpenRucak(category === "slano" && section === "Rucak");
        setOpenKolaci(category === "slatko" && section === "Kolaci");
        setOpenTorte(category === "slatko" && section === "Torte");
    }, [category, section]);

    const setOnly = (obj) => {
        const next = new URLSearchParams();
        for (const [k, v] of Object.entries(obj)) {
            if (v != null && v !== "") next.set(k, v);
        }
        next.set("page", "1");
        setSp(next, { replace: true });
    };

    const setParam = (k, v) => {
        const next = new URLSearchParams(sp);
        if (v == null || v === "") next.delete(k);
        else next.set(k, v);
        next.set("page", "1");
        setSp(next, { replace: true });
    };

    const resetAll = () => {
        setOnly({});
        setActiveTab("");
        setOpenRucak(false);
        setOpenKolaci(false);
        setOpenTorte(false);
    };

    /* Tabs */
    const pickTab = (tab) => {
        setActiveTab(tab);
        if (!tab) return resetAll();
        setOnly({ category: tab });
    };

    /* SLANO */
    const clickSlanoSection = (sec) => {
        // ako si slučajno na "slatko", prebaci na "slano"
        if (activeTab !== "slano") setActiveTab("slano");
        if (sec === "Rucak") {
            setParam("category", "slano");
            setParam("section", "Rucak");
            setParam("subcategory", "");
            setOpenRucak((v) => !v);
            return;
        }
        setOnly({ category: "slano", section: sec });
        setOpenRucak(false);
    };
    const clickRucakSub = (sub) => {
        setOnly({ category: "slano", section: "Rucak", subcategory: sub });
    };

    /* SLATKO */
    const clickSlatkoSection = (sec) => {
        if (activeTab !== "slatko") setActiveTab("slatko");
        if (sec === "Kolaci") {
            setParam("category", "slatko");
            setParam("section", "Kolaci");
            setParam("subcategory", "");
            setOpenKolaci((v) => !v);
            setOpenTorte(false);
            return;
        }
        if (sec === "Torte") {
            setParam("category", "slatko");
            setParam("section", "Torte");
            setParam("subcategory", "");
            setOpenTorte((v) => !v);
            setOpenKolaci(false);
            return;
        }
        setOnly({ category: "slatko", section: sec });
        setOpenKolaci(false);
        setOpenTorte(false);
    };
    const clickKolaciSub = (sub) => {
        if (sub === "Svi kolaci") setOnly({ category: "slatko", section: "Kolaci" });
        else setOnly({ category: "slatko", section: "Kolaci", subcategory: sub });
    };
    const clickTorteSub = (sub) => {
        if (sub === "Sve torte") setOnly({ category: "slatko", section: "Torte" });
        else setOnly({ category: "slatko", section: "Torte", subcategory: sub });
    };

    const label = useMemo(() => {
        if (!category && !section) return "Filtriraj recepte";
        const head = category ? category.toUpperCase() : "SVE";
        if (section && subcategory) return `${head} • ${section} • ${subcategory}`;
        if (section) return `${head} • ${section}`;
        return head;
    }, [category, section, subcategory]);

    return (
        <div className="space-y-3">
            {/* Gornja traka: label + reset */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-700">{label}</span>
                <button
                    type="button"
                    onClick={resetAll}
                    className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                >
                    <X size={14} /> Reset filtera
                </button>
            </div>

            {/* Tabovi */}
            <div className="flex flex-wrap gap-2">
                <Tab active={activeTab === ""} onClick={() => pickTab("")}>Sve</Tab>
                <Tab active={activeTab === "slano"} onClick={() => pickTab("slano")}>Slano</Tab>
                <Tab active={activeTab === "slatko"} onClick={() => pickTab("slatko")}>Slatko</Tab>
            </div>

            {/* Sadržaj: SLANO */}
            {activeTab === "slano" && (
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                        {SLANO_SECTIONS.map((sec) => {
                            const active = section === sec && (category === "slano" || activeTab === "slano");
                            const caret =
                                sec === "Rucak"
                                    ? (openRucak ? <ChevronUp size={14} /> : <ChevronDown size={14} />)
                                    : null;
                            return (
                                <Pill key={sec} active={active} onClick={() => clickSlanoSection(sec)} caret={caret}>
                                    {sec}
                                </Pill>
                            );
                        })}
                    </div>

                    <AnimatePresence initial={false}>
                        {openRucak && (
                            <motion.div
                                key="rucak"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-1 flex flex-wrap gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-2">
                                    {RUCAK_SUBS.map((sub) => (
                                        <Pill
                                            key={sub}
                                            active={subcategory === sub && (category === "slano" || activeTab === "slano")}
                                            onClick={() => clickRucakSub(sub)}
                                            subtle
                                        >
                                            {sub}
                                        </Pill>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Sadržaj: SLATKO */}
            {activeTab === "slatko" && (
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                        {SLATKO_SECTIONS.map((sec) => {
                            const active = section === sec && (category === "slatko" || activeTab === "slatko");
                            const caret =
                                sec === "Kolaci" ? (openKolaci ? <ChevronUp size={14} /> : <ChevronDown size={14} />)
                                    : sec === "Torte" ? (openTorte ? <ChevronUp size={14} /> : <ChevronDown size={14} />)
                                        : null;
                            return (
                                <Pill key={sec} active={active} onClick={() => clickSlatkoSection(sec)} caret={caret}>
                                    {sec}
                                </Pill>
                            );
                        })}
                    </div>

                    {/* Kolaci collapse */}
                    <AnimatePresence initial={false}>
                        {openKolaci && (
                            <motion.div
                                key="kolaci"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-1 flex flex-wrap gap-2 rounded-2xl border border-pink-200 bg-pink-50/70 p-2">
                                    {KOLACI_SUBS.map((sub) => (
                                        <Pill
                                            key={sub}
                                            active={subcategory === sub && (category === "slatko" || activeTab === "slatko")}
                                            onClick={() => clickKolaciSub(sub)}
                                            subtle
                                        >
                                            {sub}
                                        </Pill>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Torte collapse */}
                    <AnimatePresence initial={false}>
                        {openTorte && (
                            <motion.div
                                key="torte"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-1 flex flex-wrap gap-2 rounded-2xl border border-pink-200 bg-pink-50/70 p-2">
                                    {TORTE_SUBS.map((sub) => (
                                        <Pill
                                            key={sub}
                                            active={subcategory === sub && (category === "slatko" || activeTab === "slatko")}
                                            onClick={() => clickTorteSub(sub)}
                                            subtle
                                        >
                                            {sub}
                                        </Pill>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Aktivni čipovi */}
            <div className="flex flex-wrap gap-2">
                {category && <Chip onClear={() => setParam("category", "")}>category: {category}</Chip>}
                {section && <Chip onClear={() => setParam("section", "")}>section: {section}</Chip>}
                {subcategory && <Chip onClear={() => setParam("subcategory", "")}>subcategory: {subcategory}</Chip>}
            </div>
        </div>
    );
}
