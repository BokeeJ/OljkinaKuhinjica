import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";

function PoslednjiRecepti() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLastFive = async () => {
            try {
                const res = await fetch("http://localhost:5050/api/recipes/latest");
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
                <div className="text-gray-600">Učitavam recepte...</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto p-4">
            <h2 className="text-2xl font-bold text-center text-gray-800 my-6">
                Najnoviji recepti
            </h2>

            <div className="
                grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-3
            ">
                {recipes.map((recipe) => (
                    <div
                        key={recipe._id}
                        onClick={() => navigate(`/recept/${recipe._id}`)}
                        className="
                            cursor-pointer rounded-lg overflow-hidden 
                            shadow-md hover:shadow-xl hover:scale-105 
                            transform transition-all duration-300 bg-white
                        "
                    >
                        <img
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            className="w-full h-24 object-cover"
                        />
                        <div className="p-2 flex flex-col justify-between">
                            <h3 className="text-sm font-semibold text-gray-800 hover:text-orange-500 transition-colors">
                                {recipe.title}
                            </h3>
                            <p className="text-gray-600 text-[12px] mt-1">
                                {recipe.description.length > 80
                                    ? recipe.description.slice(0, 80) + "..."
                                    : recipe.description}
                            </p>
                            <button
                                className="
                                    mt-2 flex items-center justify-center 
                                    text-white text-[12px] font-bold rounded-full 
                                    bg-orange-500 hover:bg-orange-600 
                                    py-1 px-3
                                    transform hover:scale-105 transition
                                "
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/recept/${recipe._id}`);
                                }}
                            >
                                Pogledaj <FaArrowRight className="ml-1" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PoslednjiRecepti;
