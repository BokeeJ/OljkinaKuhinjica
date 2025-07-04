import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

function PopularniRecepti() {
    const [recipes, setRecipes] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get("https://kuhinjica-backend-1.onrender.com/api/recipes/popular");
            setRecipes(res.data);
        };
        fetchData();
    }, []);

    const filteredRecipes = recipes.filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 bg-gradient-to-b mt-5 min-h-screen">
            <h1 className="text-3xl font-bold text-center text-emerald-600">Najpopularniji recepti</h1>

            <input
                type="text"
                placeholder="Pretraži recepte..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-[300px] mx-auto mt-4 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 block"
            />

            <div className="mt-8 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {filteredRecipes.map((r) => (
                    <motion.div
                        key={r._id}
                        className="bg-white rounded-xl shadow hover:shadow-lg flex flex-col justify-between overflow-hidden hover:-translate-y-1 transition transform"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3 }}
                    >
                        <div>
                            {r.imageUrl && (
                                <img
                                    src={r.imageUrl}
                                    alt={r.title}
                                    className="w-full h-32 sm:h-40 object-cover"
                                />
                            )}
                            <div className="p-2">
                                <h2 className="text-sm font-bold text-gray-800 line-clamp-1">{r.title}</h2>
                                <p className="text-gray-600 mt-1 text-xs line-clamp-2">{r.description}</p>
                                <span className="bg-emerald-100 text-emerald-600 rounded-full px-2 py-1 text-[10px] mt-1 inline-block">
                                    {r.category}
                                </span>
                            </div>
                        </div>
                        <div className="p-2 flex justify-between items-center flex-wrap gap-1">
                            <p className="text-gray-400 text-[10px]">{new Date(r.createdAt).toLocaleString("sr-RS")}</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center text-gray-500">
                                    <Heart className={`h-3 w-3 ${r.likes > 0 ? "text-emerald-600" : ""}`} />
                                    <span className="ml-1 text-[10px]">{r.likes || 0}</span>
                                </div>
                                <Link
                                    to={`/recept/${r._id}`}
                                    className="bg-emerald-500 text-white rounded-full px-2 py-1 text-[10px] hover:bg-emerald-600"
                                >
                                    Detalji →
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default PopularniRecepti;
