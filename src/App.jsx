import React, { useState, useEffect } from "react";
import Header from "./Components/Header";
import NavBar from "./Components/NavBar";
import { Outlet } from "react-router-dom";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  return (
    <div>
      <Header />
      <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Outlet context={{ isLoggedIn, setIsLoggedIn }} />
    </div>
  );
}

export default App;
