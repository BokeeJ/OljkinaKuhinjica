// src/Components/PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function PrivateRoute() {
    const location = useLocation();
    const token = localStorage.getItem("admin_token");

    if (!token) {
        // zapamti gde je hteo da ide (da ga vrati tamo posle logina)
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{ from: location.pathname + location.search }}
            />
        );
    }

    return <Outlet />;
}
