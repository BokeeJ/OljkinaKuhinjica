// src/pages/ReceptDetalji.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "../api";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { normalizeSectionFE } from "../constants/taxonomy";
import { displaySub } from "../utils/text";

/* === helpers === */
const cdn = (url, w = 0) => {
    if (!url) return url;
    const i = url.indexOf("/upload/");
    if (i === -1) return url;
    const trans = `f_auto,q_auto${w ? `,w_${w}` : ""}`;
    return url.slice(0, i + 8) + trans + "/" + url.slice(i + 8);
};

const prettyCategory = (cat = "") => {
    const c = String(cat || "").toLowerCase();
    if (c === "slano") return "Slano";
    if (c === "slatko") return "Slatko";
    return c ? c.charAt(0).toUpperCase() + c.slice(1) : "";
};

const eqi = (a, b) => String(a || "").toLowerCase() === String(b || "").toLowerCase();

export default function ReceptDetalji() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [recipe, setRecipe] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get(`/api/recipes/${id}`);
                setRecipe(res.data);
            } catch (e) {
                console.error("Greška pri učitavanju recepta:", e);
            }
        })();
    }, [id]);

    const prettyTime = useMemo(() => (recipe?.preparationTime || "").trim(), [recipe]);

    /* ✅ NORMALIZACIJA SUBCATEGORIES (radi i sa starim receptima) */
    const subDispList = useMemo(() => {
        let arr = [];

        if (Array.isArray(recipe?.subcategories)) {
            arr = recipe.subcategories;
        }
        // fallback za stare recepte
        else if (recipe?.subcategory) {
            arr = [recipe.subcategory];
        }

        return arr
            .map((s) => displaySub(recipe?.section || "", s))
            .filter(Boolean);
    }, [recipe?.section, recipe?.subcategories, recipe?.subcategory]);

    const sectionDisp = useMemo(
        () => normalizeSectionFE(recipe?.section || ""),
        [recipe?.section]
    );

    const catDisp = useMemo(() => prettyCategory(recipe?.category || ""), [recipe?.category]);

    const showSection =
        sectionDisp &&
        !eqi(sectionDisp, catDisp);

    const showSub = subDispList.length > 0;

    /* ✅ LIGHTBOX (fix za video indeks) */
    const imageSlides = useMemo(() => {
        return (recipe?.gallery || [])
            .filter((it) => it.type !== "video")
            .map((it) => ({ src: it.url }));
    }, [recipe?.gallery]);

    const galleryGrid = useMemo(() => {
        return (recipe?.gallery || []).map((item) =>
            item.type === "video"
                ? { kind: "video", src: item.url }
                : { kind: "image", src: item.url }
        );
    }, [recipe?.gallery]);

    const fallbackFrom =
        location.state?.from || (location.search ? `/recepti${location.search}` : "/recepti?page=1");

    const handleBack = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate(fallbackFrom, { replace: true });
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

                    {/* COVER */}
                    {recipe.coverImage?.url ? (
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
                            >
                                ← Nazad
                            </button>
                        </div>
                    ) : (
                        <div className="px-4 sm:px-6 pt-5 pb-2">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
                                    {recipe.title}
                                </h1>
                                <button
                                    onClick={handleBack}
                                    className="bg-white/90 hover:bg-white text-gray-800 font-semibold rounded-full px-3 py-1.5 text-sm border"
                                >
                                    ← Nazad
                                </button>
                            </div>
                        </div>
                    )}

                    {/* META BADGES */}
                    <div className="px-4 sm:px-6 pt-4">
                        <div className="flex flex-wrap items-center gap-2 text-[12px]">

                            {catDisp && (
                                <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                                    {catDisp}
                                </span>
                            )}

                            {showSection && (
                                <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                                    {sectionDisp}
                                </span>
                            )}

                            {/* 🔥 MULTI SUBCATEGORIES */}
                            {showSub &&
                                subDispList.map((s) => (
                                    <span
                                        key={s}
                                        className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 ring-1 ring-orange-200"
                                    >
                                        {s}
                                    </span>
                                ))}

                            {prettyTime && (
                                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 ring-1 ring-gray-200">
                                    ⏱ {prettyTime}
                                </span>
                            )}

                            <span className="ml-auto text-gray-400">
                                Dodato: {recipe.createdAt
                                    ? new Date(recipe.createdAt).toLocaleString("sr-RS")
                                    : "—"}
                            </span>
                        </div>
                    </div>

                    {/* CONTENT */}
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
                            <h2 className="text-lg font-bold text-gray-900 mb-2">
                                Uputstvo za pripremu
                            </h2>
                            <ol className="list-decimal pl-5 space-y-1 text-[15px] leading-relaxed">
                                {String(recipe.instructions || "")
                                    .split("\n")
                                    .map((l) => l.trim())
                                    .filter(Boolean)
                                    .map((step, i) => (
                                        <li key={i}>{step}</li>
                                    ))}
                            </ol>
                        </section>

                        {/* GALERIJA */}
                        {galleryGrid.length > 0 && (
                            <section className="mt-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-2">Galerija</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {galleryGrid.map((item, idx) =>
                                        item.kind === "video" ? (
                                            <video key={idx} controls className="w-full h-32 object-cover rounded-xl border">
                                                <source src={item.src} type="video/mp4" />
                                            </video>
                                        ) : (
                                            <img
                                                key={idx}
                                                src={cdn(item.src, 600)}
                                                alt=""
                                                className="w-full h-32 object-cover rounded-xl border cursor-pointer hover:opacity-90 transition"
                                                onClick={() => {
                                                    const imageIndex = imageSlides.findIndex(
                                                        (s) => s.src === item.src
                                                    );
                                                    setCurrentIndex(imageIndex);
                                                    setIsOpen(true);
                                                }}
                                            />
                                        )
                                    )}
                                </div>
                            </section>
                        )}
                    </div>
                </article>
            </div>

            {isOpen && imageSlides.length > 0 && (
                <Lightbox
                    open={isOpen}
                    close={() => setIsOpen(false)}
                    index={currentIndex}
                    slides={imageSlides}
                />
            )}
        </>
    );
}
