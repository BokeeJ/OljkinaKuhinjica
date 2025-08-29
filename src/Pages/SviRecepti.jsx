import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { API_BASE_URL } from "../config";
import RecipeFilter from "../Components/RecipeFilter";

function SviRecepti() {
    const userId = "user123";

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

    // pagination window helper
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

    // --- state ---
    const [recipes, setRecipes] = useState([]);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [subCategory, setSubCategory] = useState("");

    const [favorites, setFavorites] = useState(() => getLSArray(`favorites_${userId}`));
    const [likedRecipes, setLikedRecipes] = useState(() => getLSArray("liked_recipes"));

    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 12;

    // derived guards
    const favoritesArr = Array.isArray(favorites) ? favorites : [];
    const likedArr = Array.isArray(likedRecipes) ? likedRecipes : [];
    const favSet = useMemo(() => new Set(favoritesArr), [favoritesArr]);
    const likedSet = useMemo(() => new Set(likedArr), [likedArr]);

    // --- fetch ---
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/recipes`, { withCredentials: true });
                const data = Array.isArray(res.data) ? res.data : [];
                if (!cancelled) setRecipes(data);
            } catch (err) {
                console.error("Greška pri učitavanju recepata:", err);
                if (!cancelled) setRecipes([]);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // reset paginacije kad se menja filter/pretraga
    useEffect(() => { setCurrentPage(1); }, [search, categoryFilter, subCategory]);

    // --- actions ---
    const handleLike = async (id) => {
        if (likedSet.has(id)) {
            alert("Već si lajkovao ovaj recept!");
            return;
        }
        try {
            const res = await axios.post(`${API_BASE_URL}/api/recipes/${id}/like`);
            setRecipes((prev) =>
                (Array.isArray(prev) ? prev : []).map((r) =>
                    r._id === id ? { ...r, likes: res.data?.likes ?? (r.likes || 0) } : r
                )
            );
            const updated = [...likedArr, id];
            setLikedRecipes(updated);
            localStorage.setItem("liked_recipes", JSON.stringify(updated));
        } catch (err) {
            console.error("Greška pri lajkovanju:", err);
        }
    };

    const handleFavorite = (id) => {
        let updated;
        if (favSet.has(id)) {
            updated = favoritesArr.filter((f) => f !== id);
        } else {
            updated = [...favoritesArr, id];
        }
        setFavorites(updated);
        localStorage.setItem(`favorites_${userId}`, JSON.stringify(updated));
    };

    const handleSubCategorySelect = (cat, sub) => {
        setCategoryFilter(cat);
        setSubCategory(sub);
    };

    const resetFilters = () => {
        setCategoryFilter("");
        setSubCategory("");
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // --- derive ---
    const list = Array.isArray(recipes) ? recipes : [];

    const filteredRecipes = useMemo(() => {
        const s = normalizeText(search);
        const cat = normalizeText(categoryFilter);
        const sub = normalizeText(subCategory);

        return list.filter((r) => {
            const titleOk = normalizeText(r?.title || "").includes(s);
            const catOk = cat ? normalizeText(r?.category || "") === cat : true;
            const subOk = sub ? normalizeText(r?.subcategory || "") === sub : true;
            return titleOk && catOk && subOk;
        });
    }, [list, search, categoryFilter, subCategory]);

    const totalPages = Math.ceil(filteredRecipes.length / perPage) || 0;
    const currentRecipes = filteredRecipes.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    return (
        <div className="p-4 mt-5 min-h-screen flex flex-col items-center bg-gradient-to-b from-white to-gray-600">
            {/* SEARCH */}
            <div className="w-full max-w-7xl mb-4 px-1">
                <input
                    type="text"
                    placeholder="Pretraži recepte..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:max-w-[360px] mx-auto block p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white/70"
                />
            </div>

            {/* FILTERI */}
            <div className="relative flex flex-wrap justify-center gap-3 mb-6 w-full max-w-7xl">
                <RecipeFilter onSelect={handleSubCategorySelect} onReset={resetFilters} />

                <Link
                    to="/popularni"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-4 py-2 text-sm"
                >
                    🔥 Najpopularniji
                </Link>
                <Link
                    to="/favorites"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-4 py-2 text-sm"
                >
                    ⭐ Omiljeni
                </Link>
            </div>

            {/* RECEPTI */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 w-full max-w-7xl">
                {currentRecipes.map((r) => (
                    <motion.div
                        key={r._id}
                        className="bg-gradient-to-b from-gray-400 to-white rounded-lg shadow hover:shadow-lg overflow-hidden transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3 }}
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
                                <h2 className="text-xs font-bold text-gray-800 line-clamp-1">
                                    {r.title}
                                </h2>
                                {r.preparationTime && (
                                    <p className="text-[9px] mt-1 text-orange-400">⏱ {r.preparationTime}</p>
                                )}
                            </div>
                        </div>
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
                                <Link
                                    to={`/recept/${r._id}`}
                                    className="bg-emerald-500 text-white rounded-full px-2 py-0.5 text-[9px] hover:bg-emerald-600"
                                >
                                    vidi →
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {currentRecipes.length === 0 && (
                <div className="text-center mt-6 text-gray-600">
                    Nema rezultata za: <strong>{search}</strong>
                </div>
            )}

            {/* PAGINACIJA */}
            {totalPages > 1 && (
                <div className="w-full max-w-7xl mt-8 px-2">
                    <div className="flex flex-wrap justify-center items-center gap-1">
                        <button
                            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-2 py-1 rounded-full text-[10px] ${currentPage === 1
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                }`}
                            aria-label="Prethodna strana"
                        >
                            ←
                        </button>

                        {makePageList(totalPages, currentPage, 9).map((item, idx) =>
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
                                    className={`px-2 py-1 rounded-full text-[10px] ${currentPage === item
                                            ? "bg-emerald-500 text-white"
                                            : "bg-gray-300 text-gray-600 hover:bg-gray-400"
                                        }`}
                                    aria-current={currentPage === item ? "page" : undefined}
                                >
                                    {item}
                                </button>
                            )
                        )}

                        <button
                            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`px-2 py-1 rounded-full text-[10px] ${currentPage === totalPages
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                }`}
                            aria-label="Sledeća strana"
                        >
                            →
                        </button>
                    </div>

                    <div className="mt-3 flex justify-center gap-2 text-[10px] text-gray-600">
                        <span>Strana {currentPage} / {totalPages}</span>
                        <label className="inline-flex items-center gap-1">
                            Idi na:
                            <input
                                type="number"
                                min={1}
                                max={totalPages}
                                defaultValue={currentPage}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        const v = Math.min(Math.max(1, Number(e.currentTarget.value || 1)), totalPages);
                                        handlePageChange(v);
                                    }
                                }}
                                className="w-16 px-1 py-0.5 border rounded"
                            />
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SviRecepti;
