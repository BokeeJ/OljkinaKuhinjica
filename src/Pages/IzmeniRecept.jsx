import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

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
// obrnuta mapa: label -> slug (da prebacimo vrednost iz baze u slug za <select>)
const LABEL_TO_SLUG = Object.fromEntries(Object.entries(SUBCATEGORY_MAP).map(([slug, label]) => [label, slug]));

function IzmeniRecept() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        category: 'slano',
        subcategory: '',            // ČUVA SLUG u formi
        preparationTime: '',
        ingredients: '',
        instructions: '',
        note: '',
    });
    const [coverImage, setCoverImage] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [existingCover, setExistingCover] = useState(null);
    const [existingGallery, setExistingGallery] = useState([]);

    // liste za select
    const slatko = useMemo(() => ([
        ['kolaci', 'Kolači'],
        ['torte', 'Torte'],
    ]), []);
    const slano = useMemo(() => ([
        ['dorucak', 'Doručak'],
        ['rucak', 'Ručak'],
        ['vecera', 'Večera'],
        ['pica', 'Pica'],
        ['brza-jela', 'Brza jela'],
        ['salate', 'Salate'],
        ['hladna-jela', 'Hladna jela'],
        ['uzina', 'Užina'],
        ['supe-i-corbe', 'Supe i čorbe'],
        ['pecivo', 'Pecivo'],
    ]), []);

    useEffect(() => {
        (async () => {
            const res = await axios.get(`${API_BASE_URL}/api/recipes/${id}`);
            const data = res.data;

            // konvertuj label iz baze u slug za select
            const subLabel = data.subcategory || '';
            const subSlug = LABEL_TO_SLUG[subLabel] || '';

            setForm({
                title: data.title || '',
                category: (data.category || 'slano').toLowerCase(),
                subcategory: subSlug, // SLUG u formi
                preparationTime: data.preparationTime || '',
                ingredients: (data.ingredients || []).join('\n'),
                instructions: data.instructions || '',
                note: data.note || '',
            });
            setExistingCover(data.coverImage || null);
            setExistingGallery(data.gallery || []);
        })();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.subcategory) {
            alert('Izaberi podkategoriju.');
            return;
        }

        // mapiraj slug -> label pre slanja
        const subLabel = SUBCATEGORY_MAP[form.subcategory];
        if (!subLabel) {
            alert('Nepoznata podkategorija.');
            return;
        }

        const data = new FormData();
        data.append('title', form.title.trim());
        data.append('category', String(form.category || '').toLowerCase()); // 'slano' | 'slatko'
        data.append('subcategory', subLabel); // TAČAN label iz enuma
        data.append('preparationTime', form.preparationTime);
        data.append('instructions', form.instructions);
        data.append('note', form.note || '');

        // sastojci – po jedan u redu
        const ingredientsArray = form.ingredients
            .split('\n')
            .map(item => item.trim())
            .filter(Boolean);
        ingredientsArray.forEach(i => data.append('ingredients', i));

        // fajlovi uslovno
        if (coverImage instanceof File) data.append('coverImage', coverImage);
        (gallery || []).forEach(g => data.append('gallery', g));

        try {
            const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
            if (!token) { alert('Token nije pronađen. Prijavite se ponovo.'); return; }

            await axios.put(`${API_BASE_URL}/api/recipes/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`, // NE postavljaj Content-Type ručno
                }
            });

            alert('Recept uspešno izmenjen!');
            navigate('/admin');
        } catch (err) {
            console.log('Update error:', err?.response?.data || err.message);
            alert(err?.response?.data?.error || 'Greška pri izmeni recepta.');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md mt-8 flex flex-col gap-4"
        >
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-emerald-700">Izmena recepta</h2>
                <button onClick={() => navigate('/admin')} type="button" className="text-sm text-blue-600 underline">
                    ⭠ Nazad
                </button>
            </div>

            <input name="title" type="text" placeholder="Naslov" value={form.title} onChange={handleChange} className="border p-2 rounded" required />

            <label className="font-medium">Kategorija</label>
            <select name="category" value={form.category} onChange={handleChange} className="border p-2 rounded">
                <option value="slano">Slano</option>
                <option value="slatko">Slatko</option>
            </select>

            <label className="font-medium">Podkategorija</label>
            {/* VREDNOSTI SU SLUG-OVI */}
            <select name="subcategory" value={form.subcategory} onChange={handleChange} className="border p-2 rounded" required>
                <option value="">-- Izaberi podkategoriju --</option>
                <optgroup label="Slatko">
                    {slatko.map(([slug, label]) => <option key={slug} value={slug}>{label}</option>)}
                </optgroup>
                <optgroup label="Slano">
                    {slano.map(([slug, label]) => <option key={slug} value={slug}>{label}</option>)}
                </optgroup>
            </select>

            <input name="preparationTime" type="text" placeholder="Vreme pripreme (npr. 45 minuta)" value={form.preparationTime} onChange={handleChange} className="border p-2 rounded" />

            <textarea name="instructions" placeholder="Uputstvo za pripremu" value={form.instructions} onChange={handleChange} className="border p-2 rounded h-32" required />

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
                                {item.type === 'video' || /video/.test(item.url)
                                    ? <video controls src={item.url} className="w-full h-24 object-cover rounded" />
                                    : <img src={item.url} alt="Galerija" className="w-full h-24 object-cover rounded" />
                                }
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
