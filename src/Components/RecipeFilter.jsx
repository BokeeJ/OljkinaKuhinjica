"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/** Konfiguracija kategorija */
const CATS = {
    slatko: ["Kolači", "Torte"],
    slano: [
        "Doručak",
        "Ručak",
        "Večera",
        "Pica",
        "Brza jela",
        "Salate",
        "Hladna jela",
        "Užina",
        "Supe i čorbe",
        "Pecivo",
    ],
};

export default function RecipeFilter({ onSelect, onReset }) {
    const [selected, setSelected] = useState({ cat: "", sub: "" });
    const label =
        selected.cat && selected.sub
            ? `${cap(selected.cat)} • ${selected.sub}`
            : selected.cat
                ? `${cap(selected.cat)}`
                : "🧭 Izaberi kategoriju";

    const handlePick = (cat, sub) => {
        setSelected({ cat, sub });
        onSelect?.(cat, sub);
    };

    const handleReset = () => {
        setSelected({ cat: "", sub: "" });
        onReset?.();
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

            {/* Desktop i Mobilni triggere dele selected label */}
            <RecipeFilterDesktop label={label} onPick={handlePick} />
            <RecipeFilterMobile label={label} onPick={handlePick} />
        </div>
    );
}

/* ========================= DESKTOP (hover/click mega-meni) ========================= */
function RecipeFilterDesktop({ label, onPick }) {
    const [open, setOpen] = useState(false);
    const [path, setPath] = useState([]); // npr. ["slano"]
    const wrapRef = useRef(null);
    const closeTimer = useRef(null);
    const rootCats = Object.keys(CATS);
    const reduceMotion = useReducedMotion();

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
    };
    const handleLeafClick = (cat, sub) => {
        onPick?.(cat, sub);
        setOpen(false);
        setPath([]);
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
                        initial={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                        transition={{ duration: 0.18 }}
                        onMouseLeave={scheduleClose}
                        onMouseEnter={cancelClose}
                        className="absolute left-1/2 top-14 z-50 -translate-x-1/2"
                    >
                        <div className="w-[720px] max-w-[92vw] rounded-2xl border border-zinc-200/70 bg-white/90 p-[1.5px] backdrop-blur shadow-xl">
                            <div className="rounded-2xl bg-white/95 p-3">
                                <Trail path={path} />

                                <div className="mt-2 grid grid-cols-[220px_1fr] gap-3">
                                    {/* Koren */}
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

                                    {/* Potkategorije */}
                                    <div className="rounded-xl border bg-white p-2">
                                        {path[0] ? (
                                            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                                                {CATS[path[0]].map((sub) => (
                                                    <button
                                                        key={sub}
                                                        onClick={() => handleLeafClick(path[0], sub)}
                                                        className="rounded-lg px-3 py-2 text-left text-sm ring-1 ring-transparent transition hover:bg-emerald-50 hover:ring-emerald-400"
                                                    >
                                                        {sub}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="px-2 py-4 text-sm text-zinc-500">
                                                Pređi mišem preko kategorije…
                                            </div>
                                        )}
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
function RecipeFilterMobile({ label, onPick }) {
    const [open, setOpen] = useState(false);
    const [path, setPath] = useState([]); // ["slano"]
    const rootCats = Object.keys(CATS);
    const reduceMotion = useReducedMotion();

    // Zaključaj body scroll dok je modal otvoren
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = prev);
    }, [open]);

    const closeAll = () => {
        setOpen(false);
        setPath([]);
    };

    const handleRootTap = (cat) => setPath([cat]);
    const handleBack = () => setPath([]);

    const handleLeafTap = (cat, sub) => {
        onPick?.(cat, sub);
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
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 z-[60] bg-black/40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeAll}
                        />
                        {/* Drawer */}
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
                                        {rootCats.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => handleRootTap(cat)}
                                                className="rounded-2xl border bg-white p-4 text-left text-base shadow-sm active:scale-[0.99]"
                                            >
                                                <div className="font-semibold">{cap(cat)}</div>
                                                <div className="mt-1 text-xs text-zinc-500">
                                                    {CATS[cat].length} potkategorija
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {path.length === 1 && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {CATS[path[0]].map((sub) => (
                                            <button
                                                key={sub}
                                                onClick={() => handleLeafTap(path[0], sub)}
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
