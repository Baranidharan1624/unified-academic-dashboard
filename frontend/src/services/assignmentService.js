import apiClient from './apiClient';

const assignmentService = {
  // Faculty - Create assignment
  createAssignment: async (assignmentData) => {
    const response = await apiClient.post('/faculty/assignments', assignmentData);
    return response.data;
  },

  // Faculty - Update assignment
  updateAssignment: async (id, assignmentData) => {
    const response = await apiClient.put(`/faculty/assignments/${id}`, assignmentData);
    return response.data;
  },

  // Faculty - Delete assignment
  deleteAssignment: async (id) => {
    const response = await apiClient.delete(`/faculty/assignments/${id}`);
    return response.data;
  },

  // Faculty - Get assignments by course
  getAssignmentsByCourse: async (courseOfferingId) => {
    const response = await apiClient.get(`/faculty/assignments/course/${courseOfferingId}`);
    return response.data;
  },

  // Faculty - Get my assignments
  getMyAssignments: async () => {
    const response = await apiClient.get('/faculty/assignments/my-courses');
    return response.data;
  },

  // Faculty - Get assignment by ID
  getAssignment: async (id) => {
    const response = await apiClient.get(`/faculty/assignments/${id}`);
    return response.data;
  },

  // Faculty - Get submissions for an assignment
  getSubmissions: async (assignmentId) => {
    const response = await apiClient.get(`/faculty/assignments/submissions/${assignmentId}`);
    return response.data;
  },

  // Faculty - Grade a submission
  gradeSubmission: async (submissionId, grade, feedback) => {
    const response = await apiClient.post(`/faculty/assignments/submissions/${submissionId}/grade`, {
      grade,
      feedback
    });
    return response.data;
  },

  // Student - Get my assignments
  getStudentAssignments: async (studentId) => {
    const response = await apiClient.get('/student/assignments', { params: { studentId } });
    return response.data;
  },

  // Student - Get assignment details
  getStudentAssignmentDetails: async (assignmentId) => {
    const response = await apiClient.get(`/student/assignments/${assignmentId}`);
    return response.data;
  },

  // Student - Get my submission for an assignment
  getMySubmission: async (assignmentId, studentId) => {
    const response = await apiClient.get(`/student/assignments/${assignmentId}/submission`, {
      params: { studentId }
    });
    return response.data;
  },

  // Student - Submit assignment
  submitAssignment: async (assignmentId, studentId, fileId) => {
    const response = await apiClient.post(`/student/assignments/${assignmentId}/submit`, {
      studentId,
      fileId
    });
    return response.data;
  },

  // Student - Get my submissions
  getMySubmissions: async (studentId) => {
    const response = await apiClient.get('/student/assignments/my-submissions', {
      params: { studentId }
    });
    return response.data;
  }
};

export default assignmentService;

