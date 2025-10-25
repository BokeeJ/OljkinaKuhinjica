// src/Components/RecipeFilterClick.jsx
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
    SECTIONS_BY_CATEGORY,
    SUBS_BY_SECTION,
} from "../constants/taxonomy";
import { canon } from "../utils/text"; // ⬅️ KANON import

/**
 * Helper: da li data sekcija ima podkategorije
 */
const hasSubs = (section) =>
    Array.isArray(SUBS_BY_SECTION[section]) && SUBS_BY_SECTION[section].length > 0;

/** Badge stil za labelu */
const Badge = ({ children, tone = "zinc" }) => {
    const tones = {
        zinc: "bg-zinc-100 text-zinc-700 border-zinc-200",
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
        pink: "bg-pink-50 text-pink-700 border-pink-200",
    };
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border ${tones[tone] || tones.zinc}`}>
            {children}
        </span>
    );
};

/* ---------- pretty helpers (za label prikaz) ---------- */
const findPrettySection = (raw) => {
    const c = canon(raw);
    for (const cat of Object.keys(SECTIONS_BY_CATEGORY)) {
        for (const sec of SECTIONS_BY_CATEGORY[cat]) {
            if (canon(sec) === c) return sec;
        }
    }
    return raw;
};
const findPrettySub = (sectionRaw, subRaw) => {
    const secPretty = findPrettySection(sectionRaw);
    const list = SUBS_BY_SECTION[secPretty] || [];
    const c = canon(subRaw);
    for (const s of list) {
        if (canon(s) === c) return s;
    }
    return subRaw;
};

export default function RecipeFilterClick() {
    const [sp, setSp] = useSearchParams();

    // Čitamo iz URL-a (mogu biti kanon vrednosti)
    const category = (sp.get("category") || "").toLowerCase(); // "slano" | "slatko" | ""
    const sectionRaw = sp.get("section") || "";
    const subRaw = sp.get("subcategory") || "";

    // Lep prikaz u labelu (mapiranje kanon -> pretty)
    const sectionPretty = sectionRaw ? findPrettySection(sectionRaw) : "";
    const subPretty = subRaw ? findPrettySub(sectionRaw, subRaw) : "";

    const label = useMemo(() => {
        if (!category) return "🧭 Izaberi kategoriju";
        if (category === "slano") {
            if (sectionPretty && subPretty) return `SLANO • ${sectionPretty} • ${subPretty}`;
            if (sectionPretty) return `SLANO • ${sectionPretty}`;
            return "SLANO";
        }
        if (category === "slatko") {
            if (sectionPretty && subPretty) return `SLATKO • ${sectionPretty} • ${subPretty}`;
            if (sectionPretty) return `SLATKO • ${sectionPretty}`;
            if (subPretty) return `SLATKO • ${subPretty}`;
            return "SLATKO";
        }
        return "🧭 Izaberi kategoriju";
    }, [category, sectionPretty, subPretty]);

    const handleReset = () => {
        const next = new URLSearchParams(sp);
        next.delete("category");
        next.delete("section");
        next.delete("subcategory");
        next.set("page", "1");
        setSp(next, { replace: true });
    };

    const setCategory = (cat) => {
        const next = new URLSearchParams(sp);
        next.set("category", (cat || "").toLowerCase());
        next.delete("section");
        next.delete("subcategory");
        next.set("page", "1");
        setSp(next, { replace: true });
    };

    // ⬇️ KANONIZUJ sekciju pre upisa u URL
    const setSection = (secDisplay) => {
        const secCanon = canon(secDisplay);
        const next = new URLSearchParams(sp);

        // detektuj kojoj grani pripada display naziv
        const inSlano = SECTIONS_BY_CATEGORY.slano.some((s) => canon(s) === secCanon);
        const inSlatko = SECTIONS_BY_CATEGORY.slatko.some((s) => canon(s) === secCanon);

        if (inSlano) {
            next.set("category", "slano");
            next.set("section", secCanon);
            if (!hasSubs(findPrettySection(secCanon))) next.delete("subcategory");
        } else if (inSlatko) {
            next.set("category", "slatko");
            next.set("section", secCanon);
            if (!hasSubs(findPrettySection(secCanon))) next.delete("subcategory");
        } else {
            // fallback
            next.set("section", secCanon);
            next.delete("subcategory");
        }
        next.set("page", "1");
        setSp(next, { replace: true });
    };

    // ⬇️ KANONIZUJ i sekciju i sub pre upisa u URL
    const setSub = (secDisplay, subDisplay) => {
        const secCanon = canon(secDisplay);
        const subCanon = canon(subDisplay);
        const next = new URLSearchParams(sp);

        const inSlano = SECTIONS_BY_CATEGORY.slano.some((s) => canon(s) === secCanon);
        const inSlatko = SECTIONS_BY_CATEGORY.slatko.some((s) => canon(s) === secCanon);

        if (inSlano) next.set("category", "slano");
        if (inSlatko) next.set("category", "slatko");

        next.set("section", secCanon);
        next.set("subcategory", subCanon);
        next.set("page", "1");
        setSp(next, { replace: true });
    };

    return (
        <div className="relative flex items-center gap-3 text-zinc-800">
            <button
                type="button"
                onClick={handleReset}
                className="h-10 rounded-full border border-zinc-300 bg-white/80 px-4 text-sm font-medium text-zinc-700 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            >
                ✖ Reset
            </button>

            <FilterDesktop
                label={label}
                setCategory={setCategory}
                setSection={setSection}
                setSub={setSub}
            />

            <FilterMobile
                label={label}
                setCategory={setCategory}
                setSection={setSection}
                setSub={setSub}
            />
        </div>
    );
}

/* ========================= DESKTOP (CLICK ONLY) ========================= */
function FilterDesktop({ label, setCategory, setSection, setSub }) {
    const [open, setOpen] = useState(false);
    const [root, setRoot] = useState(""); // "slano" | "slatko"
    const wrapRef = useRef(null);
    const reduceMotion = useReducedMotion();

    // klik van + ESC
    useEffect(() => {
        const onDocClick = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
                setRoot("");
            }
        };
        const onEsc = (e) => {
            if (e.key === "Escape") {
                setOpen(false);
                setRoot("");
            }
        };
        if (open) {
            document.addEventListener("click", onDocClick);
            document.addEventListener("keydown", onEsc);
        }
        return () => {
            document.removeEventListener("click", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, [open]);

    const onTrigger = () => setOpen((v) => !v);

    const renderRight = () => {
        if (!root) {
            return <div className="px-2 py-4 text-sm text-zinc-500">Izaberi kategoriju…</div>;
        }
        const sections = SECTIONS_BY_CATEGORY[root] || [];
        return (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {sections.map((sec) => {
                    const subs = SUBS_BY_SECTION[sec] || [];
                    return (
                        <div key={sec} className="rounded-xl border bg-white p-2">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setSection(sec)}
                                    className="rounded-md px-2 py-1 text-left text-sm font-semibold hover:bg-emerald-50"
                                >
                                    {sec}
                                </button>
                                <Badge tone={subs.length ? "emerald" : "zinc"}>
                                    {subs.length ? `${subs.length} podkategorija` : "nema podkategorija"}
                                </Badge>
                            </div>
                            {subs.length > 0 && (
                                <div className="mt-2 grid gap-1">
                                    {subs.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => {
                                                setSub(sec, s);
                                                setOpen(false);
                                                setRoot("");
                                            }}
                                            className="rounded px-2 py-1 text-left text-sm hover:bg-emerald-50"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div ref={wrapRef} className="relative hidden md:block">
            <button
                type="button"
                onClick={onTrigger} // ← samo klik, bez hovera
                className="h-10 rounded-full bg-yellow-500 px-4 text-sm font-semibold text-white shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                aria-haspopup="true"
                aria-expanded={open}
            >
                {label}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-1/2 top-14 z-50 -translate-x-1/2"
                    >
                        <div className="w[760px] max-w-[92vw] rounded-2xl border border-zinc-200/70 bg-white/90 p-[1.5px] backdrop-blur shadow-xl">
                            <div className="rounded-2xl bg-white/95 p-3">
                                {/* koren tabovi */}
                                <div className="mb-3 grid grid-cols-2 gap-2">
                                    {["slano", "slatko"].map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => {
                                                setRoot(cat);
                                                setCategory(cat);
                                            }}
                                            className={`rounded-xl px-4 py-2 text-sm font-semibold border shadow-sm ${root === cat
                                                ? "bg-emerald-600 text-white border-emerald-700"
                                                : "bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50"
                                                }`}
                                        >
                                            {cat.toUpperCase()}
                                        </button>
                                    ))}
                                </div>

                                {/* desni panel */}
                                <div className="rounded-xl border bg-white p-3">
                                    {renderRight()}
                                </div>

                                <div className="mt-3 text-[11px] text-zinc-500">
                                    Sekcije sa podkategorijama (npr. <b>Rucak</b>, <b>Kolaci</b>, <b>Torte</b>) imaju zeleni badge.
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ========================= MOBILNI (FULLSCREEN) ========================= */
function FilterMobile({ label, setCategory, setSection, setSub }) {
    const [open, setOpen] = useState(false);
    const [root, setRoot] = useState(""); // "slano" | "slatko"
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = prev);
    }, [open]);

    const closeAll = () => { setOpen(false); setRoot(""); };

    return (
        <div className="md:hidden">
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="h-10 rounded-full bg-yellow-500 px-4 text-sm font-semibold text-white shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
            >
                {label}
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            className="fixed inset-0 z-[60] bg-black/40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeAll}
                        />
                        <motion.div
                            className="fixed inset-x-0 bottom-0 z-[61] rounded-t-3xl bg-white shadow-2xl"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: reduceMotion ? "tween" : "spring", duration: 0.22 }}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Filter recepata"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b px-4 py-3">
                                {root ? (
                                    <button
                                        onClick={() => setRoot("")}
                                        className="rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50"
                                    >
                                        ← Nazad
                                    </button>
                                ) : (
                                    <span className="text-sm text-zinc-600">Filter</span>
                                )}
                                <button
                                    onClick={closeAll}
                                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50"
                                >
                                    Zatvori
                                </button>
                            </div>

                            {/* Sadržaj */}
                            <div className="max-h-[70vh] overflow-y-auto px-4 pb-6 pt-3 text-zinc-800">
                                {!root && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {["slano", "slatko"].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => { setRoot(cat); setCategory(cat); }}
                                                className="rounded-2xl border bg-white p-4 text-left text-base shadow-sm active:scale-[0.99]"
                                            >
                                                <div className="font-semibold">{cat.toUpperCase()}</div>
                                                <div className="mt-1 text-xs text-zinc-500">
                                                    {SECTIONS_BY_CATEGORY[cat].length} sekcija
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {root && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {SECTIONS_BY_CATEGORY[root].map((sec) => {
                                            const subs = SUBS_BY_SECTION[sec] || [];
                                            return (
                                                <div key={sec} className="rounded-2xl border bg-white p-3">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <div className="font-semibold">{sec}</div>
                                                        <Badge tone={subs.length ? "emerald" : "zinc"}>
                                                            {subs.length ? `${subs.length} podkategorija` : "nema podkategorija"}
                                                        </Badge>
                                                    </div>
                                                    {subs.length ? (
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {subs.map((s) => (
                                                                <button
                                                                    key={s}
                                                                    onClick={() => { setSub(sec, s); closeAll(); }}
                                                                    className="w-full rounded-lg border bg-white px-3 py-2 text-left text-base active:scale-[0.99]"
                                                                >
                                                                    {s}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setSection(sec); closeAll(); }}
                                                            className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-left text-base active:scale-[0.99]"
                                                        >
                                                            Prikaži {sec}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

/* (Breadcrumb opcija — trenutno ne koristimo)
function Trail() { return null; }
*/
