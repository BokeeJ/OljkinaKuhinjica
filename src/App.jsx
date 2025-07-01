import React, { useEffect, useState } from 'react';
import Header from './Components/Header';
import NavBar from './Components/NavBar';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearch } from './Context/SearchContext';
import SearchResults from './Components/SearchResults';
import YouTubeMusic from './Pages/YouTubeMusic';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const { searchQuery, setSearchResults } = useSearch();


  useEffect(() => {
    // Provera tokena pri mountovanju
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

        const res = await fetch("http://localhost:5050/api/recipes");
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
      <Header />
      <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <YouTubeMusic />
      <div
      >
        <SearchResults
          onClearInput={() => {

            setSearchResults([]);
          }}

          isMobile={false}
          className="flex justify-center items-center flex-col z-50 bg-orange-300 ease-in-out duration-300 transition-all transition-transform top-10 left-0 absolute w-full"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          className='mt-6'
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
  );
}

export default App;
