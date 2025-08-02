// config.js
export const API_BASE_URL = import.meta.env.MODE === 'development'
    ? 'http://localhost:5050'
    : 'https://kuhinjica-backend-production.up.railway.app';
