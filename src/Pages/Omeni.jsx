"use client";
import React from "react";
import { motion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";

function OMeni() {
    return (
        <motion.div
            className="p-6 flex flex-col lg:flex-row items-center justify-center rounded-2xl max-w-6xl mx-auto my-16 bg-gradient-to-br backdrop-blur-lg text-white shadow-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {/* Leva strana - slika */}
            <motion.div
                className="w-full lg:w-1/2 p-4"
                initial={{ scale: 0.95 }}
                whileHover={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
            >
                <img
                    src="/kuhinja.webp"
                    alt="Hrana i kuhinja"
                    className="rounded-2xl shadow-lg object-cover w-full h-[300px] lg:h-[400px] transition-all duration-300"
                />
            </motion.div>

            {/* Desna strana - tekst */}
            <div className="lg:w-1/2 w-full p-4 space-y-6">
                <h2 className="text-4xl font-extrabold text-orange-400 drop-shadow-sm">
                    O meni
                </h2>

                <p className="text-lg text-gray-200 leading-relaxed">
                    Veliki pozdrav! Preporučujem da probate moje recepte.
                    Može da bude i zabavno, ali će sigurno biti korisno.
                </p>

                <p className="text-gray-300">
                    Moje ime je <span className="font-bold text-white">Olivera Andrić</span>. Rođena sam 09.08.1967. godine u Lazarevcu.
                    U ovom divnom gradu, punom istorije, živela sam 48 godina. U januaru 2016. godine, preselila sam se u Beč.
                    Trenutno živim svoj san.
                </p>

                <div className="relative bg-zinc-700/40 p-4 rounded-xl border-l-4 border-orange-400 text-gray-100 italic shadow-inner">
                    <FaQuoteLeft className="absolute -top-3 -left-3 text-orange-400 text-2xl" />
                    “Sve što ti se dešava u životu, dešava se za tvoje najveće dobro.”
                </div>

                <p className="text-gray-300">
                    Obožavam narodne poslovice (svih naroda sveta) i često ih u razgovoru koristim. Evo jedne, shodno ovoj prilici:
                </p>

                <div className="relative bg-zinc-700/40 p-4 rounded-xl border-l-4 border-orange-400 text-gray-100 italic shadow-inner">
                    <FaQuoteLeft className="absolute -top-3 -left-3 text-orange-400 text-2xl" />
                    “Daj čoveku kolač, zasladićeš mu dan. Nauči ga da pravi kolače i zasladićeš mu ceo život.”
                </div>
            </div>
        </motion.div>
    );
}

export default OMeni;
