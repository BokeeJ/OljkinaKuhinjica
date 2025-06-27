import React, { useState } from 'react';
import axios from 'axios';

function AddRecipe({ onRecipeAdded }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('slano');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) return alert("Molimo dodajte sliku!");

        const formData = new FormData();
        formData.append('slika', image);

        try {
            setLoading(true);

            // 1. Upload slike na Cloudinary
            const uploadRes = await axios.post('https://kuhinjica-backend-1.onrender.com/api/upload', formData);
            const { url, public_id } = uploadRes.data;

            const recipe = {
                title,
                description,
                category,
                imageUrl: url,
                imagePublicId: public_id
            };

            console.log('📦 Šaljem recept:', recipe);

            // 2. Slanje recepta u bazu
            await axios.post('https://kuhinjica-backend-1.onrender.com/api/recipes', recipe, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                withCredentials: true
            });

            alert('Recept dodat ✅');

            // Resetuj formu
            setTitle('');
            setDescription('');
            setCategory('slano');
            setImage(null);
            onRecipeAdded && onRecipeAdded();
        } catch (err) {
            console.error('❌ Greška pri dodavanju recepta:', err.response?.data || err.message);
            alert('Greška pri dodavanju recepta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md p-4 bg-white rounded shadow">
            <h2 className="text-xl font-bold">Dodaj Recept</h2>

            <input
                type="text"
                placeholder="Naslov"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="border p-2 rounded"
            />

            <textarea
                placeholder="Opis"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="border p-2 rounded"
            />

            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="border p-2 rounded"
            >
                <option value="slano">Slano</option>
                <option value="slatko">Slatko</option>
            </select>

            <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                required
                className="border p-2 rounded"
            />

            <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
                {loading ? 'Dodavanje...' : 'Dodaj Recept'}
            </button>
        </form>
    );
}

export default AddRecipe;
