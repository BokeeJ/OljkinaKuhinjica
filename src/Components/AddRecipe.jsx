// src/pages/AddRecipe.jsx
import React, { useMemo, useState } from "react";
import axios from "../api";
import { SECTIONS_BY_CATEGORY, SUBS_BY_SECTION } from "../constants/taxonomy";
import { canon, displaySub } from "../utils/text"; // ⬅️ KANON + lep prikaz podkategorije

const inputBase =
    "w-full rounded-xl border border-zinc-300 bg-white/90 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 px-3 py-2";
const labelBase = "block text-[13px] font-semibold text-zinc-700 mb-1";

export default function AddRecipe() {
    const [form, setForm] = useState({
        title: "",
        category: "slano",
        section: "",
        subcategory: "",
        preparationTime: "",
        ingredients: "",
        instructions: "",
        note: "",
        coverImage: null,
        gallery: [],
    });
    const [coverPreview, setCoverPreview] = useState("");

    const sections = useMemo(
        () => SECTIONS_BY_CATEGORY[form.category] || [],
        [form.category]
    );
    const subs = useMemo(
        () => SUBS_BY_SECTION[form.section] || [],
        [form.section]
    );

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => {
            if (name === "category")
                return { ...prev, category: value, section: "", subcategory: "" };
            if (name === "section")
                return { ...prev, section: value, subcategory: "" };
            return { ...prev, [name]: value };
        });
    };

    const onCover = (e) => {
        const file = e.target.files?.[0];
        setForm((p) => ({ ...p, coverImage: file || null }));
        setCoverPreview(file ? URL.createObjectURL(file) : "");
    };

    const onGallery = (e) =>
        setForm((p) => ({ ...p, gallery: Array.from(e.target.files || []) }));

    const submit = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) return alert("Unesi naslov.");
        if (!form.coverImage) return alert("Dodaj naslovnu sliku.");
        if (!form.section) return alert("Izaberi sekciju.");

        const requiresSub = (SUBS_BY_SECTION[form.section] || []).length > 0;
        if (requiresSub && !form.subcategory) return alert("Izaberi podkategoriju.");

        // ⬇️ kanonizacija za backend (uniformno čuvanje/upit)
        const sectionCanon = canon(form.section);                 // "Pite i peciva" -> "pite i peciva"
        const subCanon = requiresSub ? canon(form.subcategory) : undefined; // "Biskvitni" -> "biskvitni"

        const fd = new FormData();
        fd.append("title", form.title.trim());
        fd.append("category", String(form.category || "").toLowerCase()); // 'slano' | 'slatko'
        fd.append("section", sectionCanon);
        if (requiresSub && subCanon) fd.append("subcategory", subCanon);

        if (form.preparationTime)
            fd.append("preparationTime", String(form.preparationTime).trim());
        if (form.instructions) fd.append("instructions", form.instructions.trim());
        if (form.note) fd.append("note", form.note.trim());

        fd.append("coverImage", form.coverImage);

        (form.ingredients || "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((ing) => fd.append("ingredients", ing));

        (form.gallery || []).forEach((file) => fd.append("gallery", file));

        try {
            const { data } = await axios.post("/api/recipes", fd);
            alert("Recept dodat!");
            const newId = data?._id || data?.id;
            if (newId) window.open(`/recept/${newId}`, "_blank", "noopener");

            setForm({
                title: "",
                category: form.category, // zadrži aktivni tab
                section: "",
                subcategory: "",
                preparationTime: "",
                ingredients: "",
                instructions: "",
                note: "",
                coverImage: null,
                gallery: [],
            });
            setCoverPreview("");
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.error || "Greška pri dodavanju recepta.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-emerald-50 py-8 px-4">
            <form onSubmit={submit} className="mx-auto w-full max-w-3xl space-y-6">
                <div className="rounded-3xl bg-white/70 backdrop-blur border border-zinc-200 shadow p-5">
                    <h2 className="text-xl font-bold text-zinc-900 mb-4">➕ Dodaj recept</h2>

                    {/* Naslov */}
                    <label className={labelBase} htmlFor="title">Naslov</label>
                    <input
                        id="title"
                        name="title"
                        value={form.title}
                        onChange={onChange}
                        placeholder="npr. Kolač sa jabukama"
                        className={inputBase}
                        required
                    />

                    {/* Tabaovi: slano / slatko */}
                    <div className="mt-4 flex items-center gap-2">
                        {["slano", "slatko"].map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => onChange({ target: { name: "category", value: cat } })}
                                className={`px-4 py-2 rounded-xl text-sm shadow-sm ${form.category === cat
                                        ? "bg-emerald-600 text-white"
                                        : "bg-white/90 border border-zinc-300 text-zinc-800 hover:bg-white"
                                    }`}
                            >
                                {cat.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* Sekcija / Podkategorija */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className={labelBase} htmlFor="section">Sekcija</label>
                            <select
                                id="section"
                                name="section"
                                value={form.section}
                                onChange={onChange}
                                required
                                className={inputBase}
                            >
                                <option value="">Izaberi…</option>
                                {sections.map((sec) => (
                                    <option key={sec} value={sec}>{sec}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelBase} htmlFor="subcategory">Podkategorija</label>
                            {subs.length > 0 ? (
                                <select
                                    id="subcategory"
                                    name="subcategory"
                                    value={form.subcategory}
                                    onChange={onChange}
                                    required
                                    className={inputBase}
                                >
                                    <option value="">Izaberi…</option>
                                    {subs.map((s) => (
                                        // ⬇️ prikaži lepo (Čokoladni…), vrednost ostaje slug (npr. "cokoladni")
                                        <option key={s} value={s}>
                                            {displaySub(form.section, s)}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    disabled
                                    className={inputBase}
                                    value={form.section ? "Ova sekcija nema podkategorije." : ""}
                                    placeholder="(izaberi sekciju)"
                                />
                            )}
                        </div>
                    </div>

                    {/* Cover / Galerija */}
                    <div className="mt-4 grid grid-cols-1 gap-4">
                        <div>
                            <label className={labelBase}>Naslovna slika (cover)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onCover}
                                className={`${inputBase} file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:text-emerald-700`}
                                required
                            />
                            {coverPreview && (
                                <div className="mt-3 rounded-xl border overflow-hidden">
                                    <img src={coverPreview} alt="Preview" className="w-full h-44 object-cover" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className={labelBase}>Galerija (slike/video)</label>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                onChange={onGallery}
                                className={`${inputBase} file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:text-emerald-700`}
                            />
                        </div>
                    </div>
                </div>

                {/* Vreme / Uputstvo / Sastojci / Napomena */}
                <div className="rounded-3xl bg-white/70 backdrop-blur border border-zinc-200 shadow p-5 space-y-4">
                    <div>
                        <label className={labelBase} htmlFor="preparationTime">Vreme pripreme</label>
                        <input
                            id="preparationTime"
                            name="preparationTime"
                            value={form.preparationTime}
                            onChange={onChange}
                            placeholder="npr. 45 minuta"
                            className={inputBase}
                        />
                    </div>

                    <div>
                        <label className={labelBase} htmlFor="instructions">Uputstvo</label>
                        <textarea
                            id="instructions"
                            name="instructions"
                            rows={8}
                            value={form.instructions}
                            onChange={onChange}
                            placeholder="Korak 1...&#10;Korak 2..."
                            className={`${inputBase} min-h-[180px]`}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelBase} htmlFor="ingredients">Sastojci (po redu)</label>
                        <textarea
                            id="ingredients"
                            name="ingredients"
                            rows={6}
                            value={form.ingredients}
                            onChange={onChange}
                            placeholder={"npr.\n3 jaja\n200 g brašna\n1 čaša jogurta"}
                            className={`${inputBase} font-mono`}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelBase} htmlFor="note">Napomena (opciono)</label>
                        <textarea
                            id="note"
                            name="note"
                            rows={4}
                            value={form.note}
                            onChange={onChange}
                            placeholder="Npr. koristila sam čokoladu sa 70% kakaa"
                            className={`${inputBase} min-h-[120px]`}
                        />
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
