// src/api/axios.js
import axios from "axios";

// Create an Axios instance for the backend API
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Backend URL
  withCredentials: true,               // Allow cookies if needed
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
