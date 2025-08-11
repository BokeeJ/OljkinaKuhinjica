// config.js
export const API_BASE_URL = import.meta.env.MODE === 'development'
    ? 'http://localhost:5173'
    : 'https://kuhinjica-backend-production.up.railway.app';

console.log("VITE MODE:", import.meta.env.MODE);