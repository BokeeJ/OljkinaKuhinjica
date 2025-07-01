import React, { createContext, useContext, useState, useEffect } from "react";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [allRecipes, setAllRecipes] = useState([]);

    // Fetch recepata iz baze (pozivaš jednom)
    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const res = await fetch("https://kuhinjica-backend-1.onrender.com/api/recipes"); // prilagodi ako drugačije zoveš rutu
                const data = await res.json();
                setAllRecipes(data);
            } catch (error) {
                console.error("Greška pri učitavanju recepata:", error);
            }
        };

        fetchRecipes();
    }, []);

    // Filtriranje kad korisnik kuca
    useEffect(() => {
        if (!searchQuery) {
            setSearchResults([]);
            return;
        }

        const filtered = allRecipes.filter((r) =>
            r.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchResults(filtered);
    }, [searchQuery, allRecipes]);

    return (
        <SearchContext.Provider
            value={{ searchQuery, setSearchQuery, searchResults, setSearchResults }}
        >
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => useContext(SearchContext);
