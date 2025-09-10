import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import axios from "../api";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import RecipeFilter from "../Components/RecipeFilter";

function SviRecepti() {
    const userId = "user123";
    const location = useLocation();
    const [sp, setSp] = useSearchParams();

    // --- helpers ---
    const getLSArray = (key) => {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return [];
            const v = JSON.parse(raw);
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

    const normalizeText = (text = "") => {
        try {
            return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
        } catch {
            return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        }
    };

    // kompaktnija paginacija (prozor + elipse)
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

    // --- URL state (ISTINA JE U URL-u) ---
    const perPage = 12;
    const page = Math.max(1, Number(sp.get("page") || 1));
    const q = sp.get("q") || "";
    const category = sp.get("category") || "";
    const subcategory = sp.get("subcategory") || "";

    // Search input (debounce) — UI state, ali se "commituje" u URL posle 300ms
    const [searchInput, setSearchInput] = useState(q);
    useEffect(() => {
        setSearchInput(q); // kad se URL promeni spolja, syncuj input
    }, [q]);

    useEffect(() => {
        const t = setTimeout(() => {
            const copy = new URLSearchParams(sp);
            if (searchInput.trim()) copy.set("q", searchInput.trim());
            else copy.delete("q");
            copy.set("page", "1"); // resetuj na 1 kad se menja pretraga
            setSp(copy, { replace: false });
        }, 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    // --- ostali state ---
    const [items, setItems] = useState([]); // trenutna strana sa servera
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);

    const [favorites, setFavorites] = useState(() => getLSArray(`favorites_${userId}`));
    const [likedRecipes, setLikedRecipes] = useState(() => getLSArray("liked_recipes"));

    const favSet = useMemo(() => new Set(Array.isArray(favorites) ? favorites : []), [favorites]);
    const likedSet = useMemo(() => new Set(Array.isArray(likedRecipes) ? likedRecipes : []), [likedRecipes]);

    // --- server fetch (vezan za URL query) ---
    useEffect(() => {
        let cancelled = false;

        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(perPage));
        if (q.trim()) params.set("q", q.trim());
        if (category) params.set("category", normalizeText(category));
        if (subcategory) params.set("subcategory", subcategory); // case ostaje isti

        (async () => {
            try {
                const url = `/api/recipes/page?` + params.toString();
                const res = await axios.get(url);
                const { items = [], totalPages = 0, total = 0 } = res.data || {};
                if (!cancelled) {
                    setItems(Array.isArray(items) ? items : []);
                    setTotalPages(Number(totalPages) || 0);
                    setTotal(Number(total) || 0);
                }
            } catch (e) {
                console.error("Greška pri učitavanju (page):", e);
                if (!cancelled) {
                    setItems([]);
                    setTotalPages(0);
                    setTotal(0);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [page, q, category, subcategory]);

    // --- actions ---
    const handleLike = async (id) => {
        if (likedSet.has(id)) {
            alert("Već si lajkovao ovaj recept!");
            return;
        }
        try {
            const res = await axios.post(`/api/recipes/${id}/like`);
            setItems((prev) =>
                (Array.isArray(prev) ? prev : []).map((r) =>
                    r._id === id ? { ...r, likes: res.data?.likes ?? (r.likes || 0) } : r
                )
            );
            const updated = [...(Array.isArray(likedRecipes) ? likedRecipes : []), id];
            setLikedRecipes(updated);
            localStorage.setItem("liked_recipes", JSON.stringify(updated));
        } catch (err) {
            console.error("Greška pri lajkovanju:", err);
        }
    };

    const handleFavorite = (id) => {
        const arr = Array.isArray(favorites) ? favorites : [];
        const updated = favSet.has(id) ? arr.filter((f) => f !== id) : [...arr, id];
        setFavorites(updated);
        localStorage.setItem(`favorites_${userId}`, JSON.stringify(updated));
    };

    // Callback iz RecipeFilter-a
    const handleSubCategorySelect = (cat, sub) => {
        const copy = new URLSearchParams(sp);
        if (cat) copy.set("category", cat);
        else copy.delete("category");
        if (sub) copy.set("subcategory", sub);
        else copy.delete("subcategory");
        copy.set("page", "1"); // reset na 1 kad se menja filter
        setSp(copy, { replace: false });
    };

    const resetFilters = () => {
        const copy = new URLSearchParams(sp);
        copy.delete("category");
        copy.delete("subcategory");
        copy.set("page", "1");
        setSp(copy, { replace: false });
    };

    const handlePageChange = (nextPage) => {
        const copy = new URLSearchParams(sp);
        copy.set("page", String(nextPage));
        setSp(copy, { replace: false });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="p-4 mt-5 min-h-screen flex flex-col items-center bg-gradient-to-b from-white to-gray-600">
            {/* SEARCH */}
            <div className="w-full max-w-7xl mb-4 px-1">
                <input
                    type="text"
                    placeholder="Pretraži recepte..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full sm:max-w-[360px] mx-auto block p-3 rounded-xl border text-gray-600 border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white/70"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Prikazujem {(items || []).length} od {total} rezultata
                </p>
            </div>

            {/* FILTERI */}
            <div className="relative flex flex-wrap justify-center gap-3 mb-6 w-full max-w-7xl">
                <RecipeFilter onSelect={handleSubCategorySelect} onReset={resetFilters} />

                <Link
                    to={`/popularni${location.search}`}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-4 py-2 text-sm"
                >
                    🔥 Najpopularniji
                </Link>
                <Link
                    to={`/favorites${location.search}`}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-4 py-2 text-sm"
                >
                    ⭐ Omiljeni
                </Link>
            </div>

            {/* RECEPTI (trenutna strana sa servera) */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 w-full max-w-7xl">
                {(items || []).map((r) => (
                    <motion.div
                        key={r._id}
                        className="bg-gradient-to-b from-gray-400 to-white rounded-lg shadow hover:shadow-lg overflow-hidden transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3 }}
                    >
                        <Link
                            to={`/recept/${r._id}${location.search}`} // zadržava page & filtere
                            state={{ from: location.pathname + location.search }}
                        >
                            <div>
                                {r?.coverImage?.url && (
                                    <img
                                        src={cdn(r.coverImage.url, 480)}
                                        alt={r.title}
                                        className="w-full h-28 object-cover"
                                        loading="lazy"
                                    />
                                )}
                                <div className="p-2">
                                    <h2 className="text-xs font-bold text-gray-800 line-clamp-1">{r.title}</h2>
                                    {r.preparationTime && (
                                        <p className="text-[9px] mt-1 text-orange-400">⏱ {r.preparationTime}</p>
                                    )}
                                </div>
                            </div>
                        </Link>
                        <div className="p-2 flex justify-between items-center flex-wrap gap-1">
                            <p className="text-gray-400 text-[8px]">
                                {r.createdAt ? new Date(r.createdAt).toLocaleString("sr-RS") : ""}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleLike(r._id)}
                                    disabled={likedSet.has(r._id)}
                                    className={`rounded-full px-2 py-0.5 text-[9px] ${likedSet.has(r._id)
                                            ? "bg-gray-400 text-white cursor-not-allowed"
                                            : "bg-emerald-500 text-white hover:bg-emerald-600"
                                        }`}
                                >
                                    👍 ({r.likes || 0})
                                </button>
                                <button
                                    onClick={() => handleFavorite(r._id)}
                                    className={`rounded-full p-1 flex items-center justify-center ${favSet.has(r._id)
                                            ? "bg-emerald-600 text-white"
                                            : "bg-gray-300 text-gray-600 hover:bg-emerald-100"
                                        }`}
                                    aria-label="Sačuvaj u omiljene"
                                >
                                    <Star className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {(items || []).length === 0 && (
                <div className="text-center mt-6 text-gray-600">
                    Nema rezultata za: <strong>{q}</strong>
                </div>
            )}

            {/* PAGINACIJA (server-side) */}
            {totalPages > 1 && (
                <div className="w-full max-w-7xl mt-8 px-2">
                    <div className="flex flex-wrap justify-center items-center gap-1">
                        <button
                            onClick={() => handlePageChange(Math.max(page - 1, 1))}
                            disabled={page === 1}
                            className={`px-2 py-1 rounded-full text-[10px] ${page === 1
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                }`}
                            aria-label="Prethodna strana"
                        >
                            ←
                        </button>

                        {makePageList(totalPages, page, 9).map((item, idx) =>
                            item === "…" ? (
                                <span
                                    key={`dots-${idx}`}
                                    className="px-2 py-1 text-[10px] text-gray-500 select-none"
                                >
                                    …
                                </span>
                            ) : (
                                <button
                                    key={item}
                                    onClick={() => handlePageChange(item)}
                                    className={`px-2 py-1 rounded-full text-[10px] ${page === item
                                            ? "bg-emerald-500 text-white"
                                            : "bg-gray-300 text-gray-600 hover:bg-gray-400"
                                        }`}
                                    aria-current={page === item ? "page" : undefined}
                                >
                                    {item}
                                </button>
                            )
                        )}

                        <button
                            onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
                            disabled={page === totalPages}
                            className={`px-2 py-1 rounded-full text-[10px] ${page === totalPages
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                }`}
                            aria-label="Sledeća strana"
                        >
                            →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SviRecepti;
