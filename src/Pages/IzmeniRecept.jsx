import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api";
import {
  SECTIONS_BY_CATEGORY,
  SUBS_BY_SECTION,
  normalizeSectionFE,
} from "../constants/taxonomy";
import { canon, displaySub } from "../utils/text";

/* UI helpers */
const inputBase =
  "w-full rounded-xl border border-zinc-300 bg-white/90 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 px-3 py-2";
const labelBase = "block text-[13px] font-semibold text-zinc-700 mb-1";

const cdn = (url, w = 0) => {
  if (!url) return url;
  const i = url.indexOf("/upload/");
  if (i === -1) return url;
  const trans = `f_auto,q_auto${w ? `,w_${w}` : ""}`;
  return url.slice(0, i + 8) + trans + "/" + url.slice(i + 8);
};

export default function IzmeniRecept() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "slano",
    section: "",
    subcategories: [], // ✅ multi
    preparationTime: "",
    ingredients: "",
    instructions: "",
    note: "",
  });

  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [existingCover, setExistingCover] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);

  const sections = useMemo(
    () => SECTIONS_BY_CATEGORY[form.category] || [],
    [form.category]
  );

  const subs = useMemo(
    () => SUBS_BY_SECTION[form.section] || [],
    [form.section]
  );

  const hasSubs = (subs || []).length > 0;

  /* ===== Učitavanje i mapiranje ===== */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/api/recipes/${id}`);

        const sectionNorm = normalizeSectionFE(data.section || "");

        // novo polje + fallback na legacy subcategory
        const legacySingle = data.subcategory ? [data.subcategory] : [];
        const incoming = Array.isArray(data.subcategories)
          ? data.subcategories
          : legacySingle;

        // u state čuvamo kanon
        const subCanonArr = (incoming || [])
          .map((x) => canon(x))
          .filter(Boolean);

        const ingredientsText = (data.ingredients || []).join("\n");

        setForm({
          title: data.title || "",
          category: String(data.category || "slano").toLowerCase(),
          section: sectionNorm,
          subcategories: subCanonArr,
          preparationTime: data.preparationTime || "",
          ingredients: ingredientsText,
          instructions: data.instructions || "",
          note: data.note || "",
        });

        setExistingCover(data.coverImage || null);
        setExistingGallery(data.gallery || []);
        setCoverPreview("");
      } catch (e) {
        console.error(e);
        alert("Ne mogu da učitam recept.");
      }
    })();
  }, [id]);

  /* Handleri */
  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      if (name === "category") {
        return { ...prev, category: value, section: "", subcategories: [] };
      }
      if (name === "section") {
        return { ...prev, section: value, subcategories: [] };
      }
      return { ...prev, [name]: value };
    });
  };

  // ✅ toggle bez Ctrl/Cmd (klik dodaje/uklanja)
  const toggleSub = (value) => {
    setForm((p) => {
      const set = new Set(p.subcategories || []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...p, subcategories: Array.from(set) };
    });
  };

  const clearSubs = () => setForm((p) => ({ ...p, subcategories: [] }));

  const onCover = (e) => {
    const file = e.target.files?.[0];
    setCoverImage(file || null);
    setCoverPreview(file ? URL.createObjectURL(file) : "");
  };

  const onGallery = (e) => setGallery(Array.from(e.target.files || []));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.section) return alert("Izaberi sekciju.");

    const requiresSub = (SUBS_BY_SECTION[form.section] || []).length > 0;
    if (
      requiresSub &&
      (!Array.isArray(form.subcategories) || form.subcategories.length === 0)
    ) {
      return alert("Izaberi bar jednu podkategoriju.");
    }

    // šaljemo kanonske vrednosti
    const sectionCanon = canon(form.section);
    const subCanonArr = requiresSub
      ? (form.subcategories || []).map((x) => canon(x)).filter(Boolean)
      : [];

    const data = new FormData();
    data.append("title", form.title.trim());
    data.append("category", String(form.category || "").toLowerCase());
    data.append("section", sectionCanon);

    // ✅ MULTI slanje: više puta isti ključ
    if (requiresSub) {
      subCanonArr.forEach((s) => data.append("subcategories", s));
    }

    data.append("preparationTime", form.preparationTime);
    data.append("instructions", form.instructions);
    data.append("note", form.note || "");

    (form.ingredients || "")
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean)
      .forEach((i) => data.append("ingredients", i));

    if (coverImage instanceof File) data.append("coverImage", coverImage);
    (gallery || []).forEach((g) => data.append("gallery", g));

    try {
      await axios.put(`/api/recipes/${id}`, data);
      alert("Recept uspešno izmenjen!");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Greška pri izmeni recepta.");
    }
  };

  const ingredientsCount = useMemo(() => {
    return (form.ingredients || "")
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean).length;
  }, [form.ingredients]);

  // prikaz labela za badge (iz kanona -> lep prikaz)
  const selectedBadges = useMemo(() => {
    const set = new Set(form.subcategories || []);
    return (subs || [])
      .map((s) => ({ raw: s, v: canon(s) }))
      .filter((x) => set.has(x.v))
      .map((x) => ({ value: x.v, label: displaySub(form.section, x.raw) }));
  }, [form.subcategories, subs, form.section]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-emerald-50 py-8 px-4">
      <form onSubmit={submit} className="mx-auto w-full max-w-5xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-white/60 backdrop-blur border border-zinc-200 shadow-sm p-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-zinc-900">✏️ Izmeni recept</h1>
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="text-sm px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
          >
            ⭠ Nazad
          </button>
        </div>

        {/* Osnovno */}
        <div className="rounded-3xl bg-white/70 backdrop-blur border border-zinc-200 shadow p-5 space-y-4">
          <div>
            <label htmlFor="title" className={labelBase}>Naslov</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="npr. Kolač sa jabukama"
              className={inputBase}
              required
            />
          </div>

          {/* Tabovi */}
          <div className="flex items-center gap-2">
            {["slano", "slatko"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onChange({ target: { name: "category", value: cat } })}
                className={`px-4 py-2 rounded-xl text-sm shadow-sm ${
                  form.category === cat
                    ? "bg-emerald-600 text-white"
                    : "bg-white/90 border border-zinc-300 text-zinc-800 hover:bg-white"
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Sekcija + Podkategorije */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="section" className={labelBase}>Sekcija</label>
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
              <div className="flex items-baseline justify-between">
                <label htmlFor="subcategories" className={labelBase}>Podkategorije</label>
                {hasSubs && (
                  <button
                    type="button"
                    onClick={clearSubs}
                    className="text-[12px] text-zinc-500 hover:text-zinc-700 underline"
                  >
                    Očisti
                  </button>
                )}
              </div>

              {hasSubs ? (
                <>
                  <select
                    id="subcategories"
                    name="subcategories"
                    multiple
                    value={form.subcategories}
                    onChange={() => {}}
                    className={inputBase}
                    size={Math.min(8, Math.max(4, subs.length))}
                  >
                    {subs.map((s) => {
                      const v = canon(s);
                      return (
                        <option
                          key={s}
                          value={v}
                          onMouseDown={(e) => {
                            e.preventDefault(); // 🔥 ne resetuj selekciju
                            toggleSub(v);       // 🔥 toggle
                          }}
                        >
                          {displaySub(form.section, s)}
                        </option>
                      );
                    })}
                  </select>

                  <p className="text-[12px] text-zinc-500 mt-2">
                    Klikom dodaješ/uklanjaš podkategorije (nema Ctrl/Cmd).
                  </p>

                  {selectedBadges.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedBadges.map((b) => (
                        <span
                          key={b.value}
                          className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 ring-1 ring-orange-200 text-[12px]"
                        >
                          {b.label}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <input
                  disabled
                  className={`${inputBase} bg-zinc-100 text-zinc-500`}
                  value={form.section ? "Ova sekcija nema podkategorije." : ""}
                  placeholder="(izaberi sekciju)"
                />
              )}
            </div>
          </div>

          <div>
            <label htmlFor="preparationTime" className={labelBase}>Vreme pripreme</label>
            <input
              id="preparationTime"
              name="preparationTime"
              value={form.preparationTime}
              onChange={onChange}
              placeholder="npr. 45 minuta"
              className={inputBase}
            />
          </div>
        </div>

        {/* Slike */}
        <div className="rounded-3xl bg-white/70 backdrop-blur border border-zinc-200 shadow p-5">
          <h3 className="text-lg font-bold text-zinc-900 mb-3">Slike</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Postojeći cover */}
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
                  <div className="h-48 grid place-items-center text-sm text-zinc-500">
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
                onChange={onCover}
                className={`${inputBase} file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:text-emerald-700`}
              />
              {coverPreview && (
                <div className="mt-3 rounded-xl border overflow-hidden">
                  <img src={coverPreview} alt="Novi cover" className="w-full h-48 object-cover" />
                </div>
              )}
              <p className="text-[12px] text-zinc-500 mt-2">
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
                  <div key={idx} className="relative rounded-lg overflow-hidden border bg-white">
                    {item.type === "video" || /video/.test(item.url) ? (
                      <video controls src={item.url} className="w-full h-28 object-cover" />
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
              <div className="text-sm text-zinc-500">Nema fajlova u galeriji.</div>
            )}
          </div>

          {/* Nova galerija */}
          <div className="mt-4">
            <label className={labelBase}>Dodaj u galeriju (slike/video)</label>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={onGallery}
              className={`${inputBase} file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:text-emerald-700`}
            />
            <p className="text-[12px] text-zinc-500 mt-2">
              Ovim <b>zamenjuješ</b> celu galeriju (server je tako podešen). Ako ne dodaš ništa, postojeća ostaje.
            </p>
          </div>
        </div>

        {/* Tekstualni delovi */}
        <div className="rounded-3xl bg-white/70 backdrop-blur border border-zinc-200 shadow p-5 space-y-4">
          <div>
            <label htmlFor="instructions" className={labelBase}>Uputstvo</label>
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
            <div className="flex items-baseline justify-between">
              <label htmlFor="ingredients" className={labelBase}>Sastojci (po redu)</label>
              <span className="text-[12px] text-zinc-500">{ingredientsCount} stavki</span>
            </div>
            <textarea
              id="ingredients"
              name="ingredients"
              value={form.ingredients}
              onChange={onChange}
              className={`${inputBase} font-mono`}
              placeholder={"Sastojak 1\nSastojak 2\nSastojak 3"}
              rows={6}
              required
            />
          </div>

          <div>
            <label htmlFor="note" className={labelBase}>Napomena (opciono)</label>
            <textarea
              id="note"
              name="note"
              value={form.note}
              onChange={onChange}
              className={`${inputBase} min-h-[100px]`}
              placeholder="Npr. koristila sam čokoladu sa 70% kakaa"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
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
