import { api } from "../../services/apiClient";

/**
 * AuthService - Authentication API calls
 */
export const authService = {
  /**
   * Login user with email and password
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise} Login response with token and user data
   */
  async login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} Login response with token and user data
   */
  async register(userData) {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  /**
   * Logout user - clear local storage
   */
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  /**
   * Get current user from local storage
   * @returns {Object|null} User object or null
   */
  getCurrentUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },

  /**
   * Get JWT token from local storage
   * @returns {string|null} Token or null
   */
  getToken() {
    return localStorage.getItem("token");
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!token && !!user;
  },

  /**
   * Store authentication data
   * @param {Object} data - Login response data
   */
  storeAuthData(data) {
    const user = {
      id: data.userId,
      email: data.email,
      name: data.fullName ?? data.name,
      role: data.role,
    };
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(user));
  },
};

export default authService;
