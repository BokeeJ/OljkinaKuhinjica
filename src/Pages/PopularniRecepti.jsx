import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { API_BASE_URL } from '../config.js';

function PopularniRecepti() {
    const [recipes, setRecipes] = useState([]);
    const [search, setSearch] = useState('');
    const [itemsToShow, setItemsToShow] = useState(5); // default 5

    // ✅ Podešavanje broja recepata prema veličini ekrana
    useEffect(() => {
        const updateItems = () => {
            if (window.innerWidth < 768) {
                setItemsToShow(6); // mali ekran
            } else {
                setItemsToShow(5); // veliki ekran
            }
        };
        updateItems();
        window.addEventListener("resize", updateItems);
        return () => window.removeEventListener("resize", updateItems);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/recipes/popular`);
                setRecipes(res.data);
            } catch (err) {
                console.error("❌ Greška pri učitavanju popularnih recepata:", err);
                alert("Greška pri učitavanju popularnih recepata.");
            }
        };
        fetchData();
    }, []);

    const filteredRecipes = recipes
        .filter((r) => r.title.toLowerCase().includes(search.toLowerCase()))
        .slice(0, itemsToShow); // ✨ Ovde se primenjuje limit

    return (
        <div className="p-4 bg-gradient-to-b mt-5 min-h-screen">
            <h1 className="text-3xl font-bold text-center text-emerald-600">
                👑 Najpopularniji recepti
            </h1>

            <input
                type="text"
                placeholder="Pretraži recepte..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-[300px] mx-auto mt-4 p-3 rounded-xl border text-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 block"
            />

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {filteredRecipes.map((r) => (
                    <motion.div
                        key={r._id}
                        className="bg-white rounded-xl shadow hover:shadow-lg flex flex-col justify-between overflow-hidden hover:-translate-y-1 transition transform"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3 }}
                    >
                        <Link
                            to={`/recept/${r._id}`}

                        >
                            <div>
                                {r.coverImage?.url && (
                                    <img
                                        src={r.coverImage.url}
                                        alt={r.title}
                                        className="w-full h-32 sm:h-40 object-cover"
                                    />
                                )}
                                <div className="p-2">
                                    <h2 className="text-sm font-bold text-gray-800 line-clamp-1">{r.title}</h2>
                                    <p className="text-[9px] mt-1 text-orange-400">⏱ {r.preparationTime} min</p>
                                </div>
                            </div>
                        </Link>
                        <div className="p-2 flex justify-between items-center flex-wrap gap-1">
                            <p className="text-gray-400 text-[10px]">{new Date(r.createdAt).toLocaleString("sr-RS")}</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center text-gray-500 gap-1">
                                    <Heart className={`h-3 w-3 ${r.likes > 0 ? "text-emerald-600" : ""}`} />
                                    <span className="text-[10px]">{r.likes || 0}</span>
                                    {r.likes >= 10 && <span className="text-yellow-500 text-xs">🏆</span>}
                                </div>


                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default PopularniRecepti;
