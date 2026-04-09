import { api } from "./apiClient";

/**
 * Get faculty users
 */
export async function getFacultyUsers() {
  const response = await api.get("/admin/users?role=FACULTY");
  return response.data;
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
    const response = await api.get("/admin/users");
    return response.data;
  },

  async getCreateMeta() {
    const response = await api.get("/admin/users/meta");
    return response.data;
  },

  /**
   * Get users by role
   * @param {string} role - Role filter (ADMIN, FACULTY, STUDENT)
   * @returns {Promise} List of users with specified role
   */
  async getUsersByRole(role) {
    const response = await api.get(`/admin/users?role=${role}`);
    return response.data;
  },

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise} User details
   */
  async getUserById(id) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise} Created user
   */
  async createUser(userData) {
    const response = await api.post("/admin/users", userData);
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
    return response.data;
  },

  /**
   * Activate user account
   * @param {number} id - User ID
   * @returns {Promise} Updated user
   */
  async activateUser(id) {
    const response = await api.patch(`/admin/users/${id}/activate`);
    return response.data;
  },

  /**
   * Deactivate user account
   * @param {number} id - User ID
   * @returns {Promise} Updated user
   */
  async deactivateUser(id) {
    const response = await api.patch(`/admin/users/${id}/deactivate`);
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
    return response.data;
  },

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise} Boolean indicating if email exists
   */
  async checkEmailExists(email) {
    const response = await api.get(`/admin/users/check-email?email=${email}`);
    return response.data.exists;
  },

  /**
   * Get user count by role
   * @param {string} role - Role to count
   * @returns {Promise} Count of users
   */
  async getUserCountByRole(role) {
    const response = await api.get(`/admin/users/count?role=${role}`);
    return response.data.count;
  },
};

export default userService;
