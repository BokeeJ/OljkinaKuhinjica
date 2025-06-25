import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Header from "../Components/Header"; // VAŽNO! Da prosleđuje search value i callback

function SviRecepti() {
    const userId = "user123"; // <-- OVDE UBACI PRAVI ID KORISNIKA
    const [recipes, setRecipes] = useState([]);
    const [search, setSearch] = useState(""); // OVDE DRŽI SEARCH
    const [categoryFilter, setCategoryFilter] = useState("");
    const [favorites, setFavorites] = useState(() => {
        const saved = JSON.parse(localStorage.getItem(`favorites_${userId}`)) || [];
        return saved;
    });
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 12;

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get("http://localhost:5050/api/recipes");
            setRecipes(res.data);
        };
        fetchData();
    }, []);

    const handleLike = async (id) => {
        try {
            const res = await axios.post(`http://localhost:5050/api/recipes/${id}/like`);
            setRecipes((prev) =>
                prev.map((r) => (r._id === id ? { ...r, likes: res.data.likes } : r))
            );
        } catch (error) {
            console.error(error);
        }
    };
    const handleDislike = async (id) => {
        try {
            const res = await axios.post(`http://localhost:5050/api/recipes/${id}/dislike`);
            setRecipes((prev) =>
                prev.map((r) => (r._id === id ? { ...r, likes: res.data.likes } : r))
            );
        } catch (error) {
            console.error(error);
        }
    };
    const handleFavorite = (id) => {
        let updatedFavorites = [...favorites];
        if (updatedFavorites.includes(id)) {
            updatedFavorites = updatedFavorites.filter((fav) => fav !== id);
        } else {
            updatedFavorites.push(id);
        }
        setFavorites(updatedFavorites);
        localStorage.setItem(`favorites_${userId}`, JSON.stringify(updatedFavorites));
    };
    const filteredRecipes = recipes.filter(
        (r) =>
            r.title.toLowerCase().includes(search.toLowerCase()) &&
            (categoryFilter ? r.category === categoryFilter : true)
    );
    const totalPages = Math.ceil(filteredRecipes.length / perPage);
    const currentRecipes = filteredRecipes.slice((currentPage - 1) * perPage, currentPage * perPage);

    return (
        <div className="p-4 bg-gradient-to-b mt-5 min-h-screen">
            {/* HEADER */}
            {/* <Header
                value={search}
                onSearchChange={(val) => setSearch(val)}
            /> */}

            {/* FILTERS */}
            <div className="flex flex-col sm:flex-row justify-center items-center mt-4 gap-3 flex-wrap">
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="">Sve kategorije</option>
                    <option value="slano">Slano</option>
                    <option value="slatko">Slatko</option>
                </select>
                <Link
                    to="/popularni"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-3 py-2 text-sm"
                >
                    🔥 Najpopularniji
                </Link>
                <Link
                    to="/favorites"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-3 py-2 text-sm"
                >
                    ⭐ Moji favoriti
                </Link>
            </div>

            {/* RECEPTI */}
            <div className="mt-8 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
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
                            {r.imageUrl && (
                                <img
                                    src={r.imageUrl}
                                    alt={r.title}
                                    className="w-full h-28 sm:h-32 object-cover"
                                />
                            )}
                            <div className="p-2">
                                <h2 className="text-sm font-bold text-gray-800 line-clamp-1">{r.title}</h2>
                                <p className="text-gray-600 mt-1 text-xs line-clamp-2">{r.description}</p>
                                <span className="bg-emerald-100 text-emerald-600 rounded-full px-2 py-1 text-[10px] mt-1 inline-block">
                                    {r.category}
                                </span>
                            </div>
                        </div>
                        <div className="p-2 flex justify-between items-center flex-wrap gap-1">
                            <p className="text-gray-400 text-[10px]">{new Date(r.createdAt).toLocaleString("sr-RS")}</p>
                            <div className="flex flex-wrap items-center gap-1">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleLike(r._id);
                                    }}
                                    className="bg-emerald-500 text-white rounded-full px-2 py-1 text-[10px] hover:bg-emerald-600"
                                >
                                    👍 ({r.likes || 0})
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDislike(r._id);
                                    }}
                                    className="bg-gray-300 text-gray-600 rounded-full px-2 py-1 text-[10px] hover:bg-gray-400"
                                >
                                    👎
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleFavorite(r._id);
                                    }}
                                    className={`rounded-full p-1 flex items-center justify-center ${favorites.includes(r._id) ? "bg-emerald-600 text-white" : "bg-gray-300 text-gray-600 hover:bg-emerald-100"}`}
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

            {/* Poruka kad nema rezultata */}
            {currentRecipes.length === 0 && (
                <div className="text-center mt-6 text-gray-600">
                    Nema rezultata za: <strong>{search}</strong>
                </div>
            )}

            {/* Pagination */}
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
