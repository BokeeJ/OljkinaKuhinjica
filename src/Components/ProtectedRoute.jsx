import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const location = useLocation();
    const [ready, setReady] = useState(false);
    const [ok, setOk] = useState(false);

    useEffect(() => {
        const t = localStorage.getItem("admin_token");
        setOk(Boolean(t));
        setReady(true);
    }, []);

    if (!ready) return <div className="p-6 text-center">Učitavam…</div>;

    if (!ok) {
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{ from: location.pathname + location.search }}
            />
        );
    }

    return children;
}
