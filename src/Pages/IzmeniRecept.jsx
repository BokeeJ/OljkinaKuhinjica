import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function IzmeniRecept() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'slano',
        subcategory: '',
        preparationTime: '',
        ingredients: [''],
        instructions: '',
    });

    useEffect(() => {
        axios.get(`https://kuhinjica-backend-1.onrender.com/api/recipes/${id}`)
            .then(res => {
                const data = res.data;
                setForm({
                    title: data.title || '',
                    description: data.description || '',
                    category: data.category || 'slano',
                    subcategory: data.subcategory || '',
                    preparationTime: data.preparationTime || '',
                    ingredients: data.ingredients || [''],
                    instructions: data.instructions || '',
                });
            });
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleIngredientChange = (index, value) => {
        const updated = [...form.ingredients];
        updated[index] = value;
        setForm(prev => ({ ...prev, ingredients: updated }));
    };

    const addIngredient = () => {
        setForm(prev => ({ ...prev, ingredients: [...prev.ingredients, ''] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`https://kuhinjica-backend-1.onrender.com/api/recipes/${id}`, form, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('Recept izmenjen!');
            navigate('/admin');
        } catch (err) {
            console.error(err);
            alert('Greška pri izmeni recepta');
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
            <input name="subcategory" type="text" placeholder="Podkategorija (npr. Torte, Doručak...)" value={form.subcategory} onChange={handleChange} />
            <input name="preparationTime" type="text" placeholder="Vreme pripreme (npr. 45 minuta)" value={form.preparationTime} onChange={handleChange} />
            <textarea name="instructions" placeholder="Uputstvo za pripremu" value={form.instructions} onChange={handleChange} required />

            <div>
                <label>Sastojci:</label>
                {form.ingredients.map((ing, idx) => (
                    <input
                        key={idx}
                        type="text"
                        value={ing}
                        onChange={(e) => handleIngredientChange(idx, e.target.value)}
                        placeholder={`Sastojak ${idx + 1}`}
                        className="mb-1"
                    />
                ))}
                <button type="button" onClick={addIngredient} className="text-blue-500">+ Dodaj sastojak</button>
            </div>

            <button type="submit" className="bg-blue-500 text-white py-2">Izmeni recept</button>
        </form>
    );
}

export default IzmeniRecept;
