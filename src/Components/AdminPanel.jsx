import React, { useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';


function AdminPanel() {


    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

    const handleLogin = () => setIsLoggedIn(true);

    return (
        <div>
            {isLoggedIn ? <AdminDashboard /> : <AdminLogin onLogin={handleLogin} />}
        </div>
    );
}

export default AdminPanel;
