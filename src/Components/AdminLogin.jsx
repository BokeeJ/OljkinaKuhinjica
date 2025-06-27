import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useOutletContext } from 'react-router-dom';

axios.defaults.withCredentials = true;

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setIsLoggedIn } = useOutletContext();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log('📤 Šaljem:', username, password);

        try {
            const res = await axios.post('https://kuhinjica-backend-1.onrender.com/api/auth/login', {
                username,
                password
            }, {
                withCredentials: true
            });

            localStorage.setItem('token', res.data.token);
            alert('Uspešan login ✅');
            setIsLoggedIn(true);
            navigate('/admin');

        } catch (err) {
            console.error('❌ Login greška:', err.response?.data || err.message);
            alert('Login neuspešan. Proveri korisničko ime ili lozinku.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto p-6 bg-white shadow rounded">
            <h2 className="text-xl font-bold">Admin Login</h2>
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
            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
                {loading ? 'Prijavljivanje...' : 'Login'}
            </button>
        </form>
    );
}

export default AdminLogin;
