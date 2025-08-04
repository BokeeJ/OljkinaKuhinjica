// config.js
export const API_BASE_URL = import.meta.env.MODE === 'development'
    ? 'https://kuhinjica-backend-production.up.railway.app'
    : 'http://localhost:5174';

console.log("VITE MODE:", import.meta.env.MODE);