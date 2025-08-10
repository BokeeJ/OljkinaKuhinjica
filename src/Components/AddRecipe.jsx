import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config.js';

// slug -> label (tačno kao u Mongoose enumu)
const SUBCATEGORY_MAP = {
    'kolaci': 'Kolaci',
    'torte': 'Torte',
    'rucak': 'Rucak',
    'dorucak': 'Dorucak',
    'vecera': 'Vecera',
    'uzina': 'Uzina',
    'pica': 'Pica',
    'salate': 'Salate',
    'hladna-jela': 'Hladna jela',
    'brza-jela': 'Brza jela',
    'supe-i-corbe': 'Supe i čorbe',
    'pecivo': 'Pecivo',
};

function AddRecipe() {
    const [form, setForm] = useState({
        title: '',
        category: 'slano',
        subcategory: '',         // čuva slug, npr. "supe-i-corbe"
        preparationTime: '',
        ingredients: '',
        instructions: '',
        note: '',
        coverImage: null,
        gallery: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCoverImageChange = (e) => {
        setForm(prev => ({ ...prev, coverImage: e.target.files[0] }));
    };

    const handleGalleryChange = (e) => {
        setForm(prev => ({ ...prev, gallery: Array.from(e.target.files) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.coverImage) {
            alert('Molimo dodajte naslovnu sliku!');
            return;
        }
        if (!form.subcategory) {
            alert('Izaberite podkategoriju.');
            return;
        }

        // mapiraj slug -> label za backend
        const subLabel = SUBCATEGORY_MAP[form.subcategory];
        if (!subLabel) {
            alert('Nepoznata podkategorija.');
            return;
        }

        const formData = new FormData();
        formData.append('title', form.title.trim());
        formData.append('category', String(form.category || '').toLowerCase()); // 'slano' | 'slatko'
        formData.append('subcategory', subLabel); // TAČNO ime iz enuma
        formData.append('preparationTime', form.preparationTime);
        formData.append('instructions', form.instructions);
        formData.append('note', form.note || '');
        formData.append('coverImage', form.coverImage);

        // sastojci – po jedan u redu
        const ingredientsArray = form.ingredients
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean);
        ingredientsArray.forEach((ing) => formData.append('ingredients', ing));

        // galerija
        form.gallery.forEach((file) => formData.append('gallery', file));

        try {
            const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
            if (!token) {
                alert('Token nije pronađen. Prijavite se ponovo.');
                return;
            }

            const res = await axios.post(`${API_BASE_URL}/api/recipes`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            alert('Recept dodat!');
            console.log(res.data);

            // opcionalno: reset forme
            setForm({
                title: '',
                category: 'slano',
                subcategory: '',
                preparationTime: '',
                ingredients: '',
                instructions: '',
                note: '',
                coverImage: null,
                gallery: []
            });

        } catch (err) {
            console.error('❌ Greska:', err?.response?.data || err.message || err);
            alert(err?.response?.data?.error || err.message || 'Greška pri dodavanju recepta');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3 w-full max-w-md mx-auto">
            <input
                name="title"
                type="text"
                placeholder="Naslov"
                value={form.title}
                onChange={handleChange}
                required
            />

            <label className='text-orange-300 font-bold'>Kategorija:</label>
            <select name="category" value={form.category} onChange={handleChange}>
                <option value="slano">Slano</option>
                <option value="slatko">Slatko</option>
            </select>

            <label className='text-orange-300 font-bold'>Podkategorija:</label>
            {/* VREDNOSTI SU SLUG-OVI */}
            <select name="subcategory" value={form.subcategory} onChange={handleChange} required>
                <option value="">Izaberi podkategoriju...</option>
                <optgroup label="Slatko">
                    <option value="kolaci">Kolači</option>
                    <option value="torte">Torte</option>
                </optgroup>
                <optgroup label="Slano">
                    <option value="dorucak">Doručak</option>
                    <option value="rucak">Ručak</option>
                    <option value="vecera">Večera</option>
                    <option value="pica">Pica</option>
                    <option value="brza-jela">Brza jela</option>
                    <option value="salate">Salate</option>
                    <option value="hladna-jela">Hladna jela</option>
                    <option value="uzina">Užina</option>
                    <option value="supe-i-corbe">Supe i čorbe</option>
                    <option value="pecivo">Pecivo</option>
                </optgroup>
            </select>

            <h6 className='text-orange-300 font-bold'>Cover slika:</h6>
            <input type="file" accept="image/*" onChange={handleCoverImageChange} required />

            <h6 className='text-orange-300 font-bold'>Galerija (slike/video):</h6>
            <input type="file" accept="image/*,video/*" multiple onChange={handleGalleryChange} />

            <input
                name="preparationTime"
                type="text"
                placeholder="Vreme pripreme (npr. 45 minuta)"
                value={form.preparationTime}
                onChange={handleChange}
            />

            <textarea
                name="instructions"
                placeholder="Uputstvo za pripremu"
                value={form.instructions}
                onChange={handleChange}
                required
            />

            <label className='text-orange-300 font-bold'>Sastojci (po jedan u redu):</label>
            <textarea
                name="ingredients"
                placeholder={`npr.\n3 jaja\n200g brašna\n1 čaša jogurta`}
                value={form.ingredients}
                onChange={handleChange}
                rows={6}
                required
            />

            <label className='text-orange-300 font-bold'>Napomena (opciono):</label>
            <textarea
                name="note"
                placeholder="Npr. koristila sam čokoladu sa 70% kakaa"
                value={form.note}
                onChange={handleChange}
                rows={3}
            />

            <button type="submit" className="bg-green-500 text-white py-2">
                Dodaj recept
            </button>
        </form>
    );
}

export default AddRecipe;
