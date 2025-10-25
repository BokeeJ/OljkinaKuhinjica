import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import axios from "../api";
import { motion } from "framer-motion";
import { Star, Flame, Search } from "lucide-react";
import RecipeFilterClick from "../Components/RecipeFilterClick";
import { normalizeSectionFE } from "../constants/taxonomy";

/* Helpers */
const getLSArray = (key) => {
    try {
        const raw = localStorage.getItem(key);
        const v = raw ? JSON.parse(raw) : [];
        return Array.isArray(v) ? v : [];
    } catch {
        return [];
    }
};
const cdn = (url, w = 0) => {
    if (!url) return url;
    const i = url.indexOf("/upload/");
    if (i === -1) return url;
    const trans = `f_auto,q_auto${w ? `,w_${w}` : ""}`;
    return url.slice(0, i + 8) + trans + "/" + url.slice(i + 8);
};
function makePageList(total, current, max = 9) {
    if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1];
    const windowSize = max - 2;
    let left = Math.max(2, current - Math.floor(windowSize / 2));
    let right = Math.min(total - 1, left + windowSize - 1);
    if (right - left + 1 < windowSize) left = Math.max(2, right - windowSize + 1);
    if (left > 2) pages.push("…");
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < total - 1) pages.push("…");
    pages.push(total);
    return pages;
}

export default function SviRecepti() {
    const userId = "user123";
    const location = useLocation();
    const [sp, setSp] = useSearchParams();

    /* URL state */
    const perPage = 12;
    const page = Math.max(1, Number(sp.get("page") || 1));
    const q = sp.get("q") || "";
    const category = (sp.get("category") || "").toLowerCase();
    // Normalizuj section iz URL-a (pecivo → Pite i peciva, dorucak → Dorucak/Vecera…)
    const section = normalizeSectionFE(sp.get("section") || "");
    const subcategory = sp.get("subcategory") || "";

    /* Search (debounce) */
    const [searchInput, setSearchInput] = useState(q);
    useEffect(() => setSearchInput(q), [q]);
    useEffect(() => {
        const t = setTimeout(() => {
            const curr = (sp.get("q") || "").trim();
            const next = (searchInput || "").trim();
            if (curr === next) return;
            const nextSP = new URLSearchParams(sp);
            next ? nextSP.set("q", next) : nextSP.delete("q");
            nextSP.set("page", "1");
            setSp(nextSP, { replace: false });
        }, 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    /* Data */
    const [items, setItems] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    /* Likes / Favorites */
    const [favorites, setFavorites] = useState(() => getLSArray(`favorites_${userId}`));
    const [likedRecipes, setLikedRecipes] = useState(() => getLSArray("liked_recipes"));
    const favSet = useMemo(() => new Set(favorites), [favorites]);
    const likedSet = useMemo(() => new Set(likedRecipes), [likedRecipes]);

    /* Fetch */
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setErr("");

        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(perPage));
        if (q.trim()) params.set("q", q.trim());
        if (category) params.set("category", category);         // slano|slatko
        if (section) params.set("section", section);            // kanonski string (npr. "Pite i peciva")
        if (subcategory) params.set("subcategory", subcategory);

        (async () => {
            try {
                const { data } = await axios.get(`/api/recipes/page?${params.toString()}`);
                if (!cancelled) {
                    setItems(Array.isArray(data.items) ? data.items : []);
                    setTotalPages(Number(data.totalPages) || 0);
                    setTotal(Number(data.total) || 0);
                }
            } catch (e) {
                if (!cancelled) {
                    setItems([]);
                    setTotalPages(0);
                    setTotal(0);
                    setErr(e?.response?.data?.error || "Greška pri učitavanju recepata.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [page, q, category, section, subcategory]);

    /* Actions */
    const handleLike = async (id) => {
        if (likedSet.has(id)) return alert("Već si lajkovao ovaj recept!");
        try {
            const { data } = await axios.post(`/api/recipes/${id}/like`);
            setItems((prev) =>
                prev.map((r) => (r._id === id ? { ...r, likes: data?.likes ?? (r.likes || 0) } : r))
            );
            const updated = [...likedRecipes, id];
            setLikedRecipes(updated);
            localStorage.setItem("liked_recipes", JSON.stringify(updated));
        } catch (err) {
            console.error("Greška pri lajkovanju:", err);
        }
    };

    const handleFavorite = (id) => {
        const updated = favSet.has(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
        setFavorites(updated);
        localStorage.setItem(`favorites_${userId}`, JSON.stringify(updated));
    };

    const handlePageChange = (nextPage) => {
        const next = new URLSearchParams(sp);
        next.set("page", String(nextPage));
        setSp(next, { replace: false });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /* Filter callbacks (klik filter) */
    // onPick(cat, section, subcategory)
    const handleFilterPick = (cat, sec, sub = "") => {
        const prevCat = sp.get("category") || "";
        const prevSec = sp.get("section") || "";
        const prevSub = sp.get("subcategory") || "";

        const nextCat = (cat || "").toLowerCase();
        const nextSec = sec || "";
        const nextSub = sub || "";

        if (prevCat === nextCat && prevSec === nextSec && prevSub === nextSub) return;

        const copy = new URLSearchParams(sp);
        nextCat ? copy.set("category", nextCat) : copy.delete("category");
        nextSec ? copy.set("section", nextSec) : copy.delete("section");
        nextSub ? copy.set("subcategory", nextSub) : copy.delete("subcategory");
        copy.set("page", "1");
        setSp(copy, { replace: false });
    };

    const resetFilters = () => {
        const hadAny = sp.has("category") || sp.has("section") || sp.has("subcategory");
        const copy = new URLSearchParams(sp);
        copy.delete("category");
        copy.delete("section");
        copy.delete("subcategory");
        if (hadAny) copy.set("page", "1");
        setSp(copy, { replace: false });
    };

    /* UI */
    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-emerald-50">
            <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 py-6 space-y-6">
                {/* Header bar */}
                <div className="rounded-3xl bg-white/60 backdrop-blur border border-zinc-200 shadow-sm p-4 flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Pretraži recepte…"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 bg-white/90 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <p className="text-xs text-zinc-500 mt-1">
                            Prikazujem {(items || []).length} od {total} rezultata
                        </p>
                    </div>

                    <div className="flex items-center gap-2 md:ml-auto">
                        <Link
                            to={`/popularni${location.search}`}
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-3 py-2 text-sm shadow-sm"
                        >
                            <Flame className="h-4 w-4" /> Najpopularniji
                        </Link>
                        <Link
                            to={`/favorites${location.search}`}
                            className="inline-flex items-center gap-2 bg-white/90 text-zinc-900 border border-zinc-300 hover:bg-white rounded-xl px-3 py-2 text-sm shadow-sm"
                        >
                            <Star className="h-4 w-4" /> Omiljeni
                        </Link>
                    </div>
                </div>

                {/* Filter kartica (SLANO + SLATKO, klik) */}
                <div className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur p-3 md:p-4 shadow-sm">
                    <RecipeFilterClick
                        onPick={handleFilterPick}
                        onReset={resetFilters}
                        current={{ category, section, subcategory }}
                    />
                </div>

                {/* Error state */}
                {!!err && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3">
                        {err}
                    </div>
                )}

                {/* Grid recepata */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {loading &&
                        Array.from({ length: 10 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border border-zinc-200 bg-white/70 backdrop-blur overflow-hidden shadow-sm"
                            >
                                <div className="h-40 bg-zinc-200/60 animate-pulse" />
                                <div className="p-3 space-y-2">
                                    <div className="h-4 bg-zinc-200/80 rounded" />
                                    <div className="h-3 bg-zinc-200/60 rounded w-1/2" />
                                </div>
                            </div>
                        ))}

                    {!loading &&
                        items.map((r) => (
                            <motion.article
                                key={r._id}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.25 }}
                                className="group rounded-2xl border border-zinc-200 bg-white/80 backdrop-blur overflow-hidden shadow-sm hover:shadow-md transition"
                            >
                                <Link
                                    to={`/recept/${r._id}${location.search}`}
                                    state={{ from: location.pathname + location.search }}
                                >
                                    <div className="relative">
                                        {r?.coverImage?.url && (
                                            <img
                                                src={cdn(r.coverImage.url, 640)}
                                                alt={r.title}
                                                className="w-full h-40 md:h-44 object-cover"
                                                loading="lazy"
                                            />
                                        )}
                                        {/* preparationTime u bazi je string → prikaži ako postoji */}
                                        {r.preparationTime && String(r.preparationTime).trim() && (
                                            <span className="absolute left-2 top-2 rounded-full bg-white/90 text-zinc-900 text-[11px] px-2 py-0.5 border border-zinc-200 shadow-sm">
                                                ⏱ {r.preparationTime}
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h3 className="text-zinc-900 font-semibold text-sm line-clamp-2 group-hover:text-emerald-700 transition">
                                            {r.title}
                                        </h3>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {r.category && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 text-zinc-700 border border-zinc-200">
                                                    {String(r.category).toUpperCase()}
                                                </span>
                                            )}
                                            {r.section && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    {r.section}
                                                </span>
                                            )}
                                            {r.subcategory && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-50 text-pink-700 border border-pink-200">
                                                    {r.subcategory}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>

                                <div className="px-3 pb-3 flex items-center justify-between">
                                    <span className="text-[10px] text-zinc-500">
                                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("sr-RS") : ""}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => handleLike(r._id)}
                                            disabled={likedSet.has(r._id)}
                                            className={`px-2 py-1 rounded-full text-[11px] shadow-sm ${likedSet.has(r._id)
                                                    ? "bg-zinc-300 text-white cursor-not-allowed"
                                                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                                                }`}
                                        >
                                            👍 {r.likes || 0}
                                        </button>
                                        <button
                                            onClick={() => handleFavorite(r._id)}
                                            className={`p-1 rounded-full border text-[11px] ${favSet.has(r._id)
                                                    ? "bg-emerald-600 text-white border-emerald-700"
                                                    : "bg-white/90 text-zinc-700 border-zinc-300 hover:bg-white"
                                                }`}
                                            aria-label="Sačuvaj u omiljene"
                                        >
                                            <Star className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                </div>

                {!loading && items.length === 0 && (
                    <div className="text-center mt-6 text-zinc-600">
                        Nema rezultata{q ? <> za: <strong>{q}</strong></> : ""}.
                    </div>
                )}

                {/* Paginacija */}
                {totalPages > 1 && (
                    <div className="mt-8">
                        <div className="flex flex-wrap justify-center items-center gap-1.5">
                            <button
                                onClick={() => handlePageChange(Math.max(page - 1, 1))}
                                disabled={page === 1}
                                className={`px-3 py-1.5 rounded-full text-sm ${page === 1
                                        ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                                        : "bg-white/80 border border-zinc-300 text-zinc-700 hover:bg-white"
                                    }`}
                                aria-label="Prethodna strana"
                            >
                                ←
                            </button>

                            {makePageList(totalPages, page, 9).map((it, idx) =>
                                it === "…" ? (
                                    <span key={`dots-${idx}`} className="px-2 py-1.5 text-sm text-zinc-400 select-none">
                                        …
                                    </span>
                                ) : (
                                    <button
                                        key={it}
                                        onClick={() => handlePageChange(it)}
                                        className={`px-3 py-1.5 rounded-full text-sm ${page === it
                                                ? "bg-emerald-600 text-white"
                                                : "bg-white/80 border border-zinc-300 text-zinc-700 hover:bg-white"
                                            }`}
                                        aria-current={page === it ? "page" : undefined}
                                    >
                                        {it}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
                                disabled={page === totalPages}
                                className={`px-3 py-1.5 rounded-full text-sm ${page === totalPages
                                        ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                                        : "bg-white/80 border border-zinc-300 text-zinc-700 hover:bg-white"
                                    }`}
                                aria-label="Sledeća strana"
                            >
                                →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
