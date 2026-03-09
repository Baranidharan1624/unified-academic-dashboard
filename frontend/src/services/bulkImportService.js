import { api } from './apiClient';

/**
 * BulkImportService - Handles bulk user import API calls
 */
export const bulkImportService = {
  /**
   * Import users from Excel file
   * @param {File} file - Excel file to upload
   * @param {string} userType - 'student' or 'faculty'
   * @returns {Promise} Import result with summary
   */
  async importUsers(file, userType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userType', userType);

    const response = await api.post('/admin/import/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

export default bulkImportService;

