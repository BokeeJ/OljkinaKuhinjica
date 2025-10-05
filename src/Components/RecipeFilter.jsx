"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useSearchParams } from "react-router-dom";

/** ===================== KONFIG ===================== 
 * SLANO:
 *  - Dorucak/Vecera
 *  - Predjela
 *  - Rucak
 *      • Supe i čorbe
 *      • Kuvana jela
 *      • Jela iz rerne
 *      • Paste
 *  - Hlebovi i peciva
 *  - Posno
 *  - Zimnica
 * SLATKO: (za sada samo dve stavke – možeš proširiti kasnije)
 */
const SLANO_GROUPS = [
    { section: "Dorucak/Vecera", items: ["Dorucak/Vecera"] },
    { section: "Predjela", items: ["Predjela"] },
    { section: "Rucak", items: ["Supe i čorbe", "Kuvana jela", "Jela iz rerne", "Paste"] },
    { section: "Hlebovi i peciva", items: ["Hlebovi i peciva"] },
    { section: "Posno", items: ["Posno"] },
    { section: "Zimnica", items: ["Zimnica"] },
];

const SLATKO_LIST = ["Kolači", "Torte"]; // proširi po potrebi

// za brzo prepoznavanje da li sub pripada Rucku
const RUCKAK_SUBS = new Set(["Supe i čorbe", "Kuvana jela", "Jela iz rerne", "Paste"]);

/* ================================================== */

export default function RecipeFilter() {
    const [sp, setSp] = useSearchParams();

    // čitamo trenutne vrednosti iz URL-a da label prikazuje stanje
    const category = (sp.get("category") || "").toLowerCase();
    const section = sp.get("section") || "";
    const subcategory = sp.get("subcategory") || "";

    const label =
        category === "slano"
            ? section && subcategory
                ? `SLANO • ${section} • ${subcategory}`
                : section
                    ? `SLANO • ${section}`
                    : "🧭 Izaberi (SLANO)"
            : category === "slatko"
                ? subcategory
                    ? `SLATKO • ${subcategory}`
                    : "🧭 Izaberi (SLATKO)"
                : "🧭 Izaberi kategoriju";

    const handleReset = () => {
        const next = new URLSearchParams(sp);
        next.delete("category");
        next.delete("section");
        next.delete("subcategory");
        next.set("page", "1");
        setSp(next, { replace: true });
    };

    // univerzalni setter-i
    const setCategory = (cat) => {
        const next = new URLSearchParams(sp);
        next.set("category", cat);
        // reset grana
        next.delete("section");
        next.delete("subcategory");
        next.set("page", "1");
        setSp(next, { replace: true });
    };

    const setSection = (sec) => {
        const next = new URLSearchParams(sp);
        next.set("category", "slano");
        next.set("section", sec);
        next.delete("subcategory");
        next.set("page", "1");
        setSp(next, { replace: true });
    };

    // klik na “leaf”:
    // - SLANO: ako je leaf iz Ručka → section=Rucak & subcategory=leaf
    //          ako je leaf samostalan (npr. Predjela) → section=Predjela (i nema subcategory)
    // - SLATKO: category=slatko & subcategory=leaf
    const handlePick = (cat, leaf) => {
        const next = new URLSearchParams(sp);
        if (cat === "slano") {
            next.set("category", "slano");
            if (RUCKAK_SUBS.has(leaf)) {
                next.set("section", "Rucak");
                next.set("subcategory", leaf);
            } else {
                next.set("section", leaf);
                next.delete("subcategory");
            }
        } else if (cat === "slatko") {
            next.set("category", "slatko");
            next.delete("section");
            next.set("subcategory", leaf);
        }
        next.set("page", "1");
        setSp(next, { replace: true });
    };

    return (
        <div className="relative flex items-center gap-3 text-zinc-800">
            {/* Reset */}
            <button
                type="button"
                onClick={handleReset}
                className="h-10 rounded-full border border-zinc-300 bg-white/80 px-4 text-sm font-medium text-zinc-700 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            >
                ✖ Reset
            </button>

            <RecipeFilterDesktop
                label={label}
                onPick={handlePick}
                onSetCategory={setCategory}
                onSetSection={setSection}
            />

            <RecipeFilterMobile
                label={label}
                onPick={handlePick}
                onSetCategory={setCategory}
            />
        </div>
    );
}

/* ========================= DESKTOP (hover/click mega-meni) ========================= */
function RecipeFilterDesktop({ label, onPick, onSetCategory, onSetSection }) {
    const [open, setOpen] = useState(false);
    const [path, setPath] = useState([]); // npr. ["slano"] ili ["slatko"]
    const wrapRef = useRef(null);
    const closeTimer = useRef(null);
    const reduceMotion = useReducedMotion();

    // korenski tabovi
    const rootCats = ["slano", "slatko"];

    // zatvaranje klikom van + ESC
    useEffect(() => {
        const onDocClick = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
                setPath([]);
            }
        };
        const onEsc = (e) => {
            if (e.key === "Escape") {
                setOpen(false);
                setPath([]);
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

    const scheduleClose = () => {
        clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => {
            setOpen(false);
            setPath([]);
        }, 160);
    };
    const cancelClose = () => clearTimeout(closeTimer.current);

    const handleRootEnter = (cat) => setPath([cat]);
    const handleRootClick = (cat) => {
        if (!open) setOpen(true);
        setPath([cat]);
        onSetCategory(cat); // odmah postavi category u URL-u
    };

    const handleLeafClick = (cat, leaf) => {
        // SLANO: ako klikneš "Rucak" kao sekciju, prvo samo setSection,
        // a potom će se prikazati njegovi leaf-ovi (Supe, Kuvana, ...).
        if (cat === "slano" && leaf === "Rucak") {
            onSetSection("Rucak");
            setPath(["slano"]); // ostani na slano panelu
            return;
        }
        onPick?.(cat, leaf);
        setOpen(false);
        setPath([]);
    };

    // sadržaj za desni panel u zavisnosti od odabrane grane
    const renderRightPanel = () => {
        if (!path[0]) {
            return <div className="px-2 py-4 text-sm text-zinc-500">Pređi mišem preko kategorije…</div>;
        }

        if (path[0] === "slano") {
            return (
                <div className="space-y-3">
                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                        {SLANO_GROUPS.map((g) => (
                            <div key={g.section} className="rounded-lg border bg-white p-2">
                                <button
                                    onClick={() =>
                                        g.items.length > 1
                                            ? handleLeafClick("slano", "Rucak") // otvori Rucak (setSection)
                                            : handleLeafClick("slano", g.section)
                                    }
                                    className="w-full rounded-md px-2 py-1 text-left text-sm font-semibold hover:bg-emerald-50"
                                >
                                    {g.section}
                                </button>
                                {g.items.length > 1 && (
                                    <div className="mt-1 grid gap-1">
                                        {g.items.map((sub) => (
                                            <button
                                                key={sub}
                                                onClick={() => handleLeafClick("slano", sub)}
                                                className="rounded px-2 py-1 text-left text-sm hover:bg-emerald-50"
                                            >
                                                {sub}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (path[0] === "slatko") {
            return (
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {SLATKO_LIST.map((sub) => (
                        <button
                            key={sub}
                            onClick={() => handleLeafClick("slatko", sub)}
                            className="rounded-lg px-3 py-2 text-left text-sm ring-1 ring-transparent transition hover:bg-emerald-50 hover:ring-emerald-400"
                        >
                            {sub}
                        </button>
                    ))}
                </div>
            );
        }

        return null;
    };

    return (
        <div ref={wrapRef} className="relative hidden md:block">
            <button
                type="button"
                onMouseEnter={() => setOpen(true)}
                onClick={() => setOpen((v) => !v)}
                className="h-10 rounded-full bg-yellow-500 px-4 text-sm font-semibold text-white shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                aria-haspopup="true"
                aria-expanded={open}
            >
                {label}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: useReducedMotion ? 0 : -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: useReducedMotion ? 0 : -8 }}
                        transition={{ duration: 0.18 }}
                        onMouseLeave={scheduleClose}
                        onMouseEnter={cancelClose}
                        className="absolute left-1/2 top-14 z-50 -translate-x-1/2"
                    >
                        <div className="w-[720px] max-w-[92vw] rounded-2xl border border-zinc-200/70 bg-white/90 p-[1.5px] backdrop-blur shadow-xl">
                            <div className="rounded-2xl bg-white/95 p-3">
                                <Trail path={path} />

                                <div className="mt-2 grid grid-cols-[220px_1fr] gap-3">
                                    {/* Koren (SLANO / SLATKO) */}
                                    <div className="overflow-hidden rounded-xl border bg-white">
                                        {rootCats.map((cat) => {
                                            const active = path[0] === cat;
                                            return (
                                                <button
                                                    key={cat}
                                                    onMouseEnter={() => handleRootEnter(cat)}
                                                    onClick={() => handleRootClick(cat)}
                                                    className={[
                                                        "relative w-full px-4 py-2 text-left text-sm transition",
                                                        active ? "bg-emerald-50 font-semibold" : "hover:bg-zinc-50",
                                                    ].join(" ")}
                                                >
                                                    {active && (
                                                        <span className="absolute inset-y-0 left-0 w-1 rounded-r bg-emerald-400" />
                                                    )}
                                                    {cap(cat)}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Desni panel (sekcije / potkategorije) */}
                                    <div className="rounded-xl border bg-white p-2">
                                        {renderRightPanel()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ========================= MOBILNI (fullscreen drawer) ========================= */
function RecipeFilterMobile({ label, onPick, onSetCategory }) {
    const [open, setOpen] = useState(false);
    const [path, setPath] = useState([]); // ["slano"] ili ["slatko"]
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = prev);
    }, [open]);

    const closeAll = () => { setOpen(false); setPath([]); };

    const handleRootTap = (cat) => {
        setPath([cat]);
        onSetCategory(cat); // odmah postavi category u URL
    };
    const handleBack = () => setPath([]);

    const handleLeafTap = (cat, leaf) => {
        onPick?.(cat, leaf);
        closeAll();
    };

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
                                {path.length > 0 ? (
                                    <button
                                        onClick={handleBack}
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

                            {/* Putanja */}
                            <div className="px-4 pt-3">
                                <Trail path={path} />
                            </div>

                            {/* Sadržaj */}
                            <div className="max-h-[70vh] overflow-y-auto px-4 pb-6 pt-2 text-zinc-800">
                                {path.length === 0 && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {["slano", "slatko"].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => handleRootTap(cat)}
                                                className="rounded-2xl border bg-white p-4 text-left text-base shadow-sm active:scale-[0.99]"
                                            >
                                                <div className="font-semibold">{cap(cat)}</div>
                                                <div className="mt-1 text-xs text-zinc-500">
                                                    {cat === "slano"
                                                        ? SLANO_GROUPS.reduce((acc, g) => acc + g.items.length, 0)
                                                        : SLATKO_LIST.length}{" "}
                                                    potkategorija
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {path.length === 1 && path[0] === "slano" && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {SLANO_GROUPS.map((g) => (
                                            <div key={g.section} className="rounded-2xl border bg-white p-3">
                                                <div className="mb-2 font-semibold">{g.section}</div>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {g.items.map((sub) => (
                                                        <button
                                                            key={sub}
                                                            onClick={() =>
                                                                RUCKAK_SUBS.has(sub)
                                                                    ? handleLeafTap("slano", sub)
                                                                    : handleLeafTap("slano", g.section)
                                                            }
                                                            className="w-full rounded-lg border bg-white px-3 py-2 text-left text-base active:scale-[0.99]"
                                                        >
                                                            {sub}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {path.length === 1 && path[0] === "slatko" && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {SLATKO_LIST.map((sub) => (
                                            <button
                                                key={sub}
                                                onClick={() => handleLeafTap("slatko", sub)}
                                                className="w-full rounded-2xl border bg-white p-4 text-left text-base active:scale-[0.99]"
                                            >
                                                {sub}
                                            </button>
                                        ))}
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

/* ========================= Pomoćne ========================= */
function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function Trail({ path }) {
    if (!path?.length) return null;
    return (
        <div className="flex items-center gap-2 text-[12px] text-zinc-600">
            {path.map((seg, i) => (
                <span key={i} className="inline-flex items-center gap-2">
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700 ring-1 ring-emerald-200 shadow-sm">
                        {cap(seg)}
                    </span>
                    {i < path.length - 1 && <span>›</span>}
                </span>
            ))}
            <div className="ml-2 h-0.5 w-full rounded bg-gradient-to-r from-emerald-200 to-transparent" />
        </div>
    );
}
