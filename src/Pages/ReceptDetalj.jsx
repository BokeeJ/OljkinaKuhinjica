import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from "../api";
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

function ReceptDetalji() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [recipe, setRecipe] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Cloudinary on-the-fly optimizacija (ako je URL sa Cloudinary)
    const cdn = (url, w = 0) => {
        if (!url) return url;
        const i = url.indexOf('/upload/');
        if (i === -1) return url;
        const trans = `f_auto,q_auto${w ? `,w_${w}` : ''}`;
        return url.slice(0, i + 8) + trans + '/' + url.slice(i + 8);
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get(`/api/recipes/${id}`);
                setRecipe(res.data);

                const slides = (res.data.gallery || []).map((item) => ({
                    src: item.url,
                    type: item.type === 'video' ? 'video' : 'image',
                }));
                setGallery(slides);
            } catch (e) {
                console.error("Greška pri učitavanju recepta:", e);
            }
        })();
    }, [id]);

    // Lepši prikaz vremena (ne dodajemo “min” na silu)
    const prettyTime = useMemo(() => {
        const t = recipe?.preparationTime || '';
        return t.trim();
    }, [recipe]);

    // Pametno odvajanje POSLOVICE od napomene
    const { noteText, proverb } = useMemo(() => {
        const raw = String(recipe?.note || '').trim();
        if (!raw) return { noteText: '', proverb: '' };

        const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
        let idx = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
            const l = lines[i];
            const looksQuoted =
                /^["“].+["”]$/.test(l) || l.includes('“') || l.includes('”');
            const hasPrefix = /^(poslovica|citat)\s*:/i.test(l);
            if (looksQuoted || hasPrefix) {
                idx = i;
                break;
            }
        }
        if (idx >= 0) {
            const prov = lines[idx].replace(/^(poslovica|citat)\s*:/i, '').trim();
            return {
                noteText: lines.slice(0, idx).join('\n'),
                proverb: prov,
            };
        }
        return { noteText: lines.join('\n'), proverb: '' };
    }, [recipe?.note]);

    // Fallback target za povratak na listu sa istim query-jem (ako postoji)
    const fallbackFrom =
        location.state?.from ||
        (location.search ? `/recepti${location.search}` : '/recepti?page=1');

    // Back handler:
    // - ako je došao sa liste (ima history), navigate(-1)
    // - ako je otvorio direktno, idi na fallbackFrom
    const handleBack = () => {
        if (location.key !== 'default') {
            navigate(-1);
        } else {
            navigate(fallbackFrom, { replace: true });
        }
    };

    if (!recipe) {
        return (
            <div className="min-h-screen grid place-items-center text-gray-600">
                Učitavam…
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-6 sm:py-10 px-3 sm:px-6 flex justify-center">
                <article className="w-full max-w-4xl bg-white/90 backdrop-blur rounded-2xl shadow-xl overflow-hidden">
                    {/* Cover sa overlay naslovom + back dugme u uglu */}
                    {recipe.coverImage?.url && (
                        <div className="relative">
                            <img
                                src={cdn(recipe.coverImage.url, 1280)}
                                alt={recipe.title}
                                className="w-full h-56 sm:h-72 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <h1 className="absolute left-4 right-4 bottom-4 text-white text-2xl sm:text-3xl font-extrabold drop-shadow">
                                {recipe.title}
                            </h1>

                            <button
                                onClick={handleBack}
                                className="absolute top-3 left-3 bg-white/90 hover:bg-white text-gray-800 font-semibold rounded-full px-3 py-1.5 text-sm shadow"
                                aria-label="Nazad"
                            >
                                ← Nazad
                            </button>
                        </div>
                    )}

                    {/* Meta info */}
                    <div className="px-4 sm:px-6 pt-4">
                        <div className="flex flex-wrap items-center gap-2 text-[12px]">
                            <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                                {recipe.category === 'slatko' ? 'Slatko' : 'Slano'}
                            </span>
                            {recipe.subcategory && (
                                <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 ring-1 ring-orange-200">
                                    {recipe.subcategory}
                                </span>
                            )}
                            {prettyTime && (
                                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 ring-1 ring-gray-200">
                                    ⏱ {prettyTime}
                                </span>
                            )}
                            <span className="ml-auto text-gray-400">
                                Dodato:{' '}
                                {recipe.createdAt
                                    ? new Date(recipe.createdAt).toLocaleString('sr-RS')
                                    : '—'}
                            </span>
                        </div>
                    </div>

                    {/* Sadržaj */}
                    <div className="px-4 sm:px-6 pb-6 pt-4 text-gray-800">
                        {/* Sastojci */}
                        <section className="mb-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-2">Sastojci</h2>
                            <ul className="list-disc pl-5 space-y-1 text-[15px]">
                                {(recipe.ingredients || []).map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </section>

                        {/* Uputstvo */}
                        <section className="mb-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-2">Uputstvo za pripremu</h2>
                            <ol className="list-decimal pl-5 space-y-1 text-[15px] leading-relaxed">
                                {(recipe.instructions || '')
                                    .split('\n')
                                    .map((l) => l.trim())
                                    .filter(Boolean)
                                    .map((step, i) => (
                                        <li key={i}>{step}</li>
                                    ))}
                            </ol>
                        </section>

                        {/* Napomena + Poslovica (odvojeno) */}
                        {(noteText || proverb) && (
                            <section className="mb-6">
                                {noteText && (
                                    <>
                                        <h2 className="text-lg font-bold text-gray-900 mb-2">Napomena</h2>
                                        <p className="whitespace-pre-line text-[15px] text-gray-700 bg-amber-50/60 border border-amber-200 rounded-xl p-3">
                                            {noteText}
                                        </p>
                                    </>
                                )}

                                {proverb && (
                                    <div className={`${noteText ? 'mt-4' : ''}`}>
                                        <h3 className="sr-only">Poslovica</h3>
                                        <blockquote className="relative p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 italic">
                                            <span className="absolute -top-3 -left-3 text-orange-400 text-2xl select-none">
                                                “
                                            </span>
                                            {proverb}
                                        </blockquote>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Galerija */}
                        {gallery.length > 0 && (
                            <section className="mt-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-2">Galerija</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {gallery.map((item, idx) =>
                                        item.type === 'video' ? (
                                            <video
                                                key={idx}
                                                controls
                                                className="w-full h-32 object-cover rounded-xl border"
                                            >
                                                <source src={item.src} type="video/mp4" />
                                                Vaš pretraživač ne podržava video tag.
                                            </video>
                                        ) : (
                                            <img
                                                key={idx}
                                                src={cdn(item.src, 600)}
                                                alt={`Slika ${idx + 1}`}
                                                className="w-full h-32 object-cover rounded-xl border cursor-pointer hover:opacity-90 transition"
                                                onClick={() => {
                                                    setCurrentIndex(idx);
                                                    setIsOpen(true);
                                                }}
                                            />
                                        )
                                    )}
                                </div>
                            </section>
                        )}

                        {/* CTA nazad (dugme sa istim ponašanjem) */}
                        <div className="pt-6">
                            <button
                                onClick={handleBack}
                                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full px-4 py-2 text-sm"
                            >
                                ← Nazad na listu
                            </button>
                        </div>
                    </div>
                </article>
            </div>

            {isOpen && (
                <Lightbox
                    open={isOpen}
                    close={() => setIsOpen(false)}
                    index={currentIndex}
                    slides={gallery}
                />
            )}
        </>
    );
}

export default ReceptDetalji;
