import React, { useState } from 'react'
import SearchInput from './SearchInput';
//icons
import { RxHamburgerMenu } from "react-icons/rx";
import { FaSearch } from 'react-icons/fa';
import { IoCloseSharp } from "react-icons/io5";

function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        setShowSearch(false);
    }

    const toggleSearch = () => {
        setShowSearch(!showSearch);
        setIsOpen(false);
    }

    return (
        <div className="w-full lg:h-[150px] flex flex-col justify-center items-center relative">
            {/* Glavna traka */}
            <div className="flex justify-between items-center gap-5 lg:w-[60%] md:w-[70%] w-[80%]">
                {/* Levo - Navigacija */}
                <nav>
                    <ul className="lg:flex gap-5 m-5 hidden">
                        <li>Svi recepti</li>
                        <li>Slano</li>
                        <li>Slatko</li>
                    </ul>
                    <RxHamburgerMenu
                        onClick={toggleMenu}
                        className={`text-2xl ${isOpen ? 'hidden' : 'flex lg:hidden'}`}
                    />
                    <IoCloseSharp
                        onClick={toggleMenu}
                        className={`text-2xl ${isOpen ? 'flex lg:hidden' : 'hidden'}`}
                    />
                </nav>

                {/* Logo */}
                <div>
                    <img
                        className="lg:w-[200px] lg:h-[200px] w-[140px] h-[140px] rounded-full"
                        src="/1.svg"
                        alt="logo"
                    />
                </div>

                {/* Desno - Pretraga i dodatni linkovi */}
                <nav>
                    <FaSearch
                        className="text-2xl lg:hidden cursor-pointer"
                        onClick={toggleSearch}
                    />
                    <ul className="lg:flex hidden gap-3 m-5">
                        <li>O meni</li>
                        <li>Kontakt</li>
                        <li>Saradnja</li>
                    </ul>
                </nav>
            </div>

            <hr className="border border-black w-[80%]" />

            {/* Mini navigacija (mobilna) */}
            <div className={`absolute top-[160px] bg-red-100 w-full flex flex-col justify-center p-5 transform transition-all duration-200 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-[-100%] lg:translate-x-[-100%]'}`}>
                <ul className="gap-5 m-2">
                    <li>Svi recepti</li>
                    <li>Slano</li>
                    <li>Slatko</li>
                    <li>O meni</li>
                    <li>Kontakt</li>
                    <li>Saradnja</li>
                </ul>
            </div>

            {/* Search bar (mobilni) */}
            <div
                className={`fixed left-0 bottom-0 w-full h-[50vh] bg-red-100 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${showSearch ? 'translate-y-0' : 'translate-y-full'
                    }`}
            >
                <SearchInput />
            </div>


        </div>
    );
}

export default NavBar;
