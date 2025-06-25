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
        const checkToken = () => {
            const token = localStorage.getItem('token');
        };
        checkToken();
        window.addEventListener('storage', checkToken);
        return () => window.removeEventListener('storage', checkToken);
    }, []);

    // 👇 ZATVARA pretragu kada se promeni ruta
    useEffect(() => {
        setShowSearch(false);
    }, [location]);

    return (
        <div className="w-full lg:h-[150px] flex flex-col justify-center items-center relative">
            {/* Favorites bar */}
            <div
                className={`w-full h-[300px] top-0 left-0 absolute backdrop-blur-xl transition-transform duration-300 ease-in-out flex justify-between ${showSearch ? 'translate-y-0 lg:translate-y-[-100%]' : 'translate-y-[-100%]'}`} >
                <Link
                    onClick={() => setShowSearch(false)}
                    to={'/favorites'}>
                    <div className='flex p-5'>
                        <CiHeart size={30} /><h5>Favorites</h5>
                    </div>
                </Link>
                <div className='flex p-5'>
                    <IoCloseSharp
                        className={`text-2xl lg:hidden cursor-pointer ${showSearch ? 'flex' : 'hidden'}`}
                        onClick={toggleSearch}
                    />
                    <h5>Zatvori</h5>
                </div>
            </div>

            {/* Main bar */}
            <div className="flex lg:justify-center justify-between items-center lg:w-[60%] md:w-[70%] w-[80%]">
                <nav>
                    <ul className="lg:flex gap-5 m-5 hidden text-l">
                        <NavLink to="/sviRecepti">Recepti</NavLink>
                        <NavLink to="/saradnja">Saradnja</NavLink>
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
                            className="lg:w-[200px] lg:h-[200px] w-[140px] h-[140px] rounded-full"
                            src="/1.svg"
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
                    <ul className="lg:flex hidden gap-3 m-5">
                        <NavLink to="/omeni">O meni</NavLink>
                        <NavLink to="/kontakt">Kontakt</NavLink>
                    </ul>
                </nav>
            </div>

            <hr className="border border-black w-[80%]" />

            {/* Mobile menu */}
            <div
                className={`absolute top-[140px] backdrop-blur-3xl w-full flex flex-col justify-center p-5 transform transition-all duration-200 ease-in-out z-50 ${isOpen ? 'translate-x-0 lg:translate-x-[-100%]' : 'translate-x-[-100%]'}`} >
                <ul className="gap-5 m-2 flex flex-col">
                    <NavLink to="/sviRecepti">Recepti</NavLink>
                    <NavLink to="/omeni">O meni</NavLink>
                    <NavLink to="/kontakt">Kontakt</NavLink>
                    <NavLink to="/saradnja">Saradnja</NavLink>
                </ul>
            </div>

            {/* Mobile search */}
            {showSearch && (
                <div className={`fixed left-0 bottom-0 w-full h-[50vh] bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden`}>
                    <div className="p-4">
                        <SearchInput
                            color={'orange'}
                            className="border p-2 rounded-2xl text-orange-300 w-full"
                            placeholder="Pretraži recept..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                            }}
                        />

                        <SearchResults
                            onClearInput={() => {

                                setSearchQuery('');
                            }}
                            onResultClick={toggleSearch}
                            isMobile
                            className='flex justify-center bg-green-50 z-50 items-center flex-col mt-5'
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default NavBar;
