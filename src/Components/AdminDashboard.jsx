import React, { useEffect, useMemo, useState } from "react";
import axios from "../api";
import AddRecipe from "./AddRecipe";
import { Link, useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cloudinary helper (ako je URL sa Cloudinary)
  const cdn = (url, w = 0) => {
    if (!url) return url;
    const i = url.indexOf("/upload/");
    if (i === -1) return url;
    const trans = `f_auto,q_auto${w ? `,w_${w}` : ""}`;
    return url.slice(0, i + 8) + trans + "/" + url.slice(i + 8);
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/recipes`);
      const arr = Array.isArray(res.data) ? res.data : res.data?.items || [];
      setRecipes(arr);
    } catch (err) {
      console.error("❌ Greška pri učitavanju recepata:", err?.message || err);
      alert("Ne mogu da učitam recepte.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Da li si siguran da želiš da obrišeš recept?");
    if (!ok) return;

    try {
      await axios.delete(`/api/recipes/${id}`);
      setRecipes((prev) => prev.filter((r) => (r._id || r.id) !== id));
    } catch (err) {
      console.error("❌ Greška pri brisanju:", err?.message || err);
      alert("Greška pri brisanju.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login", { replace: true });
  };

  const handleRecipeAdded = () => {
    fetchRecipes();
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const filteredRecipes = useMemo(() => {
    const s = (search || "").toLowerCase().trim();
    if (!s) return recipes;
    return (recipes || []).filter((r) =>
      (r.title || "").toLowerCase().includes(s)
    );
  }, [recipes, search]);

  // ✅ prikaz podkategorija: novi array ili legacy string
  const renderSubs = (recipe) => {
    if (Array.isArray(recipe?.subcategories) && recipe.subcategories.length) {
      return recipe.subcategories.join(", ");
    }
    if (recipe?.subcategory) return recipe.subcategory; // legacy
    return "Bez podkategorije";
  };

  // ✅ prikaz sekcija: novo sections[] ili legacy section
  const renderSections = (recipe) => {
    if (Array.isArray(recipe?.sections) && recipe.sections.length) {
      return recipe.sections.join(", ");
    }
    if (recipe?.section) return recipe.section; // legacy
    return "—";
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center max-w-5xl mx-auto mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-emerald-700">
          Admin Panel — Recepti
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
        >
          Logout
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Dodavanje recepta */}
        <AddRecipe onRecipeAdded={handleRecipeAdded} />

        {/* Search */}
        <input
          type="text"
          placeholder="Pretraži recepte po naslovu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border text-gray-800 border-gray-300 rounded-lg mb-6 shadow-sm"
        />

        {/* Lista */}
        {loading ? (
          <div className="text-center text-gray-600 py-6">Učitavam…</div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center text-gray-500 py-6">Nema recepata.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe._id || recipe.id}
                className="bg-white border rounded-xl p-4 shadow hover:shadow-xl flex flex-col justify-between transition-transform hover:-translate-y-1"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
                    {recipe.title}
                  </h2>

                  {recipe.coverImage?.url && (
                    <img
                      src={cdn(recipe.coverImage.url, 960)}
                      alt={recipe.title}
                      className="w-full h-44 object-cover rounded mt-3"
                      loading="lazy"
                    />
                  )}

                  <p className="text-sm text-gray-600 mt-2">
                    ⏱️ Priprema: {recipe.preparationTime || "N/A"}
                  </p>

                  <p className="text-sm text-gray-600">
                    📂 {recipe.category} / {renderSections(recipe)}{" "}
                    {(Array.isArray(recipe?.subcategories) && recipe.subcategories.length) || recipe?.subcategory
                      ? "•"
                      : ""}{" "}
                    {renderSubs(recipe)}
                  </p>
                </div>

                <div className="mt-4 flex justify-between gap-2">
                  <button
                    onClick={() => handleDelete(recipe._id || recipe.id)}
                    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 text-sm"
                  >
                    Obriši
                  </button>
                  <Link
                    to={`/admin/izmeni-recept/${recipe._id || recipe.id}`}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                  >
                    Izmeni
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;