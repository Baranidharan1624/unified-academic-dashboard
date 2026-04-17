import { api } from "./apiClient";

/**
 * Get faculty users
 */
export async function getFacultyUsers() {
  return api.getCached("/admin/users?role=FACULTY");
}

/**
 * User Service - Admin User Management API calls
 */
export const userService = {
  /**
   * Get all users
   * @returns {Promise} List of all users
   */
  async getUsers() {
    return api.getCached("/admin/users");
  },

  async getCreateMeta() {
    return api.getCached("/admin/users/meta");
  },

  /**
   * Get users by role
   * @param {string} role - Role filter (ADMIN, FACULTY, STUDENT)
   * @returns {Promise} List of users with specified role
   */
  async getUsersByRole(role) {
    return api.getCached(`/admin/users?role=${role}`);
  },

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise} User details
   */
  async getUserById(id) {
    return api.getCached(`/admin/users/${id}`);
  },

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise} Created user
   */
  async createUser(userData) {
    const response = await api.post("/admin/users", userData);
    api.invalidateCacheByPrefix("/admin/users");
    return response.data;
  },

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} Updated user
   */
  async updateUser(id, userData) {
    const response = await api.put(`/admin/users/${id}`, userData);
    api.invalidateCacheByPrefix("/admin/users");
    return response.data;
  },

  /**
   * Activate user account
   * @param {number} id - User ID
   * @returns {Promise} Updated user
   */
  async activateUser(id) {
    const response = await api.patch(`/admin/users/${id}/activate`);
    api.invalidateCacheByPrefix("/admin/users");
    return response.data;
  },

  /**
   * Deactivate user account
   * @param {number} id - User ID
   * @returns {Promise} Updated user
   */
  async deactivateUser(id) {
    const response = await api.patch(`/admin/users/${id}/deactivate`);
    api.invalidateCacheByPrefix("/admin/users");
    return response.data;
  },

  /**
   * Reset user password
   * @param {number} id - User ID
   * @param {string} newPassword - New password
   * @returns {Promise} Success message
   */
  async resetPassword(id, newPassword) {
    const response = await api.post(`/admin/users/${id}/reset-password`, {
      newPassword,
    });
    api.invalidateCacheByPrefix("/admin/users");
    return response.data;
  },

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise} Boolean indicating if email exists
   */
  async checkEmailExists(email) {
    const data = await api.getCached(`/admin/users/check-email?email=${email}`, {}, { ttlMs: 60 * 1000 });
    return data.exists;
  },

  /**
   * Get user count by role
   * @param {string} role - Role to count
   * @returns {Promise} Count of users
   */
  async getUserCountByRole(role) {
    const data = await api.getCached(`/admin/users/count?role=${role}`);
    return data.count;
  },
};

export default userService;
