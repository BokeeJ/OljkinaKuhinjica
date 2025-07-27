import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import { IoTimeOutline } from "react-icons/io5";
import { API_BASE_URL } from "../config";

function PoslednjiRecepti({ className = '' }) {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLastFive = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/recipes/latest`);
                if (!res.ok) {
                    console.error("Greška sa servera:", res.statusText);
                    return;
                }
                const data = await res.json();
                setRecipes(data);
            } catch (error) {
                console.error("Greška pri preuzimanju:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLastFive();
    }, []);

    if (loading) {
        return (
            <div className="w-full flex justify-center items-center py-10">
                <div className="text-white">Učitavam recepte...</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {recipes.map((recipe) => (
                    <div
                        key={recipe._id}
                        onClick={() => navigate(`/recept/${recipe._id}`)}
                        className="cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-300 bg-white flex flex-col"
                    >
                        <img
                            src={recipe.coverImage?.url || "/fallback.jpg"}
                            alt={recipe.title}
                            className="w-full h-28 object-cover"
                        />
                        <div className="p-3 flex flex-col justify-between flex-1">
                            <h3 className="text-sm sm:text-xs font-semibold text-gray-800 hover:text-orange-500 transition-colors leading-snug">
                                {recipe.title}
                            </h3>

                            <p className="flex gap-2 items-center text-xs text-gray-500 mt-1">
                                <IoTimeOutline size={16} color="orange" />
                                {recipe.preparationTime || 'N/A'} min
                            </p>
                            <div className="mt-auto pt-2">
                                <button
                                    className="w-full flex items-center justify-center text-white text-xs font-semibold rounded-full bg-orange-500 hover:bg-orange-600 py-1 px-3 transform hover:scale-105 transition"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/recept/${recipe._id}`);
                                    }}
                                >
                                    Pogledaj <FaArrowRight className="ml-1" size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PoslednjiRecepti;
