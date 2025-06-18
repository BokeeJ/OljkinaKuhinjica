import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SviRecepti() {
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get('http://localhost:5050/api/recipes');
            setRecipes(res.data);
        };
        fetchData();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Svi Recepti</h1>
            {recipes.map((r) => (
                <div key={r._id} className="mb-4 p-4 border rounded">
                    <h2 className="text-xl font-semibold">{r.title}</h2>
                    <p>{r.description}</p>
                    {r.imageUrl && <img src={r.imageUrl} alt={r.title} className="w-40 mt-2" />}
                    <p className="italic mt-1 text-sm text-gray-500">{r.category}</p>
                </div>
            ))}
        </div>
    );
}

export default SviRecepti;
