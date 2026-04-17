import axios from "axios";

const API_CACHE_PREFIX = "campusone.apiCache.v1";
const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000;

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
  clearApiCache();
};

const safeSessionStorage = {
  getItem(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // ignore storage failures
    }
  },
  removeItem(key) {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // ignore storage failures
    }
  },
  keys() {
    try {
      return Object.keys(window.sessionStorage);
    } catch {
      return [];
    }
  },
};

const getCurrentSessionUserKey = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "anonymous";
    const user = JSON.parse(raw);
    return `${user?.id || "na"}:${user?.role || "na"}`;
  } catch {
    return "anonymous";
  }
};

const buildCacheKey = (url, params) => {
  const paramPart = params ? JSON.stringify(params) : "";
  return `${API_CACHE_PREFIX}:${getCurrentSessionUserKey()}:${url}:${paramPart}`;
};

const readCache = (key, ttlMs) => {
  const raw = safeSessionStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      safeSessionStorage.removeItem(key);
      return null;
    }

    const age = Date.now() - Number(parsed.timestamp || 0);
    if (age > ttlMs) {
      safeSessionStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch {
    safeSessionStorage.removeItem(key);
    return null;
  }
};

const writeCache = (key, data) => {
  safeSessionStorage.setItem(
    key,
    JSON.stringify({ timestamp: Date.now(), data })
  );
};

export const clearApiCache = () => {
  safeSessionStorage
    .keys()
    .filter((key) => key.startsWith(API_CACHE_PREFIX))
    .forEach((key) => safeSessionStorage.removeItem(key));
};

export const invalidateApiCacheByPrefix = (prefix) => {
  safeSessionStorage
    .keys()
    .filter((key) => key.startsWith(API_CACHE_PREFIX) && key.includes(`:${prefix}`))
    .forEach((key) => safeSessionStorage.removeItem(key));
};

export const getCached = async (url, config = {}, options = {}) => {
  const ttlMs = Number(options.ttlMs || DEFAULT_CACHE_TTL_MS);
  const shouldUseCache = options.useCache !== false;

  if (!shouldUseCache) {
    const response = await apiClient.get(url, config);
    return response.data;
  }

  const key = buildCacheKey(url, config?.params);
  const cached = readCache(key, ttlMs);
  if (cached != null) {
    return cached;
  }

  const response = await apiClient.get(url, config);
  writeCache(key, response.data);
  return response.data;
};

export const peekCached = (url, config = {}, options = {}) => {
  const ttlMs = Number(options.ttlMs || DEFAULT_CACHE_TTL_MS);
  const key = buildCacheKey(url, config?.params);
  return readCache(key, ttlMs);
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
  getCached,
  clearCache: clearApiCache,
  invalidateCacheByPrefix: invalidateApiCacheByPrefix,
};

export default apiClient;
