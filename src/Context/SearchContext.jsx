import React, { createContext, useContext, useState } from "react";

const SearchContext = createContext();

// Provider koji čuva globalno searchQuery i searchResults
export const SearchProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    return (
        <SearchContext.Provider
            value={{ searchQuery, setSearchQuery, searchResults, setSearchResults }}
        >
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => {
    return useContext(SearchContext);
};
