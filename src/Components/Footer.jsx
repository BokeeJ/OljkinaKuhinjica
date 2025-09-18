import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";

function Footer() {
    const year = new Date().getFullYear();

    const socials = [
        {
            label: "Instagram",
            href: "https://www.instagram.com/oljkinakucnaradionica/?hl=sr",
            icon: FaInstagram,
            ring: "ring-pink-300/50",
            hover: "hover:bg-pink-600",
            aria: "Poseti Oljkin Instagram",
        },
        {
            label: "Facebook",
            href: "https://www.facebook.com/oljka.rs",
            icon: FaFacebook,
            ring: "ring-blue-300/50",
            hover: "hover:bg-blue-600",
            aria: "Poseti Oljkin Facebook",
        },
        {
            label: "YouTube",
            href: "https://www.youtube.com/c/Oljkinakucnaradionica",
            icon: FaYoutube,
            ring: "ring-red-300/50",
            hover: "hover:bg-red-600",
            aria: "Poseti Oljkin YouTube kanal",
        },
    ];

    return (
        <footer className="relative mt-16 text-gray-300">


            {/* BG gradient + soft glow */}
            <div className="relative ">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute -top-12 left-8 h-40 w-40 bg-emerald-500/10 blur-3xl rounded-full" />
                    <div className="absolute bottom-0 right-10 h-40 w-56 bg-orange-400/10 blur-3xl rounded-full" />
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 py-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
                        {/* Brand */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <Link to={'/'}>
                                <img
                                    src="/logoOljka.png"
                                    alt="Oljka — logo sajta Oljkina Kuhinjica"
                                    loading="lazy"
                                    width={220}
                                    height={220}
                                    className="w-40 h-40 object-contain drop-shadow-lg"
                                />
                            </Link>
                            <p className="mt-4 text-sm text-gray-400 max-w-xs">
                                Domaći recepti, provereni saveti i mnogo ljubavi prema kuvanju. Uživaj u ukusima!
                            </p>
                        </div>

                        {/* Quick links */}
                        <nav aria-label="Sekcije sajta" className="flex flex-col items-center md:items-start">
                            <h2 className="text-orange-300 font-extrabold text-2xl mb-4">Recepti</h2>
                            <ul className="space-y-2 text-[15px]">
                                <li>
                                    <Link
                                        to="/recepti"
                                        className="group inline-flex items-center gap-2 hover:text-orange-300 transition-colors"
                                    >
                                        <span>Svi recepti</span>
                                        <span className="h-px w-0 bg-orange-300 transition-all duration-300 group-hover:w-8" />
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/popularni"
                                        className="group inline-flex items-center gap-2 hover:text-orange-300 transition-colors"
                                    >
                                        <span>Najpopularniji</span>
                                        <span className="h-px w-0 bg-orange-300 transition-all duration-300 group-hover:w-8" />
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/favorites"
                                        className="group inline-flex items-center gap-2 hover:text-orange-300 transition-colors"
                                    >
                                        <span>Omiljeni</span>
                                        <span className="h-px w-0 bg-orange-300 transition-all duration-300 group-hover:w-8" />
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        {/* Socials */}
                        <div className="flex flex-col items-center md:items-start">
                            <h2 className="text-orange-300 font-extrabold text-2xl mb-4">Pratite Oljku</h2>
                            <div className="flex items-center gap-3">
                                {socials.map(({ label, href, icon: Icon, ring, hover, aria }) => (
                                    <motion.a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={aria}
                                        whileHover={{ y: -2, scale: 1.04 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/5 ${hover} transition-colors ring-1 ${ring}`}
                                        title={label}
                                    >
                                        <Icon className="text-xl" />
                                    </motion.a>
                                ))}
                            </div>

                            {/* Small tagline */}
                            <p className="mt-4 text-xs text-gray-400 max-w-xs text-center md:text-left">
                                Prvo miris, pa ukus — a onda recept u omiljene. 🍰
                            </p>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-10 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                        <p>© {year} Oljkina Kuhinjica — sva prava zadržana.</p>
                        <div className="flex items-center gap-4">
                            <h6 className='text-[13px]'>
                                <span className='text-[13px] text-orange-300'>Designed by </span><a href="https://www.instagram.com/bojan_dsgn/" target="_blank" rel="noreferrer" className='text-orange-100 hover:underline'>BojanDsgn.</a>
                            </h6>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
