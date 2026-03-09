import apiClient from './apiClient';

const API_URL = '/files';

export const fileService = {
  uploadFile: async (file, fileType, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);

    const response = await apiClient.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  getFileMetadata: async (fileId) => {
    const response = await apiClient.get(`${API_URL}/${fileId}/metadata`);
    return response.data;
  },

  downloadFile: async (fileId) => {
    const response = await apiClient.get(`${API_URL}/${fileId}`, {
      responseType: 'blob',
    });
    return response;
  },

  deleteFile: async (fileId) => {
    const response = await apiClient.delete(`${API_URL}/${fileId}`);
    return response.data;
  },

  getMyFiles: async () => {
    const response = await apiClient.get(`${API_URL}/my-files`);
    return response.data;
  },

  getFilesByCategory: async (category) => {
    const response = await apiClient.get(`${API_URL}/category/${category}`);
    return response.data;
  },

  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  getFileExtension: (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  isImageFile: (filename) => {
    const ext = fileService.getFileExtension(filename).toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  },

  isPdfFile: (filename) => {
    const ext = fileService.getFileExtension(filename).toLowerCase();
    return ext === 'pdf';
  },
};

export default fileService;
