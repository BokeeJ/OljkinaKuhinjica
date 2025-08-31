import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useSearch } from "../Context/SearchContext";

const cdn = (url, w = 0) => {
    if (!url) return url;
    const i = url.indexOf("/upload/");
    if (i === -1) return url;
    const trans = `f_auto,q_auto${w ? `,w_${w}` : ""}`;
    return url.slice(0, i + 8) + trans + "/" + url.slice(i + 8);
};

export default function QuickSearch({
    placeholder = "Pretraži recept…",
    color = "orange",
}) {
    const navigate = useNavigate();
    const { searchQuery, setSearchQuery } = useSearch();

    const [open, setOpen] = useState(false);
    const [results, setResults] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const boxRef = useRef(null);
    const timer = useRef(null);

    // zatvori klikom van ili ESC
    useEffect(() => {
        const onDoc = (e) => {
            if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
        };
        const onEsc = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("click", onDoc);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("click", onDoc);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    // debounce fetch
    useEffect(() => {
        clearTimeout(timer.current);
        if (!searchQuery || searchQuery.trim().length < 2) {
            setResults([]);
            setTotal(0);
            return;
        }
        timer.current = setTimeout(async () => {
            try {
                setLoading(true);
                const res = await axios.get(
                    `${API_BASE_URL}/api/recipes/page`,
                    {
                        params: { q: searchQuery.trim(), page: 1, limit: 10 },
                    }
                );
                setResults(res.data?.items || []);
                setTotal(res.data?.total || 0);
                setOpen(true);
            } catch (e) {
                setResults([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        }, 250);
        return () => clearTimeout(timer.current);
    }, [searchQuery]);

    const ringColor =
        color === "orange" ? "focus:ring-orange-400" : "focus:ring-emerald-400";

    const onSubmitFull = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        // otvori punu listu i ostavi query u kontekstu
        navigate("/SviRecepti");
        setOpen(false);
    };

    const goToOne = (id) => {
        setOpen(false);
        navigate(`/recept/${id}`);
    };

    const showFooter = useMemo(
        () => total > results.length,
        [total, results.length]
    );

    return (
        <div ref={boxRef} className="relative w-full sm:w-[380px]">
            <form onSubmit={onSubmitFull}>
                <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => results.length && setOpen(true)}
                    placeholder={placeholder}
                    className={`w-full px-4 py-2.5 rounded-2xl text-gray-500 bg-gray-100 shadow border border-gray-200 outline-none ${ringColor}`}
                />
            </form>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-[80] mt-2 w-full sm:w-[480px] max-w-[90vw]">
                    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
                        {/* Header */}
                        <div className="px-3 py-2 text-[12px] text-gray-500 flex items-center gap-2">
                            {loading ? "Tražim…" : `Rezultati za: “${searchQuery}”`}
                            {total > 0 && !loading && (
                                <span className="ml-auto text-gray-400">{total} pronađeno</span>
                            )}
                        </div>

                        {/* Lista */}
                        <div className="max-h-96 overflow-y-auto divide-y">
                            {results.map((r) => (
                                <button
                                    key={r._id}
                                    onClick={() => goToOne(r._id)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left"
                                >
                                    <img
                                        src={cdn(r?.coverImage?.url, 160)}
                                        alt=""
                                        className="w-14 h-14 rounded-lg object-cover border"
                                        loading="lazy"
                                    />
                                    <div className="min-w-0">
                                        <div className="font-semibold text-[14px] text-gray-800 truncate">
                                            {r.title}
                                        </div>
                                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-500">
                                            {r.category && (
                                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                                                    {r.category === "slatko" ? "Slatko" : "Slano"}
                                                </span>
                                            )}
                                            {r.subcategory && (
                                                <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 ring-1 ring-orange-200">
                                                    {r.subcategory}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                            {!loading && results.length === 0 && (
                                <div className="px-3 py-6 text-center text-sm text-gray-500">
                                    Nema rezultata.
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-3 py-2 bg-gray-50 flex items-center justify-between">
                            <button
                                className="text-[12px] text-gray-600 hover:text-gray-800"
                                onClick={() => setOpen(false)}
                            >
                                Zatvori
                            </button>
                            {showFooter && (
                                <button
                                    onClick={() => {
                                        navigate("/SviRecepti");
                                        setOpen(false);
                                    }}
                                    className="text-[12px] px-3 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                    Vidi sve rezultate ({total})
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
