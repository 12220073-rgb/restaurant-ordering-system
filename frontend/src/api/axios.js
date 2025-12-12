// src/api/axios.js
import axios from "axios";

/*
  LOCAL DEVELOPMENT ONLY

  Frontend package.json has:
  "proxy": "http://localhost:5000"

  So "/api" automatically maps to:
  http://localhost:5000/api
*/
const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Bearer token if available (optional)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
