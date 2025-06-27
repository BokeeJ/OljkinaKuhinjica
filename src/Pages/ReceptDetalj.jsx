import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ReceptDetalji() {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(`https://kuhinjica-backend-1.onrender.com/api/recipes/${id}`);
            setRecipe(res.data);
        };
        fetchData();
    }, [id]);

    if (!recipe) return <div className="p-6 text-center">Učitavam...</div>;

    return (
        <div className="min-h-screen p-6 bg-gradient-to-b flex justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full">
                {recipe.imageUrl && (
                    <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-64 object-cover rounded-xl"
                    />
                )}
                <h1 className="text-3xl font-bold mt-4 text-gray-800">{recipe.title}</h1>
                <p className="text-gray-600 mt-2">{recipe.description}</p>
                <p className="italic text-sm mt-1 text-gray-500">{recipe.category}</p>
                <p className="text-gray-400 text-xs mt-2">
                    Dodato: {new Date(recipe.createdAt).toLocaleString('sr-RS')}
                </p>
                <Link
                    to="/SviRecepti"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full mt-4 inline-block px-4 py-2"
                >
                    ← Nazad na listu
                </Link>
            </div>
        </div>
    );
}

export default ReceptDetalji;
