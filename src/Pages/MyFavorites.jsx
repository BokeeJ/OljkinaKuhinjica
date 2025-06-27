import React, { useEffect, useState } from "react";
import axios from "axios";

function MyFavorites() {
    const userId = "user123";
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            const favoriteIds = JSON.parse(localStorage.getItem(`favorites_${userId}`)) || [];
            if (!favoriteIds.length) return;

            const results = await Promise.all(
                favoriteIds.map((id) =>
                    axios.get(`https://kuhinjica-backend-1.onrender.com/api/recipes/${id}`, {
                        validateStatus: (status) => status < 500,
                    }).then((res) => ({ id, status: res.status, data: res.data }))
                ))

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

    if (error) {
        return (
            <div className="p-6 text-center text-red-600">
                {error}
            </div>
        );
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
            <h1 className="text-3xl font-bold text-center text-emerald-600">Moji Favoriti</h1>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-8">
                {favoriteRecipes.map((recipe) => (
                    <div
                        key={recipe._id}
                        className="bg-white rounded-xl shadow hover:shadow-lg flex flex-col justify-between overflow-hidden hover:-translate-y-1 transition transform"
                    >
                        <div>
                            {recipe.imageUrl && (
                                <img
                                    src={recipe.imageUrl}
                                    alt={recipe.title}
                                    className="w-full h-28 sm:h-32 object-cover"
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
        </div>
    );
}

export default MyFavorites;
