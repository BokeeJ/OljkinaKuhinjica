import React from 'react';
import SearchInput from './SearchInput';
import SocialNetwork from './SocialNetwork';
import { useSearch } from "../Context/SearchContext";

function Header() {
    const { searchQuery, setSearchQuery } = useSearch();

    return (
        <div className='bg-orange-100 w-full z-50 relative'>
            <div className='max-w-7xl mx-auto px-4 h-full flex items-center justify-between'>
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
        </div>
    );
}

export default Header;
