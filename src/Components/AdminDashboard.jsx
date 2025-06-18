import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddRecipe from './AddRecipe';

function AdminDashboard() {
    const [recipes, setRecipes] = useState([]);
    const handleDelete = async (id) => {
        if (!window.confirm('Da li si siguran da želiš da obrišeš recept?')) return;
        try {
            await axios.delete(`http://localhost:5050/api/recipes/${id}`);
            setRecipes((prev) => prev.filter((r) => r._id !== id));
        } catch (err) {
            console.error('❌ Greška pri brisanju:', err.message);
            alert('Greška pri brisanju');
        }
    };

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const res = await axios.get('http://localhost:5050/api/recipes');
                setRecipes(res.data);
            } catch (err) {
                console.error('❌ Greška pri učitavanju recepata:', err.message);
            }
        };

        fetchRecipes();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <AddRecipe onRecipeAdded={() => window.location.reload()} />

            {recipes.map((recipe) => (
                <li key={recipe._id} className="p-4 border rounded">
                    <h2 className="text-xl font-semibold">{recipe.title}</h2>
                    <p>{recipe.description}</p>
                    {recipe.imageUrl && (
                        <img src={recipe.imageUrl} alt={recipe.title} className="w-40 mt-2" />
                    )}
                    <button
                        onClick={() => handleDelete(recipe._id)}
                        className="mt-2 bg-red-600 text-white px-3 py-1 rounded"
                    >
                        Obriši
                    </button>
                </li>
            ))}

        </div>
    );
}

export default AdminDashboard;
