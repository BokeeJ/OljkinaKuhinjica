import React, { useEffect, useMemo, useState } from 'react';
import axios from '../api';
import { useParams, useNavigate } from 'react-router-dom';

// slug -> label (tačno kao u Mongoose enumu)
const SUBCATEGORY_MAP = {
    kolaci: 'Kolaci',
    torte: 'Torte',
    rucak: 'Rucak',
    dorucak: 'Dorucak',
    vecera: 'Vecera',
    uzina: 'Uzina',
    pica: 'Pica',
    salate: 'Salate',
    'hladna-jela': 'Hladna jela',
    'brza-jela': 'Brza jela',
    'supe-i-corbe': 'Supe i čorbe',
    pecivo: 'Pecivo',
};
// obrnuto: label -> slug (iz baze u <select>)
const LABEL_TO_SLUG = Object.fromEntries(
    Object.entries(SUBCATEGORY_MAP).map(([slug, label]) => [label, slug])
);

// podkategorije po kategoriji (za UX filtriranje)
const SUBS_BY_CAT = {
    slatko: ['kolaci', 'torte'],
    slano: [
        'dorucak',
        'rucak',
        'vecera',
        'pica',
        'brza-jela',
        'salate',
        'hladna-jela',
        'uzina',
        'supe-i-corbe',
        'pecivo',
    ],
};

// malo Cloudinary transform helper (ako je već na Cloudinary)
const cdn = (url, w = 0) => {
    if (!url) return url;
    const i = url.indexOf('/upload/');
    if (i === -1) return url;
    const trans = `f_auto,q_auto${w ? `,w_${w}` : ''}`;
    return url.slice(0, i + 8) + trans + '/' + url.slice(i + 8);
};

const inputBase =
    'w-full rounded-xl border border-gray-300 bg-white/90 text-gray-900 placeholder:text-gray-400 ' +
    'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 px-3 py-2';

const labelBase = 'block text-[13px] font-semibold text-gray-700 mb-1';

function IzmeniRecept() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        category: 'slano',
        subcategory: '', // čuvamo SLUG u formi
        preparationTime: '',
        ingredients: '',
        instructions: '',
        note: '',
    });

    const [coverImage, setCoverImage] = useState(null); // nova cover slika (File)
    const [coverPreview, setCoverPreview] = useState(''); // URL.createObjectURL za preview
    const [gallery, setGallery] = useState([]); // nova galerija (File[])
    const [existingCover, setExistingCover] = useState(null);
    const [existingGallery, setExistingGallery] = useState([]);

    const subOptions = useMemo(
        () => SUBS_BY_CAT[form.category] || [],
        [form.category]
    );

    // Učitavanje postojećeg recepta
    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get(`/api/recipes/${id}`);
                const data = res.data;

                const subLabel = data.subcategory || '';
                const subSlug = LABEL_TO_SLUG[subLabel] || '';

                setForm({
                    title: data.title || '',
                    category: (data.category || 'slano').toLowerCase(),
                    subcategory: subSlug,
                    preparationTime: data.preparationTime || '',
                    ingredients: (data.ingredients || []).join('\n'),
                    instructions: data.instructions || '',
                    note: data.note || '',
                });
                setExistingCover(data.coverImage || null);
                setExistingGallery(data.gallery || []);
                setCoverPreview('');
            } catch (e) {
                console.error('Greška pri učitavanju recepta:', e);
                alert('Ne mogu da učitam recept.');
            }
        })();
    }, [id]);

    // Handleri
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => {
            if (name === 'category') {
                const valid = SUBS_BY_CAT[value] || [];
                // ako trenutni slug nije u novoj grupi — reset
                return {
                    ...prev,
                    category: value,
                    subcategory: valid.includes(prev.subcategory) ? prev.subcategory : '',
                };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleCoverChange = (e) => {
        const file = e.target.files?.[0];
        setCoverImage(file || null);
        setCoverPreview(file ? URL.createObjectURL(file) : '');
    };

    const handleGalleryChange = (e) => {
        setGallery(Array.from(e.target.files || []));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.subcategory) {
            alert('Izaberi podkategoriju.');
            return;
        }

        const subLabel = SUBCATEGORY_MAP[form.subcategory];
        if (!subLabel) {
            alert('Nepoznata podkategorija.');
            return;
        }

        const data = new FormData();
        data.append('title', form.title.trim());
        data.append('category', String(form.category || '').toLowerCase());
        data.append('subcategory', subLabel);
        data.append('preparationTime', form.preparationTime);
        data.append('instructions', form.instructions);
        data.append('note', form.note || '');

        // sastojci – po jedan u redu
        (form.ingredients || '')
            .split('\n')
            .map((i) => i.trim())
            .filter(Boolean)
            .forEach((i) => data.append('ingredients', i));

        if (coverImage instanceof File) data.append('coverImage', coverImage);
        (gallery || []).forEach((g) => data.append('gallery', g));

        try {
            // Interceptor već šalje Authorization i baseURL
            await axios.put(`/api/recipes/${id}`, data);

            alert('Recept uspešno izmenjen!');
            navigate('/admin');
        } catch (err) {
            console.log('Update error:', err?.response?.data || err.message);
            alert(err?.response?.data?.error || 'Greška pri izmeni recepta.');
        }
    };

    // mali brojčani hint za sastojke
    const ingredientsCount = useMemo(
        () =>
            (form.ingredients || '')
                .split('\n')
                .map((i) => i.trim())
                .filter(Boolean).length,
        [form.ingredients]
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-8 px-4">
            {/* Header */}
            <div className="mx-auto w-full max-w-5xl mb-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                        ✏️ Izmeni recept
                    </h1>
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        ⭠ Nazad
                    </button>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="mx-auto w-full max-w-5xl space-y-6"
            >
                {/* Osnovno */}
                <div className="bg-white/80 backdrop-blur border rounded-2xl shadow p-5">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="title" className={labelBase}>
                                Naslov
                            </label>
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
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="category" className={labelBase}>
                                    Kategorija
                                </label>
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
                                <label htmlFor="subcategory" className={labelBase}>
                                    Podkategorija
                                </label>
                                <select
                                    id="subcategory"
                                    name="subcategory"
                                    value={form.subcategory}
                                    onChange={handleChange}
                                    required
                                    className={inputBase}
                                >
                                    <option value="">Izaberi…</option>
                                    {subOptions.map((slug) => (
                                        <option key={slug} value={slug}>
                                            {SUBCATEGORY_MAP[slug]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="preparationTime" className={labelBase}>
                                Vreme pripreme
                            </label>
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
                    </div>
                </div>

                {/* Slike */}
                <div className="bg-white/80 backdrop-blur border rounded-2xl shadow p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Slike</h3>

                    {/* Postojeći cover */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4">
                        <div>
                            <label className={labelBase}>Trenutni cover</label>
                            <div className="rounded-xl border overflow-hidden bg-white">
                                {existingCover?.url ? (
                                    <img
                                        src={cdn(existingCover.url, 720)}
                                        alt="Trenutni cover"
                                        className="w-full h-48 object-cover"
                                    />
                                ) : (
                                    <div className="h-48 grid place-items-center text-sm text-gray-500">
                                        Nema naslovne slike
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Novi cover */}
                        <div>
                            <label className={labelBase}>Nova naslovna slika (opciono)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverChange}
                                className={`${inputBase} file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:text-emerald-700`}
                            />
                            {coverPreview && (
                                <div className="mt-3 rounded-xl border overflow-hidden">
                                    <img
                                        src={coverPreview}
                                        alt="Novi cover preview"
                                        className="w-full h-48 object-cover"
                                    />
                                </div>
                            )}
                            <p className="text-[12px] text-gray-500 mt-2">
                                Ako ne izabereš novu sliku, ostaje trenutna.
                            </p>
                        </div>
                    </div>

                    {/* Postojeća galerija */}
                    <div className="mt-5">
                        <label className={labelBase}>Trenutna galerija</label>
                        {existingGallery.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {existingGallery.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="relative rounded-lg overflow-hidden border bg-white"
                                    >
                                        {item.type === 'video' || /video/.test(item.url) ? (
                                            <video
                                                controls
                                                src={item.url}
                                                className="w-full h-28 object-cover"
                                            />
                                        ) : (
                                            <img
                                                src={cdn(item.url, 480)}
                                                alt="Galerija"
                                                className="w-full h-28 object-cover"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">
                                Nema fajlova u galeriji.
                            </div>
                        )}
                    </div>

                    {/* Nova galerija */}
                    <div className="mt-4">
                        <label className={labelBase}>Dodaj u galeriju (slike/video)</label>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleGalleryChange}
                            className={`${inputBase} file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:text-emerald-700`}
                        />
                        <p className="text-[12px] text-gray-500 mt-2">
                            Ovim <b>zamenjuješ</b> celu galeriju (server je tako podešen). Ako ne
                            dodaš ništa, postojeća ostaje.
                        </p>
                    </div>
                </div>

                {/* Tekstualni delovi */}
                <div className="bg-white/80 backdrop-blur border rounded-2xl shadow p-5 space-y-4">
                    <div>
                        <label htmlFor="instructions" className={labelBase}>
                            Uputstvo za pripremu
                        </label>
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

                    <div>
                        <div className="flex items-baseline justify-between">
                            <label htmlFor="ingredients" className={labelBase}>
                                Sastojci (po jedan u red)
                            </label>
                            <span className="text-[12px] text-gray-500">
                                {ingredientsCount} stavki
                            </span>
                        </div>
                        <textarea
                            id="ingredients"
                            name="ingredients"
                            value={form.ingredients}
                            onChange={handleChange}
                            className={`${inputBase} font-mono`}
                            placeholder={'Sastojak 1\nSastojak 2\nSastojak 3'}
                            rows={6}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="note" className={labelBase}>
                            Napomena (opciono)
                        </label>
                        <textarea
                            id="note"
                            name="note"
                            value={form.note}
                            onChange={handleChange}
                            className={`${inputBase} min-h-[100px]`}
                            placeholder="Npr. koristila sam čokoladu sa 70% kakaa"
                            rows={4}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        Otkaži
                    </button>
                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow"
                    >
                        💾 Sačuvaj izmene
                    </button>
                </div>
            </form>
        </div>
    );
}

export default IzmeniRecept;
