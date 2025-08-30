import React, { useMemo, useState } from 'react';
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

// podkategorije po kategoriji za lepši UX
const SUBS_BY_CAT = {
    slatko: ['kolaci', 'torte'],
    slano: ['dorucak', 'rucak', 'vecera', 'pica', 'brza-jela', 'salate', 'hladna-jela', 'uzina', 'supe-i-corbe', 'pecivo'],
};

const inputBase =
    "w-full rounded-xl border border-gray-300 bg-white/90 text-gray-900 placeholder:text-gray-400 " +
    "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 px-3 py-2";

const labelBase = "block text-[13px] font-semibold text-gray-700 mb-1";

function AddRecipe() {
    const [form, setForm] = useState({
        title: '',
        category: 'slano',
        subcategory: '', // slug
        preparationTime: '',
        ingredients: '',
        instructions: '',
        note: '',
        coverImage: null,
        gallery: []
    });

    const [appendQuote, setAppendQuote] = useState(false);
    const [quoteText, setQuoteText] = useState('Sve što ti se dešava u životu, dešava se za tvoje najveće dobro.');
    const [coverPreview, setCoverPreview] = useState('');

    const subOptions = useMemo(() => SUBS_BY_CAT[form.category] || [], [form.category]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            // ako se promeni kategorija, a podkategorija više ne pripada toj grupi — resetuj subcategory
            if (name === 'category') {
                const valid = SUBS_BY_CAT[value] || [];
                return { ...prev, category: value, subcategory: valid.includes(prev.subcategory) ? prev.subcategory : '' };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files?.[0];
        setForm(prev => ({ ...prev, coverImage: file || null }));
        setCoverPreview(file ? URL.createObjectURL(file) : '');
    };

    const handleGalleryChange = (e) => {
        setForm(prev => ({ ...prev, gallery: Array.from(e.target.files || []) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            alert('Unesi naslov.');
            return;
        }
        if (!form.coverImage) {
            alert('Molimo dodaj naslovnu sliku.');
            return;
        }
        if (!form.subcategory) {
            alert('Izaberi podkategoriju.');
            return;
        }

        const subLabel = SUBCATEGORY_MAP[form.subcategory];
        if (!subLabel) {
            alert('Nepoznata podkategorija.');
            return;
        }

        // Napomena + (opciona) poslovica, uredno razdvojeno
        let noteFinal = (form.note || '').trim();
        const quote = (quoteText || '').trim();
        if (appendQuote && quote) {
            noteFinal = `${noteFinal ? noteFinal + "\n\n" : ""}— „${quote}”`;
        }

        const formData = new FormData();
        formData.append('title', form.title.trim());
        formData.append('category', String(form.category || '').toLowerCase()); // 'slano' | 'slatko'
        formData.append('subcategory', subLabel); // tačno ime iz enuma
        formData.append('preparationTime', form.preparationTime);
        formData.append('instructions', form.instructions);
        formData.append('note', noteFinal);
        formData.append('coverImage', form.coverImage);

        // sastojci – po jedan u redu
        const ingredientsArray = (form.ingredients || '')
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean);
        ingredientsArray.forEach((ing) => formData.append('ingredients', ing));

        // galerija
        (form.gallery || []).forEach((file) => formData.append('gallery', file));

        try {
            const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
            if (!token) {
                alert('Token nije pronađen. Prijavi se ponovo.');
                return;
            }

            const res = await axios.post(`${API_BASE_URL}/api/recipes`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            alert('Recept dodat!');
            console.log(res.data);

            // reset
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
            setAppendQuote(false);
            setCoverPreview('');

        } catch (err) {
            console.error('❌ Greška:', err?.response?.data || err.message || err);
            alert(err?.response?.data?.error || err.message || 'Greška pri dodavanju recepta');
        }
    };

    // prikaz kako će napomena izgledati nakon slanja
    const notePreview = useMemo(() => {
        const n = (form.note || '').trim();
        const q = (quoteText || '').trim();
        if (appendQuote && q) {
            return `${n ? n + "\n\n" : ""}— „${q}”`;
        }
        return n;
    }, [form.note, appendQuote, quoteText]);

    return (
        <div className="min-h-screen py-8 px-4 bg-gradient-to-b from-white to-gray-100">
            <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl space-y-6">
                <div className="bg-white/80 backdrop-blur border rounded-2xl shadow p-5">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">➕ Dodaj recept</h2>

                    {/* Naslov */}
                    <label className={labelBase} htmlFor="title">Naslov</label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        placeholder="npr. Kolač sa jabukama"
                        value={form.title}
                        onChange={handleChange}
                        required
                        className={inputBase}
                    />

                    {/* Kategorija & Podkategorija */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className={labelBase} htmlFor="category">Kategorija</label>
                            <select
                                id="category"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className={inputBase}
                            >
                                <option value="slano">Slano</option>
                                <option value="slatko">Slatko</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelBase} htmlFor="subcategory">Podkategorija</label>
                            <select
                                id="subcategory"
                                name="subcategory"
                                value={form.subcategory}
                                onChange={handleChange}
                                required
                                className={inputBase}
                            >
                                <option value="">Izaberi…</option>
                                {subOptions.map(slug => (
                                    <option key={slug} value={slug}>{SUBCATEGORY_MAP[slug]}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Cover slika + preview */}
                    <div className="mt-4">
                        <label className={labelBase}>Naslovna slika (cover)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageChange}
                            required
                            className={`${inputBase} file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:text-emerald-700`}
                        />
                        {coverPreview && (
                            <div className="mt-3">
                                <img
                                    src={coverPreview}
                                    alt="Preview"
                                    className="w-full h-44 object-cover rounded-xl border"
                                />
                            </div>
                        )}
                    </div>

                    {/* Galerija */}
                    <div className="mt-4">
                        <label className={labelBase}>Galerija (slike/video)</label>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleGalleryChange}
                            className={`${inputBase} file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:text-emerald-700`}
                        />
                    </div>
                </div>

                {/* Vreme / Uputstvo */}
                <div className="bg-white/80 backdrop-blur border rounded-2xl shadow p-5 space-y-4">
                    <div>
                        <label className={labelBase} htmlFor="preparationTime">Vreme pripreme</label>
                        <input
                            id="preparationTime"
                            name="preparationTime"
                            type="text"
                            placeholder="npr. 45 minuta ili 1h 10min"
                            value={form.preparationTime}
                            onChange={handleChange}
                            className={inputBase}
                        />
                    </div>

                    <div>
                        <label className={labelBase} htmlFor="instructions">Uputstvo za pripremu</label>
                        <textarea
                            id="instructions"
                            name="instructions"
                            placeholder="Korak 1...&#10;Korak 2..."
                            value={form.instructions}
                            onChange={handleChange}
                            rows={8}
                            required
                            className={`${inputBase} min-h-[180px]`}
                        />
                    </div>
                </div>

                {/* Sastojci / Napomena / Poslovica */}
                <div className="bg-white/80 backdrop-blur border rounded-2xl shadow p-5 space-y-4">
                    <div>
                        <label className={labelBase} htmlFor="ingredients">Sastojci (po jedan u redu)</label>
                        <textarea
                            id="ingredients"
                            name="ingredients"
                            placeholder={`npr.\n3 jaja\n200 g brašna\n1 čaša jogurta`}
                            value={form.ingredients}
                            onChange={handleChange}
                            rows={6}
                            required
                            className={`${inputBase} font-mono`}
                        />
                    </div>

                    <div>
                        <label className={labelBase} htmlFor="note">Napomena (opciono)</label>
                        <textarea
                            id="note"
                            name="note"
                            placeholder="Npr. koristila sam čokoladu sa 70% kakaa"
                            value={form.note}
                            onChange={handleChange}
                            rows={4}
                            className={`${inputBase} min-h-[120px]`}
                        />
                    </div>

                    <div className="rounded-xl border p-3 bg-gray-50">
                        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={appendQuote}
                                onChange={(e) => setAppendQuote(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            Dodaj poslovicu na kraj napomene
                        </label>

                        {appendQuote && (
                            <div className="mt-3">
                                <label className={labelBase} htmlFor="quote">Poslovica</label>
                                <input
                                    id="quote"
                                    type="text"
                                    value={quoteText}
                                    onChange={(e) => setQuoteText(e.target.value)}
                                    className={inputBase}
                                    placeholder="Upiši poslovicu…"
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    Biće dodata sa razmakom i crtom, npr: <em>— „{quoteText || '…'}”</em>
                                </p>
                            </div>
                        )}

                        {/* Live preview */}
                        <div className="mt-4">
                            <div className="text-xs font-medium text-gray-600 mb-1">Pregled napomene:</div>
                            <pre className="whitespace-pre-wrap text-sm bg-white border rounded-xl p-3 text-gray-800">
                                {notePreview || '— (nema napomene)'}
                            </pre>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow"
                    >
                        ✅ Dodaj recept
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddRecipe;
