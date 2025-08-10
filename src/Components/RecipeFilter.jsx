import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    return (
        <div className="relative flex items-center gap-3">
            {/* Reset button – isti za sve */}
            <button
                type="button"
                onClick={onReset}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-full px-4 py-2 text-sm h-10"
            >
                ✖ Reset
            </button>

            {/* TRIGGERI */}
            {/* Desktop trigger (>= md) */}
            <RecipeFilterDesktop onSelect={onSelect} />
            {/* Mobile trigger (< md) */}
            <RecipeFilterMobile onSelect={onSelect} />
        </div>
    );
}

/* ========================= DESKTOP (hover mega-meni) ========================= */
function RecipeFilterDesktop({ onSelect }) {
    const [open, setOpen] = useState(false);
    const [path, setPath] = useState([]); // npr. ["slano"]
    const wrapRef = useRef(null);
    const closeTimer = useRef(null);
    const rootCats = Object.keys(CATS);

    // zatvaranje klikom van
    useEffect(() => {
        const onDocClick = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
                setPath([]);
            }
        };
        if (open) document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, [open]);

    const scheduleClose = () => {
        clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => {
            setOpen(false);
            setPath([]);
        }, 180);
    };
    const cancelClose = () => clearTimeout(closeTimer.current);

    const handleRootEnter = (cat) => setPath([cat]);
    const handleRootClick = (cat) => {
        if (!open) setOpen(true);
        setPath([cat]);
    };
    const handleLeafClick = (cat, sub) => {
        onSelect?.(cat, sub);
        setOpen(false);
        setPath([]);
    };

    return (
        <div ref={wrapRef} className="hidden md:block relative">
            <button
                type="button"
                onMouseEnter={() => setOpen(true)}
                onClick={() => setOpen((v) => !v)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-4 py-2 text-sm h-10"
            >
                🧭 Izaberi kategoriju
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        onMouseLeave={scheduleClose}
                        onMouseEnter={cancelClose}
                        className="absolute top-14 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className="bg-white/90 backdrop-blur border shadow-xl rounded-2xl p-3 w-[680px] max-w-[90vw]">
                            <Trail path={path} />
                            <div className="mt-2 grid grid-cols-[200px_1fr] gap-3">
                                {/* Levo: root */}
                                <div className="rounded-xl border bg-white overflow-hidden">
                                    {rootCats.map((cat) => {
                                        const active = path[0] === cat;
                                        return (
                                            <button
                                                key={cat}
                                                onMouseEnter={() => handleRootEnter(cat)}
                                                onClick={() => handleRootClick(cat)}
                                                className={`w-full text-left px-4 py-2 text-sm transition relative ${active ? "bg-emerald-50 font-semibold" : "hover:bg-gray-50"
                                                    }`}
                                            >
                                                {active && (
                                                    <span className="absolute inset-y-0 left-0 w-1 bg-emerald-400 rounded-r" />
                                                )}
                                                {cap(cat)}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Desno: subnivo */}
                                <div className="rounded-xl border bg-white p-2">
                                    {path[0] ? (
                                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                                            {CATS[path[0]].map((sub) => (
                                                <button
                                                    key={sub}
                                                    onClick={() => handleLeafClick(path[0], sub)}
                                                    className="text-left px-3 py-2 rounded-lg text-sm hover:bg-emerald-50 hover:ring-1 ring-emerald-400 transition"
                                                >
                                                    {sub}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500 px-2 py-4">
                                            Pređi mišem preko kategorije…
                                        </div>
                                    )}
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
function RecipeFilterMobile({ onSelect }) {
    const [open, setOpen] = useState(false);
    const [path, setPath] = useState([]); // ["slano"]
    const rootCats = Object.keys(CATS);

    // Zaključaj body scroll dok je modal otvoren
    useEffect(() => {
        if (open) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [open]);

    const closeAll = () => {
        setOpen(false);
        setPath([]);
    };

    const handleRootTap = (cat) => setPath([cat]);
    const handleBack = () => setPath([]);

    const handleLeafTap = (cat, sub) => {
        onSelect?.(cat, sub);
        closeAll();
    };

    return (
        <div className="md:hidden">
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-4 py-2 text-sm h-10"
            >
                🧭 Izaberi kategoriju
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 bg-black/40 z-[60]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeAll}
                        />
                        {/* Drawer */}
                        <motion.div
                            className="fixed inset-x-0 bottom-0 z-[61] rounded-t-3xl bg-white"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "tween", duration: 0.22 }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b">
                                {path.length > 0 ? (
                                    <button
                                        onClick={handleBack}
                                        className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                                    >
                                        ← Nazad
                                    </button>
                                ) : (
                                    <span className="text-sm text-gray-600">Filter</span>
                                )}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={closeAll}
                                        className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                                    >
                                        Zatvori
                                    </button>
                                </div>
                            </div>

                            {/* Putanja */}
                            <div className="px-4 pt-3">
                                <Trail path={path} />
                            </div>

                            {/* Sadržaj */}
                            <div className="max-h-[70vh] overflow-y-auto px-4 pb-6 pt-2">
                                {path.length === 0 && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {rootCats.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => handleRootTap(cat)}
                                                className="p-4 rounded-2xl border text-base text-left active:scale-[0.98] transition shadow-sm bg-white"
                                            >
                                                <div className="font-semibold">{cap(cat)}</div>
                                                <div className="text-xs text-gray-500 mt-1">
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
                                                className="w-full p-4 rounded-2xl border text-base text-left active:scale-[0.98] transition bg-white"
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
        <div className="flex items-center gap-2 text-[12px] text-gray-600">
            {path.map((seg, i) => (
                <span key={i} className="inline-flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700 shadow-sm">
                        {cap(seg)}
                    </span>
                    {i < path.length - 1 && <span>›</span>}
                </span>
            ))}
            <div className="w-full h-0.5 bg-gradient-to-r from-emerald-200 to-transparent rounded ml-2"></div>
        </div>
    );
}
