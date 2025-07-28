import React, { useEffect, useState } from 'react';
import { RxHamburgerMenu } from "react-icons/rx";
import { FaSearch } from 'react-icons/fa';
import { IoCloseSharp } from "react-icons/io5";
import { CiHeart } from "react-icons/ci";
import { Link, NavLink, useLocation } from 'react-router-dom';
import SearchInput from './SearchInput';
import { useSearch } from "../Context/SearchContext";
import SearchResults from './SearchResults';

function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const { searchQuery, setSearchQuery } = useSearch();
    const location = useLocation();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        setShowSearch(false);
    };

    const toggleSearch = () => {
        setShowSearch(!showSearch);
        setIsOpen(false);
    };

    useEffect(() => {
        setShowSearch(false);
    }, [location]);

    return (
        <div className="w-full lg:h-[200px] flex flex-col justify-center items-center relative text-white   z-50">
            {/* Favorites bar */}
            <div
                className={`w-full h-[300px] top-0 left-0 absolute backdrop-blur-xl transition-transform duration-300 ease-in-out flex justify-between ${showSearch ? 'translate-y-0 lg:translate-y-[-100%]' : 'translate-y-[-100%]'}`}>
                <Link onClick={() => setShowSearch(false)} to={'/favorites'}>
                    <div className='flex p-5 items-center gap-2'>
                        <CiHeart size={28} />
                        <h5>Favorites</h5>
                    </div>
                </Link>
                <div className='flex p-5 items-center gap-2'>
                    <IoCloseSharp
                        className={`text-2xl lg:hidden cursor-pointer ${showSearch ? 'flex' : 'hidden'}`}
                        onClick={toggleSearch}
                    />
                    <h5>Zatvori</h5>
                </div>
            </div>

            {/* Main bar */}
            <div className="flex lg:justify-center justify-between items-center lg:w-[60%] md:w-[70%] w-[80%] py-4">
                <nav>
                    <ul className="lg:flex gap-6 m-5 hidden text-lg">
                        <NavLink to="/sviRecepti" className="hover:text-orange-400 transition">Recepti</NavLink>
                        <NavLink to="/saradnja" className="hover:text-orange-400 transition">Saradnja</NavLink>
                    </ul>
                    <RxHamburgerMenu
                        onClick={toggleMenu}
                        className={`text-2xl cursor-pointer ${isOpen ? 'hidden' : 'flex lg:hidden'}`}
                    />
                    <IoCloseSharp
                        onClick={toggleMenu}
                        className={`text-2xl cursor-pointer ${isOpen ? 'flex lg:hidden' : 'hidden'}`}
                    />
                </nav>

                {/* Logo */}
                <div>
                    <Link to={'/'}>
                        <img
                            className="lg:w-[200px] lg:h-[200px] w-[140px] h-[140px] "
                            src="/logoOljka.png"
                            alt="logo"
                        />
                    </Link>
                </div>

                {/* Right menu */}
                <nav>
                    <FaSearch
                        className={`text-2xl lg:hidden cursor-pointer ${showSearch ? 'hidden' : 'flex'}`}
                        onClick={toggleSearch}
                    />
                    <IoCloseSharp
                        className={`text-2xl lg:hidden cursor-pointer ${showSearch ? 'flex' : 'hidden'}`}
                        onClick={toggleSearch}
                    />
                    <ul className="lg:flex hidden gap-6 m-5 text-lg">
                        <NavLink to="/omeni" className="hover:text-orange-400 transition">O meni</NavLink>
                        <NavLink to="/kontakt" className="hover:text-orange-400 transition">Kontakt</NavLink>
                    </ul>
                </nav>
            </div>

            {/* Mobile menu */}
            <div
                className={`absolute top-[140px] backdrop-blur-2xl w-full flex flex-col justify-center p-5 transform transition-all duration-200 ease-in-out z-40 ${isOpen ? 'translate-x-0 lg:translate-x-[-100%]' : 'translate-x-[-100%]'}`}>
                <ul className="gap-5 m-2 flex flex-col text-lg">
                    <NavLink to="/sviRecepti" className="hover:text-orange-400 transition">Recepti</NavLink>
                    <NavLink to="/omeni" className="hover:text-orange-400 transition">O meni</NavLink>
                    <NavLink to="/kontakt" className="hover:text-orange-400 transition">Kontakt</NavLink>
                    <NavLink to="/saradnja" className="hover:text-orange-400 transition">Saradnja</NavLink>
                </ul>
            </div>

            {/* Mobile search */}
            {showSearch && (
                <div className="fixed inset-0 z-[999] lg:hidden flex flex-col">
                    {/* Gornjih 50% */}
                    <div className="h-1/2 bg-gray-900/95 px-4 py-6 flex flex-col justify-start gap-4 mt-10">
                        {/* Favorites i Zatvori */}
                        <div className="flex flex-col items-center">
                            <div className='flex justify-between w-full'>
                                <div>
                                    <Link onClick={toggleSearch} to="/favorites" className="flex items-center gap-2 text-white">
                                        <CiHeart size={24} />
                                        <h5>Favorites</h5>
                                    </Link>
                                </div>

                                <div className="flex items-center gap-2 cursor-pointer text-white" onClick={toggleSearch}>
                                    <IoCloseSharp className="text-2xl" />
                                    <h5>Zatvori</h5>
                                </div>
                            </div>

                            <SearchInput
                                color="orange"
                                className="border border-orange-400 bg-gray-800 text-white placeholder:text-orange-300 p-2 rounded-2xl w-full focus:outline-none focus:ring focus:ring-orange-300 bottom-0 "
                                placeholder="Pretraži recept..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Search input */}

                    </div>

                    {/* Donjih 50% – Rezultati */}
                    <div className="h-1/2 bg-gray-800 overflow-y-auto p-4">
                        <SearchResults
                            onClearInput={() => setSearchQuery('')}
                            onResultClick={toggleSearch}
                            isMobile
                            className="w-full"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default NavBar;
