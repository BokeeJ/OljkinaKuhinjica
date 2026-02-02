"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, X } from "lucide-react";

import { SECTIONS_BY_CATEGORY, SUBS_BY_SECTION } from "../constants/taxonomy";
import { displaySub, canon } from "../utils/text"; // ⬅️ canon samo za poređenje (ne za URL)

/* ---------- UI helpers ---------- */
function Tab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm transition shadow-sm ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-white/80 border border-zinc-300 text-zinc-800 hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

function Pill({ active, onClick, children, caret = null, subtle = false }) {
  const base = subtle
    ? active
      ? "bg-pink-500 text-white"
      : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
    : active
    ? "bg-emerald-600 text-white"
    : "bg-white/90 border border-zinc-300 text-zinc-800 hover:bg-white";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm transition inline-flex items-center gap-1.5 ${base}`}
    >
      <span>{children}</span>
      {caret}
    </button>
  );
}

function Chip({ children, onClear }) {
  return (
    <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm">
      {children}
      <button
        type="button"
        className="text-white/90 hover:text-white"
        onClick={onClear}
        aria-label="Ukloni filter"
      >
        <X size={14} />
      </button>
    </span>
  );
}

/* ---------- util ---------- */
const hasSubs = (section) =>
  Array.isArray(SUBS_BY_SECTION[section]) && SUBS_BY_SECTION[section].length > 0;

const isShowAllSub = (sub) =>
  typeof sub === "string" && /^(svi|sve)\s/i.test(sub); // "Svi kolaci" / "Sve torte"

const trimv = (v) => (typeof v === "string" ? v.trim() : v);

const splitCsv = (raw) =>
  String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/* ========================================================= */
export default function RecipeFilterClick() {
  const [sp, setSp] = useSearchParams();

  // URL state
  const category = (sp.get("category") || "").toLowerCase(); // "", "slano", "slatko"
  const section = sp.get("section") || "";

  // MULTI: "a,b,c"
  const subRaw = sp.get("subcategory") || "";
  const subArr = useMemo(() => splitCsv(subRaw), [subRaw]);

  // set za brzu proveru (kanonski, radi stabilnije)
  const selectedSubSet = useMemo(() => new Set(subArr.map((s) => canon(s))), [subArr]);

  // aktivni tab prati URL
  const [activeTab, setActiveTab] = useState(category || "");
  useEffect(() => setActiveTab(category || ""), [category]);

  // collapse: podsekcije imaju samo Rucak/Kolaci/Torte
  const [openMap, setOpenMap] = useState({ Rucak: false, Kolaci: false, Torte: false });
  useEffect(() => {
    setOpenMap({
      Rucak: category === "slano" && section === "Rucak",
      Kolaci: category === "slatko" && section === "Kolaci",
      Torte: category === "slatko" && section === "Torte",
    });
  }, [category, section]);

  /* ------ helpers ------ */
  const ensureCategoryForSection = (sec) => {
    if (SECTIONS_BY_CATEGORY.slano.includes(sec)) return "slano";
    if (SECTIONS_BY_CATEGORY.slatko.includes(sec)) return "slatko";
    return category || "";
  };

  /* ------ URL setter (SVE U JEDNOM POZIVU) ------ */
  const setParams = (patch = {}) => {
    const next = new URLSearchParams(sp);

    for (const [k, v] of Object.entries(patch)) {
      const t = trimv(v);
      if (t == null || t === "") next.delete(k);
      else next.set(k, t);
    }

    // reset page uvek
    next.set("page", "1");
    setSp(next, { replace: true });
  };

  const setOnly = (obj) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(obj)) {
      const t = trimv(v);
      if (t != null && t !== "") next.set(k, t);
    }
    next.set("page", "1");
    setSp(next, { replace: true });
  };

  const clearSection = () => {
    setParams({ section: "", subcategory: "" });
    setOpenMap({ Rucak: false, Kolaci: false, Torte: false });
  };

  const resetAll = () => {
    setOnly({});
    setActiveTab("");
    setOpenMap({ Rucak: false, Kolaci: false, Torte: false });
  };

  /* ------ Tabs ------ */
  const pickTab = (tab) => {
    setActiveTab(tab);
    if (!tab) return resetAll();

    // menjamo samo kategoriju, brišemo sekciju i subove
    setOnly({ category: tab });
  };

  /* ------ Klikovi za sekcije/subove ------ */
  const clickSection = (_cat, secRaw) => {
    const sec = trimv(secRaw);
    const catFromSec = ensureCategoryForSection(sec);
    const finalCat = _cat || catFromSec || "slano";

    if (activeTab !== finalCat) setActiveTab(finalCat);

    if (hasSubs(sec)) {
      // category + section, reset subove; otvori samo taj collapse
      setParams({ category: finalCat, section: sec, subcategory: "" });
      setOpenMap({ Rucak: false, Kolaci: false, Torte: false, [sec]: true });
      return;
    }

    // sekcija bez subova
    setOpenMap({ Rucak: false, Kolaci: false, Torte: false });
    setOnly({ category: finalCat, section: sec });
  };

  // ✅ MULTI toggle
  const clickSub = (_cat, secRaw, subRawLabel) => {
    const sec = trimv(secRaw);
    const subLabel = trimv(subRawLabel);
    const finalCat = _cat || ensureCategoryForSection(sec) || "slano";

    if (isShowAllSub(subLabel)) {
      setOnly({ category: finalCat, section: sec });
      return;
    }

    const current = splitCsv(sp.get("subcategory"));
    const subC = canon(subLabel);
    const exists = current.some((x) => canon(x) === subC);

    const updated = exists ? current.filter((x) => canon(x) !== subC) : [...current, subLabel];

    // upiši nazad kao "a,b,c"
    setOnly({
      category: finalCat,
      section: sec,
      subcategory: updated.length ? updated.join(",") : "",
    });
  };

  /* ------ Label (lep prikaz) ------ */
  const label = useMemo(() => {
    const head = category ? category.toUpperCase() : "SVE";
    if (!category && !section) return "Filtriraj recepte";

    const niceSubs =
      section && subArr.length ? subArr.map((s) => displaySub(section, s)).join(" + ") : "";

    if (section && niceSubs) return `${head} • ${section} • ${niceSubs}`;
    if (section) return `${head} • ${section}`;
    return head;
  }, [category, section, subArr]);

  /* ------ Render ------ */
  return (
    <div className="space-y-3">
      {/* traka: label + reset */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-700">{label}</span>
        <button
          type="button"
          onClick={resetAll}
          className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
        >
          <X size={14} /> Reset filtera
        </button>
      </div>

      {/* tabovi */}
      <div className="flex flex-wrap gap-2">
        <Tab active={activeTab === ""} onClick={() => pickTab("")}>
          Sve
        </Tab>
        <Tab active={activeTab === "slano"} onClick={() => pickTab("slano")}>
          Slano
        </Tab>
        <Tab active={activeTab === "slatko"} onClick={() => pickTab("slatko")}>
          Slatko
        </Tab>
      </div>

      {/* SLANO */}
      {activeTab === "slano" && (
        <SectionBlock
          cat="slano"
          sections={SECTIONS_BY_CATEGORY.slano}
          openMap={openMap}
          onClickSection={clickSection}
          onClickSub={clickSub}
          sectionActive={(sec) => category === "slano" && section === sec}
          subActive={(subLabel) => category === "slano" && selectedSubSet.has(canon(subLabel))}
        />
      )}

      {/* SLATKO */}
      {activeTab === "slatko" && (
        <SectionBlock
          cat="slatko"
          sections={SECTIONS_BY_CATEGORY.slatko}
          openMap={openMap}
          onClickSection={clickSection}
          onClickSub={clickSub}
          sectionActive={(sec) => category === "slatko" && section === sec}
          subActive={(subLabel) => category === "slatko" && selectedSubSet.has(canon(subLabel))}
        />
      )}

      {/* aktivni čipovi */}
      <div className="flex flex-wrap gap-2">
        {category && <Chip onClear={() => setParams({ category: "" })}>category: {category}</Chip>}

        {section && <Chip onClear={clearSection}>section: {section}</Chip>}

        {/* ✅ prikaz više subova kao više chip-ova */}
        {section &&
          subArr.map((s) => (
            <Chip
              key={s}
              onClear={() => {
                // ukloni baš taj sub
                const updated = subArr.filter((x) => canon(x) !== canon(s));
                setOnly({
                  category,
                  section,
                  subcategory: updated.length ? updated.join(",") : "",
                });
              }}
            >
              sub: {displaySub(section, s)}
            </Chip>
          ))}
      </div>
    </div>
  );
}

/* ---------- Sekcija blok (lista sekcija + collapse za podsekcije) ---------- */
function SectionBlock({ cat, sections, openMap, onClickSection, onClickSub, sectionActive, subActive }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {sections.map((sec) => {
          const active = sectionActive(sec);
          const caret = hasSubs(sec)
            ? openMap[sec]
              ? <ChevronUp size={14} />
              : <ChevronDown size={14} />
            : null;

          return (
            <Pill key={sec} active={active} onClick={() => onClickSection(cat, sec)} caret={caret}>
              {sec}
            </Pill>
          );
        })}
      </div>

      {/* collapses samo za sekcije sa subovima */}
      {sections.map((sec) =>
        hasSubs(sec) ? (
          <AnimatePresence key={sec} initial={false}>
            {openMap[sec] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="mt-1 flex flex-wrap gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-2">
                  {SUBS_BY_SECTION[sec].map((subLabel) => (
                    <Pill
                      key={subLabel}
                      active={subActive(subLabel)}
                      onClick={() => onClickSub(cat, sec, subLabel)}
                      subtle
                    >
                      {displaySub(sec, subLabel)}
                    </Pill>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ) : null
      )}
    </div>
  );
}
