import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api";

function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post("/api/auth/login", { username, password });

            const token = res.data?.token;
            if (token) {
                localStorage.setItem("admin_token", token);
                // axios interceptor već će slati Authorization na sve naredne pozive
            }

            const redirectTo = location.state?.from || "/admin";
            navigate(redirectTo, { replace: true });

        } catch (err) {
            console.error("❌ Login greška:", err.response?.data || err.message);
            alert("Login neuspešan. Proveri korisničko ime ili lozinku.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto p-6 bg-gray-800 shadow rounded">
            <h2 className="text-xl text-orange-300 font-bold">Admin Login</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border p-2 rounded"
            />
            <input
                type="password"
                placeholder="Lozinka"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border p-2 rounded"
            />
            <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                {loading ? "Prijavljivanje..." : "Login"}
            </button>
        </form>
    );
}

export default AdminLogin;
