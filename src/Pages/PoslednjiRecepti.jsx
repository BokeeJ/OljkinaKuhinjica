import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import { IoTimeOutline } from "react-icons/io5";
import { API_BASE_URL } from "../config";

function PoslednjiRecepti() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLast = async () => {
            try {
                // Backend već vraća 6; ako dodaš podršku za ?limit=, koristi: /latest?limit=6
                const res = await fetch(`${API_BASE_URL}/api/recipes/latest`);
                if (!res.ok) return console.error("Greška sa servera:", res.statusText);
                const data = await res.json();
                setRecipes(data || []);
            } catch (error) {
                console.error("Greška pri preuzimanju:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLast();
    }, []);

    if (loading) {
        return (
            <div className="w-full flex justify-center items-center py-10">
                <div className="text-white">Učitavam recepte...</div>
            </div>
        );
    }

    const Card = ({ recipe }) => (
        <div
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
                    {recipe.preparationTime || 'N/A'}
                </p>
                <div className="mt-auto pt-2">
                    <button
                        className="w-full flex items-center justify-center text-gray-800 text-xs font-semibold rounded-full bg-orange-200 hover:bg-orange-300 py-1 px-3 transform hover:scale-105 transition cursor-pointer"
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
    );

    return (
        <div className="w-full max-w-7xl mx-auto px-4">
            {/* MOBILE: do md => 6 kom */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 gap-4 justify-center md:hidden">
                {recipes.slice(0, 6).map((r) => <Card key={r._id} recipe={r} />)}
            </div>

            {/* DESKTOP: od md naviše => 5 kom */}
            <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 justify-center">
                {recipes.slice(0, 5).map((r) => <Card key={r._id} recipe={r} />)}
            </div>
        </div>
    );
}

export default PoslednjiRecepti;
