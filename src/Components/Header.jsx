// Header.jsx
import React from 'react';
import SearchInput from './SearchInput';
import SocialNetwork from './SocialNetwork';
import { useSearch } from "../Context/SearchContext";

function Header() {
    const { searchQuery, setSearchQuery } = useSearch();

    return (
        <div className='bg-green-100 w-full h-full flex items-center justify-around relative z-[9999]'>
            <div className='lg:flex hidden'>
                <SearchInput
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pretraži recept..."
                    color="orange"
                />
            </div>
            <div className='p-2'>
                <SocialNetwork />
            </div>
        </div>
    );
}

export default Header;
