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

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

const clearSessionAndRedirectToLogin = () => {
  localStorage.removeItem("user");
};

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const requestUrl = error.config?.url || "";

      if (status === 401) {
        const isAdminUserManagementCall = requestUrl.includes("/admin/users");
        const isTimetableCall = requestUrl.includes("/timetable");

        const authMessage = data?.message || data?.error || "Unauthorized";
        console.error("Unauthorized:", authMessage);
        if (isAdminUserManagementCall || isTimetableCall) {
          return Promise.reject(error);
        }
        clearSessionAndRedirectToLogin();
      } else if (status === 403) {
        const accessMessage = data?.message || data?.error || "You don't have permission";
        console.error("Access denied:", accessMessage);
      } else if (status === 404) {
        console.error("Resource not found:", data?.message);
      } else if (status >= 500) {
        console.error("Server error:", data?.message || "Internal server error");
      }
    } else if (error.request) {
      console.error("Network error: No response from server");
    } else {
      console.error("Request error:", error.message);
    }
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  patch: (url, data, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};

export default apiClient;
