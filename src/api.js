// src/api.js
import axios from "axios";
import { API_BASE_URL } from "./config";

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

axios.interceptors.request.use((cfg) => {
    const t = localStorage.getItem("admin_token");
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
});

export default axios;
