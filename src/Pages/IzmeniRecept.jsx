import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function IzmeniRecept() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        category: 'slano',
        subcategory: '',
        preparationTime: '',
        ingredients: '',
        instructions: '',
        note: '',
    });
    const [coverImage, setCoverImage] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [existingCover, setExistingCover] = useState(null);
    const [existingGallery, setExistingGallery] = useState([]);

    const podkategorije = [
        'Torte', 'Kolači', 'Pite', 'Doručak', 'Hleb', 'Ručak', 'Predjela', 'Čorbe', 'Salate', 'Testenine'
    ];

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/recipes/${id}`)
            .then(res => {
                const data = res.data;
                setForm({
                    title: data.title || '',
                    category: data.category || 'slano',
                    subcategory: data.subcategory || '',
                    preparationTime: data.preparationTime || '',
                    ingredients: (data.ingredients || []).join('\n'),
                    instructions: data.instructions || '',
                    note: data.note || '',
                });
                setExistingCover(data.coverImage);
                setExistingGallery(data.gallery || []);
            });
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', form.title);
        data.append('category', form.category);
        data.append('subcategory', form.subcategory);
        data.append('preparationTime', form.preparationTime);
        data.append('instructions', form.instructions);
        data.append('note', form.note);

        const ingredientsArray = form.ingredients
            .split('\n')
            .map(item => item.trim())
            .filter(item => item);

        ingredientsArray.forEach(i => data.append('ingredients', i));

        if (coverImage) data.append('coverImage', coverImage);
        gallery.forEach(g => data.append('gallery', g));

        try {
            console.log("ID koji šaljem:", id); // ispravno
            await axios.put(`${API_BASE_URL}/api/recipes/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Recept uspešno izmenjen!');
            navigate('/admin');
        } catch (err) {
            console.error(err);
            alert('Greška pri izmeni recepta.');
        }
    };


    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md mt-8 flex flex-col gap-4"
        >
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-emerald-700">Izmena recepta</h2>
                <button
                    onClick={() => navigate('/admin')}
                    type="button"
                    className="text-sm text-blue-600 underline"
                >
                    ⭠ Nazad
                </button>
            </div>

            <input name="title" type="text" placeholder="Naslov" value={form.title} onChange={handleChange} className="border p-2 rounded" required />
            <select name="category" value={form.category} onChange={handleChange} className="border p-2 rounded">
                <option value="slano">Slano</option>
                <option value="slatko">Slatko</option>
            </select>
            <select
                name="subcategory"
                value={form.subcategory}
                onChange={handleChange}
                className="border p-2 rounded"
            >
                <option value="">-- Izaberi podkategoriju --</option>
                {podkategorije.map((pk, i) => (
                    <option key={i} value={pk}>{pk}</option>
                ))}
            </select>
            <input name="preparationTime" type="text" placeholder="Vreme pripreme (npr. 45 minuta)" value={form.preparationTime} onChange={handleChange} className="border p-2 rounded" />

            <textarea
                name="instructions"
                placeholder="Uputstvo za pripremu"
                value={form.instructions}
                onChange={handleChange}
                className="border p-2 rounded h-32"
                required
            />

            <div>
                <label className="block font-medium mb-1">Sastojci (po jedan u red):</label>
                <textarea
                    name="ingredients"
                    value={form.ingredients}
                    onChange={handleChange}
                    className="border p-2 rounded w-full h-32"
                    placeholder="Sastojak 1\nSastojak 2\nSastojak 3"
                />
            </div>
            <div>
                <label className="block font-medium mb-1">Napomena (opciono):</label>
                <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="Npr. koristila sam čokoladu sa 70% kakaa"
                    rows={3}
                />
            </div>

            <div>
                <label className="block mb-1">Naslovna slika:</label>
                {existingCover?.url && (
                    <img src={existingCover.url} alt="Postojeća slika" className="w-32 h-32 object-cover rounded mb-2" />
                )}
                <input type="file" onChange={(e) => setCoverImage(e.target.files[0])} accept="image/*" className="mb-2" />
            </div>

            <div>
                <label className="block mb-1">Galerija (slike ili video):</label>
                {existingGallery.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        {existingGallery.map((item, idx) => (
                            <div key={idx} className="relative">
                                {item.url.includes('video') ? (
                                    <video controls src={item.url} className="w-full h-24 object-cover rounded" />
                                ) : (
                                    <img src={item.url} alt="Galerija" className="w-full h-24 object-cover rounded" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <input type="file" multiple onChange={(e) => setGallery(Array.from(e.target.files))} accept="image/*,video/*" />
            </div>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4">
                Sačuvaj izmene
            </button>
        </form>
    );
}

export default IzmeniRecept;
