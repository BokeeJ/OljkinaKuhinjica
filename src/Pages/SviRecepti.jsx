import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

function SviRecepti() {
    const userId = "user123";
    const [recipes, setRecipes] = useState([]);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [subCategory, setSubCategory] = useState("");
    const [favorites, setFavorites] = useState(() => {
        return JSON.parse(localStorage.getItem(`favorites_${userId}`)) || [];
    });
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 12;

    const [openDropdown, setOpenDropdown] = useState(false);
    const [openSubMenu, setOpenSubMenu] = useState("");

    useEffect(() => {
        axios.get("https://kuhinjica-backend-1.onrender.com/api/recipes")
            .then((res) => setRecipes(res.data));
    }, []);

    const handleLike = async (id) => {
        const res = await axios.post(`https://kuhinjica-backend-1.onrender.com/api/recipes/${id}/like`);
        setRecipes((prev) => prev.map((r) => (r._id === id ? { ...r, likes: res.data.likes } : r)));
    };

    const handleDislike = async (id) => {
        const res = await axios.post(`https://kuhinjica-backend-1.onrender.com/api/recipes/${id}/dislike`);
        setRecipes((prev) => prev.map((r) => (r._id === id ? { ...r, likes: res.data.likes } : r)));
    };

    const handleFavorite = (id) => {
        let updated = [...favorites];
        updated = updated.includes(id) ? updated.filter((f) => f !== id) : [...updated, id];
        setFavorites(updated);
        localStorage.setItem(`favorites_${userId}`, JSON.stringify(updated));
    };

    const filterRecipes = recipes.filter((r) => {
        const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
        const matchCategory = categoryFilter ? r.category === categoryFilter : true;
        const matchSub = subCategory ? r.subcategory === subCategory : true;
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

    return (
        <div className="p-4 mt-5 min-h-screen flex flex-col items-center bg-gradient-to-b from-white to-gray-100">
            {/* FILTERI */}

            <div className="relative flex flex-wrap justify-center gap-3 mb-6">
                <button
                    onClick={() => setOpenDropdown((prev) => !prev)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-4 py-2 text-sm h-10"
                >
                    Sve kategorije
                </button>

                <AnimatePresence>
                    {openDropdown && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="absolute top-14 left-0 bg-white border shadow-md rounded-lg z-50 p-4"
                        >
                            <div className="flex gap-6">
                                {/* Leva strana - Glavne kategorije */}
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => setOpenSubMenu("slatko")} className="hover:underline">
                                        Slatko
                                    </button>
                                    <button onClick={() => setOpenSubMenu("slano")} className="hover:underline">
                                        Slano
                                    </button>
                                </div>

                                {/* Desna strana - Podkategorije */}
                                {openSubMenu === "slatko" && (
                                    <div className="flex flex-col gap-2 border-l pl-4">
                                        <button onClick={() => handleSubCategorySelect("slatko", "torte")}>
                                            Torte
                                        </button>
                                        <button onClick={() => handleSubCategorySelect("slatko", "kolaci")}>
                                            Kolači
                                        </button>
                                    </div>
                                )}
                                {openSubMenu === "slano" && (
                                    <div className="flex flex-col gap-2 border-l pl-4">
                                        <button onClick={() => handleSubCategorySelect("slano", "dorucak")}>
                                            Doručak
                                        </button>
                                        <button onClick={() => handleSubCategorySelect("slano", "rucak")}>
                                            Ručak
                                        </button>
                                        <button onClick={() => handleSubCategorySelect("slano", "vecera")}>
                                            Večera
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                    ⭐ Moji favoriti
                </Link>
            </div>

            {/* RECEPTI */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full max-w-7xl">
                {currentRecipes.map((r) => (
                    <motion.div
                        key={r._id}
                        className="bg-white rounded-xl shadow hover:shadow-lg flex flex-col justify-between overflow-hidden hover:-translate-y-1 transition transform"
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
                                    className="w-full h-32 object-cover"
                                />
                            )}
                            <div className="p-2">
                                <h2 className="text-sm font-bold text-gray-800 line-clamp-1">{r.title}</h2>
                                <p className="text-gray-600 mt-1 text-xs line-clamp-2">{r.description}</p>
                                <span className="bg-emerald-100 text-emerald-600 rounded-full px-2 py-1 text-[10px] mt-1 inline-block">
                                    {r.category} {r.subcategory && `- ${r.subcategory}`}
                                </span>
                            </div>
                        </div>
                        <div className="p-2 flex justify-between items-center flex-wrap gap-1">
                            <p className="text-gray-400 text-[10px]">{new Date(r.createdAt).toLocaleString("sr-RS")}</p>
                            <div className="flex flex-wrap items-center gap-1">
                                <button
                                    onClick={() => handleLike(r._id)}
                                    className="bg-emerald-500 text-white rounded-full px-2 py-1 text-[10px] hover:bg-emerald-600"
                                >
                                    👍 ({r.likes || 0})
                                </button>
                                <button
                                    onClick={() => handleDislike(r._id)}
                                    className="bg-gray-300 text-gray-600 rounded-full px-2 py-1 text-[10px] hover:bg-gray-400"
                                >
                                    👎
                                </button>
                                <button
                                    onClick={() => handleFavorite(r._id)}
                                    className={`rounded-full p-1 flex items-center justify-center ${favorites.includes(r._id)
                                        ? "bg-emerald-600 text-white"
                                        : "bg-gray-300 text-gray-600 hover:bg-emerald-100"
                                        }`}
                                >
                                    <Star className="h-3 w-3" />
                                </button>
                                <Link
                                    to={`/recept/${r._id}`}
                                    className="bg-emerald-500 text-white rounded-full px-2 py-1 text-[10px] hover:bg-emerald-600"
                                >
                                    detalji →
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Nema rezultata */}
            {currentRecipes.length === 0 && (
                <div className="text-center mt-6 text-gray-600">
                    Nema rezultata za: <strong>{search}</strong>
                </div>
            )}

            {/* Paginacija */}
            <div className="flex justify-center mt-8 space-x-1">
                {[...Array(totalPages).keys()].map((num) => (
                    <button
                        key={num}
                        onClick={() => setCurrentPage(num + 1)}
                        className={`px-2 py-1 rounded-full text-[10px] ${currentPage === num + 1
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-300 text-gray-600"
                            }`}
                    >
                        {num + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default SviRecepti;
