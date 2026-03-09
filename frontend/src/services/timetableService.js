import apiClient from './apiClient';

// Room Services
export const getRooms = async () => {
  const response = await apiClient.get('/admin/rooms');
  return response.data;
};

export const getRoomById = async (id) => {
  const response = await apiClient.get(`/admin/rooms/${id}`);
  return response.data;
};

export const createRoom = async (roomData) => {
  const response = await apiClient.post('/admin/rooms', roomData);
  return response.data;
};

export const deleteRoom = async (id) => {
  const response = await apiClient.delete(`/admin/rooms/${id}`);
  return response.data;
};

// Timetable Services
export const getTimetableEntries = async () => {
  const response = await apiClient.get('/admin/timetable');
  return response.data;
};

export const getTimetableEntryById = async (id) => {
  const response = await apiClient.get(`/admin/timetable/${id}`);
  return response.data;
};

export const createTimetableEntry = async (entryData) => {
  const response = await apiClient.post('/admin/timetable', entryData);
  return response.data;
};

export const updateTimetableEntry = async (id, entryData) => {
  const response = await apiClient.put(`/admin/timetable/${id}`, entryData);
  return response.data;
};

export const deleteTimetableEntry = async (id) => {
  const response = await apiClient.delete(`/admin/timetable/${id}`);
  return response.data;
};

// Faculty Timetable
export const getFacultyTimetable = async () => {
  const response = await apiClient.get('/faculty/timetable');
  return response.data;
};

// Student Timetable
export const getStudentTimetable = async () => {
  const response = await apiClient.get('/student/timetable');
  return response.data;
};

// Helper to organize timetable by day
export const organizeTimetableByDay = (entries) => {
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const organized = {};
  
  days.forEach(day => {
    organized[day] = entries
      .filter(entry => entry.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  });
  
  return organized;
};

export default {
  getRooms,
  getRoomById,
  createRoom,
  deleteRoom,
  getTimetableEntries,
  getTimetableEntryById,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getFacultyTimetable,
  getStudentTimetable,
  organizeTimetableByDay
};

