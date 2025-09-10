import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api";

function MyFavorites() {
    const userId = "user123";
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    const recipesPerPage = 8;

    // Cloudinary on-the-fly optimizacija (ako je URL sa Cloudinary)
    const cdn = (url, w = 0) => {
        if (!url) return url;
        const i = url.indexOf("/upload/");
        if (i === -1) return url;
        const trans = `f_auto,q_auto${w ? `,w_${w}` : ""}`;
        return url.slice(0, i + 8) + trans + "/" + url.slice(i + 8);
    };

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const favoriteIds =
                    JSON.parse(localStorage.getItem(`favorites_${userId}`)) || [];
                if (!favoriteIds.length) {
                    setFavoriteRecipes([]);
                    return;
                }

                const results = await Promise.all(
                    favoriteIds.map((id) =>
                        axios
                            .get(`/api/recipes/${id}`, {
                                validateStatus: (status) => status < 500,
                            })
                            .then((res) => ({ id, status: res.status, data: res.data }))
                            .catch(() => ({ id, status: 0, data: null }))
                    )
                );

                const validResults = results
                    .filter((res) => res.status === 200 && res.data)
                    .map((res) => res.data);

                const invalidIds = results
                    .filter((res) => res.status === 404)
                    .map((res) => res.id);

                setFavoriteRecipes(validResults);

                // očisti localStorage od nepostojećih recepata
                if (invalidIds.length > 0) {
                    const updatedFavorites = favoriteIds.filter(
                        (id) => !invalidIds.includes(id)
                    );
                    localStorage.setItem(
                        `favorites_${userId}`,
                        JSON.stringify(updatedFavorites)
                    );
                }
            } catch (e) {
                console.error("Greška pri učitavanju favorita:", e);
                setError("Ne mogu da učitam omiljene recepte.");
            }
        };

        fetchFavorites();
    }, [userId]);

    // filtriranje po search tekstu
    const filteredRecipes = useMemo(() => {
        const s = (search || "").toLowerCase().trim();
        if (!s) return favoriteRecipes;
        return favoriteRecipes.filter((r) =>
            (r.title || "").toLowerCase().includes(s)
        );
    }, [favoriteRecipes, search]);

    const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / recipesPerPage));
    const indexOfLast = currentPage * recipesPerPage;
    const indexOfFirst = indexOfLast - recipesPerPage;
    const currentRecipes = filteredRecipes.slice(indexOfFirst, indexOfLast);

    const handlePrev = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleNext = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (error) {
        return <div className="p-6 text-center text-red-600">{error}</div>;
    }

    if (!favoriteRecipes.length) {
        return (
            <div className="p-6 text-center text-gray-500">
                Nemaš sačuvanih favorita.
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-center text-emerald-600 mb-6">
                Moji Favoriti
            </h1>

            <input
                type="text"
                placeholder="Pretraži recepte..."
                value={search}
                onChange={(e) => {
                    setCurrentPage(1);
                    setSearch(e.target.value);
                }}
                className="w-full max-w-[300px] mx-auto mb-6 p-3 rounded-xl border bg-transparent text-gray-100 border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 block"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {currentRecipes.map((recipe) => (
                    <div
                        key={recipe._id}
                        className="bg-white rounded-xl shadow hover:shadow-lg flex flex-col justify-between overflow-hidden hover:-translate-y-1 transition transform"
                    >
                        <Link to={`/recept/${recipe._id}`} className="block">
                            {recipe.coverImage?.url && (
                                <img
                                    src={cdn(recipe.coverImage.url, 640)}
                                    alt={recipe.title}
                                    className="w-full h-32 sm:h-36 object-cover"
                                    loading="lazy"
                                />
                            )}
                            <div className="p-2">
                                <h2 className="text-sm font-bold text-gray-800 line-clamp-1">
                                    {recipe.title}
                                </h2>
                                {recipe.description && (
                                    <p className="text-gray-600 mt-1 text-xs line-clamp-2">
                                        {recipe.description}
                                    </p>
                                )}
                                <span className="bg-emerald-100 text-emerald-600 rounded-full px-2 py-1 text-[10px] mt-1 inline-block">
                                    {recipe.category}
                                </span>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Paginacija sa brojevima i strelicama */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-1 items-center">
                    <button
                        onClick={handlePrev}
                        disabled={currentPage === 1}
                        className={`px-2 py-1 rounded-full text-[10px] ${currentPage === 1
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                            }`}
                    >
                        ←
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                        <button
                            key={num}
                            onClick={() => handlePageClick(num)}
                            className={`px-2 py-1 rounded-full text-[10px] ${currentPage === num
                                    ? "bg-emerald-500 text-white"
                                    : "bg-gray-300 text-gray-600 hover:bg-gray-400"
                                }`}
                        >
                            {num}
                        </button>
                    ))}

                    <button
                        onClick={handleNext}
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

export default MyFavorites;
