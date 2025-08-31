import React from 'react';
import SearchInput from './SearchInput';
import SocialNetwork from './SocialNetwork';
import { useSearch } from "../Context/SearchContext";
import QuickSearch from './QuickSearch';

function Header() {
    const { searchQuery, setSearchQuery } = useSearch();

    return (
        <header className="absolute top-0 left-0 w-full z-100 bg-transparent pointer-events-auto lg:block  hidden">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                <div className="lg:flex hidden">
                    <QuickSearch />
                </div>
                <div className="p-2 text-white">
                    <SocialNetwork />
                </div>
            </div>
        </header>
    );
}

export default Header;
