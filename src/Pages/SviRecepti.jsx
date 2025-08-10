import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { API_BASE_URL } from "../config";
import RecipeFilter from "../Components/RecipeFilter";

function SviRecepti() {
    const userId = "user123";
    const [recipes, setRecipes] = useState([]);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [subCategory, setSubCategory] = useState("");
    const [favorites, setFavorites] = useState(
        () => JSON.parse(localStorage.getItem(`favorites_${userId}`)) || []
    );
    const [likedRecipes, setLikedRecipes] = useState(
        () => JSON.parse(localStorage.getItem("liked_recipes") || "[]")
    );
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 12;

    const normalizeText = (text = "") => {
        try {
            return text
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
                .toLowerCase();
        } catch {
            // fallback za Safari/regex engine
            return text
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
        }
    };

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/recipes`).then((res) => setRecipes(res.data));
    }, []);

    // Reset paginacije kad se menja filter ili pretraga
    useEffect(() => {
        setCurrentPage(1);
    }, [search, categoryFilter, subCategory]);

    const handleLike = async (id) => {
        if (likedRecipes.includes(id)) {
            alert("Već si lajkovao ovaj recept!");
            return;
        }
        try {
            const res = await axios.post(`${API_BASE_URL}/api/recipes/${id}/like`);
            setRecipes((prev) =>
                prev.map((r) => (r._id === id ? { ...r, likes: res.data.likes } : r))
            );
            const updated = [...likedRecipes, id];
            setLikedRecipes(updated);
            localStorage.setItem("liked_recipes", JSON.stringify(updated));
        } catch (err) {
            console.error("Greška pri lajkovanju:", err);
        }
    };

    const handleFavorite = (id) => {
        let updated = [...favorites];
        updated = updated.includes(id)
            ? updated.filter((f) => f !== id)
            : [...updated, id];
        setFavorites(updated);
        localStorage.setItem(`favorites_${userId}`, JSON.stringify(updated));
    };

    const filteredRecipes = useMemo(() => {
        const s = normalizeText(search);
        const cat = normalizeText(categoryFilter);
        const sub = normalizeText(subCategory);

        return recipes.filter((r) => {
            const titleOk = normalizeText(r.title).includes(s);
            const catOk = cat ? normalizeText(r.category) === cat : true;
            const subOk = sub ? normalizeText(r.subcategory || "") === sub : true;
            return titleOk && catOk && subOk;
        });
    }, [recipes, search, categoryFilter, subCategory]);

    const totalPages = Math.ceil(filteredRecipes.length / perPage);
    const currentRecipes = filteredRecipes.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

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
                <RecipeFilter
                    onSelect={(cat, sub) => handleSubCategorySelect(cat, sub)}
                    onReset={resetFilters}
                />

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
                            {r.coverImage?.url && (
                                <img
                                    src={r.coverImage.url}
                                    alt={r.title}
                                    className="w-full h-28 object-cover"
                                    loading="lazy"
                                />
                            )}
                            <div className="p-2">
                                <h2 className="text-xs font-bold text-gray-800 line-clamp-1">
                                    {r.title}
                                </h2>
                                <p className="text-[9px] mt-1 text-orange-400">
                                    ⏱ {r.preparationTime} min
                                </p>
                            </div>
                        </div>
                        <div className="p-2 flex justify-between items-center flex-wrap gap-1">
                            <p className="text-gray-400 text-[8px]">
                                {new Date(r.createdAt).toLocaleString("sr-RS")}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleLike(r._id)}
                                    disabled={likedRecipes.includes(r._id)}
                                    className={`rounded-full px-2 py-0.5 text-[9px] ${likedRecipes.includes(r._id)
                                            ? "bg-gray-400 text-white cursor-not-allowed"
                                            : "bg-emerald-500 text-white hover:bg-emerald-600"
                                        }`}
                                >
                                    👍 ({r.likes || 0})
                                </button>
                                <button
                                    onClick={() => handleFavorite(r._id)}
                                    className={`rounded-full p-1 flex items-center justify-center ${favorites.includes(r._id)
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
                <div className="flex justify-center mt-8 space-x-1 items-center">
                    <button
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-2 py-1 rounded-full text-[10px] ${currentPage === 1
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                            }`}
                    >
                        ←
                    </button>

                    {[...Array(totalPages).keys()].map((num) => (
                        <button
                            key={num}
                            onClick={() => handlePageChange(num + 1)}
                            className={`px-2 py-1 rounded-full text-[10px] ${currentPage === num + 1
                                    ? "bg-emerald-500 text-white"
                                    : "bg-gray-300 text-gray-600 hover:bg-gray-400"
                                }`}
                        >
                            {num + 1}
                        </button>
                    ))}

                    <button
                        onClick={() =>
                            handlePageChange(Math.min(currentPage + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        className={`px-2 py-1 rounded-full text-[10px] ${currentPage === totalPages
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                            }`}
                    >
                        →
                    </button>
                </div>
            )}
        </div>
    );
}

export default SviRecepti;
