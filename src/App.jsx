import React, { useEffect, useState } from 'react';
import Header from './Components/Header';
import NavBar from './Components/NavBar';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearch } from './Context/SearchContext';
import SearchResults from './Components/SearchResults';
import { AuroraBackground } from "./Components/ui/aurora-background";
import { API_BASE_URL } from './config';
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const { searchQuery, setSearchResults } = useSearch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery) {
        setSearchResults([]);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/recipes`);
        const data = await res.json();

        const results = data.filter((r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchResults(results);
      } catch (error) {
        console.error("App.jsx -> GRESKA:", error);
      }
    };
    fetchResults();
  }, [searchQuery, setSearchResults]);

  return (
    <div className="relative">
      {/* Aurora pozadina */}
      <div className="fixed inset-0 -z-10">
        <AuroraBackground />
      </div>

      {/* Header + NavBar */}
      <Header />
      <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      {/* Padding zbog fixed headera */}
      <div className="pt-[72px]"> {/* prilagodi visini headera ako treba */}
        <div className="relative z-30">
          <SearchResults
            onClearInput={() => setSearchResults([])}
            isMobile={false}
            className="flex justify-center items-center flex-col bg-orange-300 transition-all absolute top-10 left-0 w-full"
          />
        </div>

        {/* Glavni sadržaj */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet context={{ isLoggedIn, setIsLoggedIn }} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
