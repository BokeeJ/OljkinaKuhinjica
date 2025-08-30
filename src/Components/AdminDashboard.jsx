import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddRecipe from './AddRecipe';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function AdminDashboard() {
    const [recipes, setRecipes] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const fetchRecipes = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/recipes`);
            setRecipes(res.data);
        } catch (err) {
            console.error('❌ Greška pri učitavanju recepata:', err.message);
        }
    };

    const handleDelete = async (id) => {
        const confirm = window.confirm('Da li si siguran da želiš da obrišeš recept?');
        if (!confirm) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/recipes/${id}`);
            setRecipes((prev) => prev.filter((r) => r._id !== id));
        } catch (err) {
            console.error('❌ Greška pri brisanju:', err.message);
            alert('Greška pri brisanju');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/login');
    };

    const handleRecipeAdded = () => {
        fetchRecipes();
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    const filteredRecipes = recipes.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center max-w-4xl mx-auto mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-emerald-700">Admin Panel - Recepti</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                >
                    Logout
                </button>
            </div>

            <div className="max-w-4xl mx-auto">
                <AddRecipe onRecipeAdded={handleRecipeAdded} />

                <input
                    type="text"
                    placeholder="Pretraži recepte po naslovu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full p-3 border text-gray-800 border-gray-300 rounded-lg mb-6 shadow-sm"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes.map((recipe) => (
                        <div
                            key={recipe._id}
                            className="bg-white border rounded-xl p-4 shadow hover:shadow-xl flex flex-col justify-between transition-transform hover:-translate-y-1"
                        >
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">{recipe.title}</h2>

                                {recipe.coverImage?.url && (
                                    <img
                                        src={recipe.coverImage.url}
                                        alt={recipe.title}
                                        className="w-full h-44 object-cover rounded mt-3"
                                    />
                                )}

                                <p className="text-sm text-gray-600 mt-2">⏱️ Priprema: {recipe.preparationTime || 'N/A'}</p>
                                <p className="text-sm text-gray-600">📂 {recipe.category} / {recipe.subcategory || 'Bez podkategorije'}</p>
                            </div>

                            <div className="mt-4 flex justify-between gap-2">
                                <button
                                    onClick={() => handleDelete(recipe._id)}
                                    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 text-sm"
                                >
                                    Obriši
                                </button>
                                <Link
                                    to={`/izmeni-recept/${recipe._id}`}
                                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                                >
                                    Izmeni
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;