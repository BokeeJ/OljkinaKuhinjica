import { FaSearch } from 'react-icons/fa';
import React from 'react';

function SearchInput({ value, onChange, placeholder, className, color, onClick }) {
    return (
        <div className={`flex items-center bg-transparent w-full h-full ${className || ''}`} >
            <FaSearch color={color || 'gray'} className="text-gray-400 mr-2" />
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder || 'Pretraži recept...'}
                className="outline-none bg-transparent text-black w-full"
            />
        </div>
    );
}

export default SearchInput;
