import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { IoTimeOutline } from "react-icons/io5";
import { API_BASE_URL } from "../config";

/** Odredi koliko kartica prikazujemo po širini ekrana */
function useVisibleCount() {
    const [count, setCount] = useState(4); // mob default

    useEffect(() => {
        const mqMobile = window.matchMedia("(max-width: 767px)");
        const mqTablet = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
        const update = () => setCount(mqMobile.matches ? 4 : mqTablet.matches ? 6 : 5);
        update();
        mqMobile.addEventListener("change", update);
        mqTablet.addEventListener("change", update);
        return () => {
            mqMobile.removeEventListener("change", update);
            mqTablet.removeEventListener("change", update);
        };
    }, []);

    return count;
}

/** Cloudinary transform (bez dodatne memorije) */
const cdn = (url, w = 640, h = 360) => {
    if (!url) return "/fallback.jpg";
    const i = url.indexOf("/upload/");
    if (i === -1) return url;
    // crop sa 16:9 (cover), auto format + kvalitet
    return (
        url.slice(0, i + 8) +
        `f_auto,q_auto,w_${w},h_${h},c_fill,g_auto/` +
        url.slice(i + 8)
    );
};

function SkeletonCard() {
    return (
        <div className="rounded-xl overflow-hidden shadow-sm bg-white/70 backdrop-blur animate-pulse">
            <div className="w-full aspect-[16/9] bg-gray-200" />
            <div className="p-3 space-y-2">
                <div className="h-3 w-9/12 bg-gray-200 rounded" />
                <div className="h-3 w-5/12 bg-gray-200 rounded" />
                <div className="h-8 w-full bg-gray-200 rounded-full" />
            </div>
        </div>
    );
}

function Card({ recipe, onOpen }) {
    return (
        <article
            className="group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-2xl bg-white transition-all duration-300 border border-gray-100"
            onClick={onOpen}
            aria-label={`Otvori recept ${recipe.title}`}
        >
            <div className="relative">
                <img
                    src={cdn(recipe?.coverImage?.url, 640, 360)}
                    alt={recipe.title}
                    className="w-full aspect-[16/9] object-cover"
                    loading="lazy"
                />
                {/* suptilni overlay + badge cat */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-white/90 text-gray-700 shadow-sm">
                    {recipe.category === "slatko" ? "Slatko" : "Slano"}
                </span>
            </div>

            <div className="p-3 flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">
                    {recipe.title}
                </h3>

                <p className="flex items-center gap-2 text-xs text-gray-600">
                    <IoTimeOutline size={16} className="text-orange-500" />
                    {recipe.preparationTime || "—"}
                </p>

                <button
                    className="mt-1 w-full inline-flex items-center justify-center gap-1 text-xs font-semibold rounded-full bg-orange-200 hover:bg-orange-300 text-gray-800 py-1.5 px-3 transition"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpen?.();
                    }}
                >
                    Pogledaj <FaArrowRight size={12} />
                </button>
            </div>
        </article>
    );
}

export default function PoslednjiRecepti() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const visibleCount = useVisibleCount();

    useEffect(() => {
        (async () => {
            try {
                // backend vraća 6; možeš dodati podršku za ?limit= na serveru po želji
                const res = await fetch(`${API_BASE_URL}/api/recipes/latest`);
                if (!res.ok) throw new Error(res.statusText);
                const data = await res.json();
                setRecipes(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("Greška pri preuzimanju:", e);
                setRecipes([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <section className="w-full">
            {/* Header traka */}
            <div className="max-w-7xl mx-auto px-4 flex items-end justify-between gap-3">
                <div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-white drop-shadow-sm">
                        Poslednji recepti
                    </h2>
                    <p className="text-sm text-white/80">
                        Sveže iz Oljkine kuhinjice ✨
                    </p>
                </div>
                <Link
                    to="/SviRecepti"
                    className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold rounded-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-3 transition"
                >
                    Vidi sve <FaArrowRight size={12} />
                </Link>
            </div>

            <div className="mt-4 max-w-7xl mx-auto px-4">
                {/* Jedan grid — skroz responsive */}
                <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                        : recipes.slice(0, visibleCount).map((r) => (
                            <Card key={r._id} recipe={r} onOpen={() => navigate(`/recept/${r._id}`)} />
                        ))}
                </div>

                {/* CTA za mobilne ispod grida */}
                {!loading && (
                    <div className="sm:hidden flex justify-center mt-4">
                        <Link
                            to="/SviRecepti"
                            className="inline-flex items-center gap-2 text-xs font-semibold rounded-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 transition"
                        >
                            Vidi sve recepte <FaArrowRight size={12} />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
