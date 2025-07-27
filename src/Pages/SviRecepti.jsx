import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { API_BASE_URL } from "../config";

function SviRecepti() {
    const userId = "user123";
    const [recipes, setRecipes] = useState([]);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [subCategory, setSubCategory] = useState("");
    const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem(`favorites_${userId}`)) || []);
    const [likedRecipes, setLikedRecipes] = useState(() => JSON.parse(localStorage.getItem("liked_recipes") || "[]"));
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 12;

    const [openDropdown, setOpenDropdown] = useState(false);
    const [openSubMenu, setOpenSubMenu] = useState("");

    const normalizeText = (text) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/recipes`).then((res) => setRecipes(res.data));
    }, []);

    const handleLike = async (id) => {
        if (likedRecipes.includes(id)) {
            alert("Već si lajkovao ovaj recept!");
            return;
        }

        try {
            const res = await axios.post(`${API_BASE_URL}/api/recipes/${id}/like`);
            setRecipes((prev) => prev.map((r) => (r._id === id ? { ...r, likes: res.data.likes } : r)));
            const updated = [...likedRecipes, id];
            setLikedRecipes(updated);
            localStorage.setItem("liked_recipes", JSON.stringify(updated));
        } catch (err) {
            console.error("Greška pri lajkovanju:", err);
        }
    };

    const handleFavorite = (id) => {
        let updated = [...favorites];
        updated = updated.includes(id) ? updated.filter((f) => f !== id) : [...updated, id];
        setFavorites(updated);
        localStorage.setItem(`favorites_${userId}`, JSON.stringify(updated));
    };

    const filterRecipes = recipes.filter((r) => {
        const matchSearch = normalizeText(r.title).includes(normalizeText(search));
        const matchCategory = categoryFilter ? normalizeText(r.category) === normalizeText(categoryFilter) : true;
        const matchSub = subCategory ? normalizeText(r.subcategory || '') === normalizeText(subCategory) : true;
        return matchSearch && matchCategory && matchSub;
    });

    const totalPages = Math.ceil(filterRecipes.length / perPage);
    const currentRecipes = filterRecipes.slice((currentPage - 1) * perPage, currentPage * perPage);

    const handleSubCategorySelect = (cat, sub) => {
        setCategoryFilter(cat);
        setSubCategory(sub);
        setOpenDropdown(false);
        setOpenSubMenu("");
    };

    const resetFilters = () => {
        setCategoryFilter("");
        setSubCategory("");
        setOpenDropdown(false);
        setOpenSubMenu("");
    };

    return (
        <div className="p-4 mt-5 min-h-screen flex flex-col items-center bg-gradient-to-b from-white to-gray-100">
            {/* FILTERI */}
            <div className="relative flex flex-wrap justify-center gap-3 mb-6">
                <button
                    onClick={() => setOpenDropdown((prev) => !prev)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-4 py-2 text-sm h-10"
                >
                    🧭 Izaberi kategoriju
                </button>
                <button
                    onClick={resetFilters}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-full px-4 py-2 text-sm h-10"
                >
                    ✖ Poništi filtere
                </button>

                <AnimatePresence>
                    {openDropdown && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="absolute top-14 left-0 bg-white border shadow-md rounded-lg z-50 p-4 w-[280px] sm:w-[380px]"
                        >
                            <div className="flex gap-6 flex-wrap text-sm">
                                <div className="flex flex-col gap-2 min-w-[100px]">
                                    <button onClick={() => setOpenSubMenu("slatko")} className="hover:underline">Slatko</button>
                                    <button onClick={() => setOpenSubMenu("slano")} className="hover:underline">Slano</button>
                                </div>
                                {openSubMenu === "slatko" && (
                                    <div className="flex flex-col gap-2 border-l pl-4">
                                        <button onClick={() => handleSubCategorySelect("slatko", "Kolači")}>Kolači</button>
                                        <button onClick={() => handleSubCategorySelect("slatko", "Torte")}>Torte</button>
                                    </div>
                                )}
                                {openSubMenu === "slano" && (
                                    <div className="flex flex-col gap-2 border-l pl-4">
                                        <button onClick={() => handleSubCategorySelect("slano", "Doručak")}>Doručak</button>
                                        <button onClick={() => handleSubCategorySelect("slano", "Ručak")}>Ručak</button>
                                        <button onClick={() => handleSubCategorySelect("slano", "Večera")}>Večera</button>
                                        <button onClick={() => handleSubCategorySelect("slano", "Pica")}>Pica</button>
                                        <button onClick={() => handleSubCategorySelect("slano", "Brza jela")}>Brza jela</button>
                                        <button onClick={() => handleSubCategorySelect("slano", "Salate")}>Salate</button>
                                        <button onClick={() => handleSubCategorySelect("slano", "Hladna jela")}>Hladna jela</button>
                                        <button onClick={() => handleSubCategorySelect("slano", "Užina")}>Užina</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Link to="/popularni" className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-4 py-2 text-sm">🔥 Najpopularniji</Link>
                <Link to="/favorites" className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-4 py-2 text-sm">⭐ Moji favoriti</Link>
            </div>

            {/* RECEPTI */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 w-full max-w-7xl">
                {currentRecipes.map((r) => (
                    <motion.div
                        key={r._id}
                        className="bg-white rounded-lg shadow hover:shadow-lg overflow-hidden transition-all duration-300"
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
                                />
                            )}
                            <div className="p-2">
                                <h2 className="text-xs font-bold text-gray-800 line-clamp-1">{r.title}</h2>
                                <p className="text-gray-600 mt-1 text-[10px] line-clamp-2">{r.description}</p>
                                <span className="bg-emerald-100 text-emerald-600 rounded-full px-2 py-0.5 text-[10px] mt-1 inline-block">
                                    {r.category} {r.subcategory && `- ${r.subcategory}`}
                                </span>
                                <p className="text-[9px] mt-1 text-gray-500">⏱ {r.preparationTime} min</p>
                            </div>
                        </div>
                        <div className="p-2 flex justify-between items-center flex-wrap gap-1">
                            <p className="text-gray-400 text-[8px]">{new Date(r.createdAt).toLocaleString("sr-RS")}</p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleLike(r._id)}
                                    disabled={likedRecipes.includes(r._id)}
                                    className={`rounded-full px-2 py-0.5 text-[9px] ${likedRecipes.includes(r._id)
                                        ? "bg-gray-400 text-white cursor-not-allowed"
                                        : "bg-emerald-500 text-white hover:bg-emerald-600"}`}
                                >
                                    👍 ({r.likes || 0})
                                </button>
                                <button
                                    onClick={() => handleFavorite(r._id)}
                                    className={`rounded-full p-1 flex items-center justify-center ${favorites.includes(r._id)
                                        ? "bg-emerald-600 text-white"
                                        : "bg-gray-300 text-gray-600 hover:bg-emerald-100"}`}
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
            <div className="flex justify-center mt-8 space-x-1">
                {[...Array(totalPages).keys()].map((num) => (
                    <button
                        key={num}
                        onClick={() => setCurrentPage(num + 1)}
                        className={`px-2 py-1 rounded-full text-[10px] ${currentPage === num + 1
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-300 text-gray-600"}`}
                    >
                        {num + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default SviRecepti;
