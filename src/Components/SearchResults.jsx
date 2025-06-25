import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../Context/SearchContext';
import { LuCakeSlice } from 'react-icons/lu';

function SearchResults({
    onResultClick,
    onClearInput,
    isMobile,
    className = '',
}) {
    const { searchResults } = useSearch();
    const navigate = useNavigate();



    if (!searchResults.length) return null;

    const handleResultClick = (url) => {
        if (typeof onClearInput === 'function') {
            onClearInput();
        }


        if (typeof onResultClick === 'function') {
            onResultClick();
        }


        navigate(url);
    };

    return (
        <div
            className={`
                ${className}
                ${isMobile ? 'lg:hidden' : 'hidden lg:block'}
                 absolute top-10 left-0 w-full rounded-xl z-50 
            `}>
            {searchResults.map((r) => (
                <div
                    key={r._id}
                    className='block p-2 hover:text-xl transition-all duration-200 flex gap-3 justify-center items-center cursor-pointer'
                    onClick={() => handleResultClick(`/recept/${r._id}`)}>
                    {r.title}
                    <LuCakeSlice color='orange' />
                </div>
            ))}
        </div>
    );
}

export default SearchResults;
