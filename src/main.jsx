import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Pages & Components
import Kontakt from './Pages/Kontakt.jsx';
import Omeni from './Pages/Omeni.jsx';
import Saradnja from './Pages/Saradnja.jsx';
import Slani from './Pages/Slani.jsx';
import Slatki from './Pages/Slatki.jsx';
import SviRecepti from './Pages/SviRecepti.jsx';
import AdminPanel from './Components/AdminPanel.jsx';
import AdminLogin from './Components/AdminLogin.jsx';
import ReceptDetalji from './Pages/ReceptDetalj.jsx';
import PopularniRecepti from './Pages/PopularniRecepti.jsx';
import MyFavorites from './Pages/MyFavorites.jsx';
import { SearchProvider } from './Context/SearchContext';
import Pocetna from './Pages/Pocetna.jsx';
import IzmeniRecept from './Pages/IzmeniRecept.jsx';
import PrivateRoute from './Components/PrivateRoute.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Početna kao index ruta
      { index: true, element: <Pocetna /> },

      // Javne stranice
      { path: 'kontakt', element: <Kontakt /> },
      { path: 'omeni', element: <Omeni /> },
      { path: 'saradnja', element: <Saradnja /> },
      { path: 'slani', element: <Slani /> },
      { path: 'slatki', element: <Slatki /> },

      // Lista recepata
      { path: 'recepti', element: <SviRecepti /> },

      // Detalj recepta
      { path: 'recept/:id', element: <ReceptDetalji /> },

      // Dodatne javne
      { path: 'popularni', element: <PopularniRecepti /> },
      { path: 'favorites', element: <MyFavorites /> },

      // Admin login (javna)
      { path: 'admin/login', element: <AdminLogin /> },

      // Admin (zaštićeno)
      {
        path: 'admin',
        element: <PrivateRoute />, // renderuje <Outlet/>
        children: [
          { index: true, element: <AdminPanel /> },
          { path: 'izmeni-recept/:id', element: <IzmeniRecept /> }, // ⬅️ zaštićena izmena
          // ovde dodaj i ostale admin podstranice (dodaj, lista, itd.)
        ]
      },

      // (Opcionalno) Stara javna staza za izmenu – zadrži dok ne prebaciš sve linkove
      { path: 'izmeni-recept/:id', element: <IzmeniRecept /> },
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SearchProvider>
      <RouterProvider router={router} />
    </SearchProvider>
  </StrictMode>
);
