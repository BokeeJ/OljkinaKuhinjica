"use client";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FaQuoteLeft, FaMapMarkerAlt, FaHeart, FaUtensils } from "react-icons/fa";
import { Link } from "react-router-dom";

const container = (rm) => ({
    hidden: { opacity: 0, y: rm ? 0 : 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.08 }
    }
});

const item = (rm) => ({
    hidden: { opacity: 0, y: rm ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
});

export default function OMeni() {
    const reduceMotion = useReducedMotion();

    return (
        <section
            aria-labelledby="o-meni-naslov"
            className="relative mx-auto my-16 max-w-6xl px-4"
        >
            {/* Dekor: blur blobs u pozadini */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-10 -left-10 h-52 w-52 rounded-full bg-orange-400/30 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
            </div>

            <motion.div
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-800/70 to-zinc-700/60 p-[1.5px] shadow-2xl backdrop-blur"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                variants={container(reduceMotion)}
            >
                {/* gradient border */}
                <div className="rounded-2xl bg-zinc-900/60">
                    <div className="grid items-stretch grid-cols-1 gap-6 p-6 md:grid-cols-12 md:gap-8 md:p-8 lg:p-10 md:min-h-[560px] lg:min-h-[620px]">
                        {/* Levo: slika — full height na ≥ md */}
                        <motion.figure
                            className="group relative overflow-hidden rounded-2xl z-0
                         aspect-[4/3] md:aspect-auto md:h-full md:self-stretch md:col-span-5"
                            variants={item(reduceMotion)}
                            whileHover={reduceMotion ? {} : { rotateX: 2, rotateY: -2, scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 120, damping: 12 }}
                        >
                            <img
                                src="/olivera2.webp"
                                alt="Kuhinja i spremanje hrane"
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-xs text-white/90">
                                Zavirite u moju kuhinju — mesto gde nastaju recepti.
                            </figcaption>
                        </motion.figure>

                        {/* Desno: sadržaj */}
                        <div className="md:col-span-7 flex flex-col">
                            <motion.header variants={item(reduceMotion)} className="mb-3">
                                <h1
                                    id="o-meni-naslov"
                                    className="text-balance text-3xl font-extrabold tracking-tight text-orange-400 md:text-4xl"
                                >
                                    O meni
                                </h1>
                                <p className="mt-2 max-w-prose text-sm text-zinc-300">
                                    Zdravo! Ja sam Olivera — zaljubljenik u domaću kuhinju. Moji recepti su
                                    proverenog ukusa i jasnog postupka, tako da uvek uspevaju.
                                </p>
                            </motion.header>

                            {/* Quote 1 */}
                            <motion.blockquote
                                variants={item(reduceMotion)}
                                className="relative my-3 rounded-xl border-l-4 border-orange-400 bg-zinc-800/60 p-4 text-zinc-100 shadow-inner"
                            >
                                <FaQuoteLeft className="absolute -top-3 -left-3 text-2xl text-orange-400" aria-hidden="true" />
                                <p className="italic">
                                    “Sve što ti se dešava u životu, dešava se za tvoje najveće dobro.”
                                </p>
                            </motion.blockquote>

                            {/* Tekst */}
                            <motion.div variants={item(reduceMotion)} className="space-y-3">
                                <p className="text-pretty text-zinc-200">
                                    Zovem se <span className="font-semibold text-white">Olivera Andrić</span>.
                                    Rođena u Lazarevcu, 48 godina života u tom divnom gradu, a od 2016. živim u Beču —
                                    i uživam u kuvanju jednako kao prvog dana.
                                </p>
                                <p className="text-zinc-300">
                                    Volim narodne poslovice i često ih koristim. Evo jedne baš za ovu priliku:
                                </p>
                            </motion.div>

                            {/* Quote 2 */}
                            <motion.blockquote
                                variants={item(reduceMotion)}
                                className="relative my-2 rounded-xl border-l-4 border-orange-400 bg-zinc-800/60 p-4 text-zinc-100 shadow-inner"
                            >
                                <FaQuoteLeft className="absolute -top-3 -left-3 text-2xl text-orange-400" aria-hidden="true" />
                                <p className="italic">
                                    “Daj čoveku kolač — zasladićeš mu dan. Nauči ga da pravi kolače — zasladićeš mu ceo život.”
                                </p>
                            </motion.blockquote>

                            {/* Stat kartice */}
                            <motion.ul
                                variants={item(reduceMotion)}
                                className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3"
                                aria-label="Zanimljivosti"
                            >
                                <li className="flex items-center gap-2 rounded-lg bg-zinc-800/60 p-3 text-zinc-200">
                                    <FaMapMarkerAlt className="text-orange-400" aria-hidden="true" />
                                    <span>Beč • Lazarevac</span>
                                </li>
                                <li className="flex items-center gap-2 rounded-lg bg-zinc-800/60 p-3 text-zinc-200">
                                    <FaUtensils className="text-orange-400" aria-hidden="true" />
                                    <span>Slano &amp; slatko</span>
                                </li>
                                <li className="flex items-center gap-2 rounded-lg bg-zinc-800/60 p-3 text-zinc-200">
                                    <FaHeart className="text-orange-400" aria-hidden="true" />
                                    <span>Recepti sa merom</span>
                                </li>
                            </motion.ul>

                            {/* CTA dugmad */}
                            <motion.div
                                variants={item(reduceMotion)}
                                className="mt-6 flex flex-wrap gap-3"
                                aria-label="Brzi linkovi"
                            >
                                <Link
                                    to="/sviRecepti"
                                    className="inline-flex items-center rounded-full bg-orange-300 px-4 py-2 text-sm font-medium text-white shadow hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                                >
                                    Pogledaj recepte
                                </Link>
                                <Link
                                    to="/popularni"
                                    className="inline-flex items-center rounded-full bg-zinc-200/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15 hover:bg-zinc-200/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                                >
                                    Najpopularniji
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
