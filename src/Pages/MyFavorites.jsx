import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

function MyFavorites() {
    const userId = "user123";
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const recipesPerPage = 8;
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchFavorites = async () => {
            const favoriteIds = JSON.parse(localStorage.getItem(`favorites_${userId}`)) || [];
            if (!favoriteIds.length) return;

            const results = await Promise.all(
                favoriteIds.map((id) =>
                    axios
                        .get(`${API_BASE_URL}/api/recipes/${id}`, {
                            validateStatus: (status) => status < 500,
                        })
                        .then((res) => ({ id, status: res.status, data: res.data }))
                )
            );

            const validResults = results.filter((res) => res.status === 200).map((res) => res.data);
            const invalidIds = results.filter((res) => res.status === 404).map((res) => res.id);

            setFavoriteRecipes(validResults);

            if (invalidIds.length > 0) {
                const updatedFavorites = favoriteIds.filter((id) => !invalidIds.includes(id));
                localStorage.setItem(`favorites_${userId}`, JSON.stringify(updatedFavorites));
            }
        };

        fetchFavorites();
    }, [userId]);

    // filtriranje po search tekstu
    const filteredRecipes = favoriteRecipes.filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
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
        return <div className="p-6 text-center text-gray-500">Nemaš sačuvanih favorita.</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-center text-emerald-600 mb-6">Moji Favoriti</h1>

            <input
                type="text"
                placeholder="Pretraži recepte..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-[300px] mx-auto mb-6 p-3 rounded-xl border bg-transparent text-gray-100 border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 block"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {currentRecipes.map((recipe) => (
                    <div
                        key={recipe._id}
                        className="bg-white rounded-xl shadow hover:shadow-lg flex flex-col justify-between overflow-hidden hover:-translate-y-1 transition transform"
                    >
                        <div>
                            {recipe.coverImage?.url && (
                                <img
                                    src={recipe.coverImage.url}
                                    alt={recipe.title}
                                    className="w-full h-32 sm:h-36 object-cover"
                                />
                            )}
                            <div className="p-2">
                                <h2 className="text-sm font-bold text-gray-800 line-clamp-1">{recipe.title}</h2>
                                <p className="text-gray-600 mt-1 text-xs line-clamp-2">{recipe.description}</p>
                                <span className="bg-emerald-100 text-emerald-600 rounded-full px-2 py-1 text-[10px] mt-1 inline-block">
                                    {recipe.category}
                                </span>
                            </div>
                        </div>
                        <div className="p-2 flex justify-end">
                            <a
                                href={`/recept/${recipe._id}`}
                                className="bg-emerald-500 text-white rounded-full px-2 py-1 text-[10px] hover:bg-emerald-600"
                            >
                                detalji →
                            </a>
                        </div>
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

                    {[...Array(totalPages).keys()].map((num) => (
                        <button
                            key={num}
                            onClick={() => handlePageClick(num + 1)}
                            className={`px-2 py-1 rounded-full text-[10px] ${currentPage === num + 1
                                ? "bg-emerald-500 text-white"
                                : "bg-gray-300 text-gray-600 hover:bg-gray-400"
                                }`}
                        >
                            {num + 1}
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
