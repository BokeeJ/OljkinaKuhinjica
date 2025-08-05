
import React from "react";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { FaInstagram, FaYoutube, FaFacebook } from "react-icons/fa";

export default function KontaktInfo() {
    return (
        <motion.div
            className="max-w-4xl mx-auto my-20 px-6 py-10 rounded-3xl shadow-xl text-white flex flex-col md:flex-row items-center gap-10 backdrop-blur-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
        >
            {/* Slika */}
            <div className="w-[300px] h-[300px] rounded-full overflow-hidden border-4 border-orange-300 shadow-lg flex-shrink-0">
                <img
                    src="/OliveraSmiljanic.webp"
                    alt="Oljka"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Info */}
            <div className="space-y-4 w-full">
                <h2 className="text-3xl font-bold text-orange-300">Olivera Andrić</h2>
                <p className="text-gray-300 ">Autorka sajta i recepata • Oljkina kuhinjica</p>

                <div className="flex items-center gap-3 text-gray-200 text-l">
                    <FiMapPin className="text-orange-400" />
                    <span>Beč, Austrija / Lazarevac, Srbija</span>
                </div>
                <div className="flex items-center gap-3 text-gray-200 text-l">
                    <FiMail className="text-orange-300" />
                    <a href="mailto:oljkaj@gmail.com">Mail</a>
                </div>
                <div className="flex items-center gap-3 text-gray-200 text-l">
                    <FiPhone className="text-orange-300" />
                    <span>+43 123 456 789</span>
                </div>

                {/* Social ikonice */}
                <div className="flex gap-5 pt-4 text-2xl text-orange-300">
                    <a href="https://www.instagram.com/oljkinakucnaradionica/?hl=sr" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors">
                        <FaInstagram />
                    </a>
                    <a href="https://www.youtube.com/c/Oljkinakucnaradionica" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">
                        <FaYoutube />
                    </a>
                    <a href="https://www.facebook.com/oljka.rs" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">
                        <FaFacebook />
                    </a>
                </div>
            </div>
        </motion.div>
    );
}
