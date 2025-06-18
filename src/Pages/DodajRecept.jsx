import React, { useState } from 'react';
import axios from 'axios';

function DodajRecept() {
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'slano',
        image: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setForm(prev => ({ ...prev, image: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('category', form.category);
        formData.append('image', form.image);

        try {
            const res = await axios.post('http://localhost:5000/api/recipes', formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Recept dodat!');
            console.log(res.data);
        } catch (err) {
            console.error(err);
            alert('Greška pri dodavanju');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3 w-full max-w-md mx-auto">
            <input name="title" type="text" placeholder="Naslov" value={form.title} onChange={handleChange} required />
            <textarea name="description" placeholder="Opis recepta" value={form.description} onChange={handleChange} required />
            <select name="category" value={form.category} onChange={handleChange}>
                <option value="slano">Slano</option>
                <option value="slatko">Slatko</option>
            </select>
            <input type="file" accept="image/*" onChange={handleImageChange} required />
            <button type="submit" className="bg-green-500 text-white py-2">Dodaj recept</button>
        </form>
    );
}

export default DodajRecept;
