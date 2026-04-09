import axios from "axios";

// Dynamic API base URL - uses current host's IP for LAN access
const getApiBaseUrl = () => {
  // If explicitly set, use that
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // For LAN access, use the same host as the frontend but on port 8080
  const currentHost = window.location.hostname;
  return `http://${currentHost}:8080`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

export default api;
