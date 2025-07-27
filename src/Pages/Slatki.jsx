import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
function Slatki() {
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(`${API_BASE_URL}/api/recipes`);
            const slatki = res.data.filter((r) => r.category === 'slatko');
            setRecipes(slatki);
        };
        fetchData();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Slatki Recepti</h1>
            {recipes.map((r) => (
                <div key={r._id} className="mb-4 p-4 border rounded">
                    <h2 className="text-xl font-semibold">{r.title}</h2>
                    <p>{r.description}</p>
                    {r.imageUrl && <img src={r.imageUrl} alt={r.title} className="w-40 mt-2" />}
                </div>
            ))}
        </div>
    );
}

export default Slatki;
