import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
//Components and pages

import Kontakt from './Pages/Kontakt.jsx';
import Omeni from './Pages/Omeni.jsx';
import Saradnja from './Pages/Saradnja.jsx';
import Slani from './Pages/Slani.jsx';
import Slatki from './Pages/Slatki.jsx';
import SviRecepti from './Pages/SviRecepti.jsx';
import DodajRecept from './Pages/DodajRecept.jsx';
import AdminPanel from './Components/AdminPanel.jsx';
import AdminLogin from './Components/AdminLogin.jsx';
import ReceptDetalji from './Pages/ReceptDetalj.jsx';
import PopularniRecepti from './Pages/PopularniRecepti.jsx';
import MyFavorites from './Pages/MyFavorites.jsx';
import { SearchProvider } from './Context/SearchContext';
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'kontakt',
        element: <Kontakt />
      },
      {
        path: 'omeni',
        element: <Omeni />
      },
      {
        path: 'saradnja',
        element: <Saradnja />
      },
      {
        path: 'slani',
        element: <Slani />
      },
      {
        path: 'slatki',
        element: <Slatki />
      },
      {
        path: 'sviRecepti',
        element: <SviRecepti />
      },
      {
        path: 'dodajRecept',
        element: <DodajRecept />
      },
      {
        path: 'admin',
        element: <AdminPanel />
      },
      {
        path: 'login',
        element: <AdminLogin />
      },
      {
        path: 'recept/:id',
        element: <ReceptDetalji />
      },
      {
        path: 'popularni',
        element: <PopularniRecepti />
      },
      {
        path: 'favorites',
        element: <MyFavorites />
      }

    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SearchProvider>
      <RouterProvider router={router} />
    </SearchProvider>
  </StrictMode>,
)
