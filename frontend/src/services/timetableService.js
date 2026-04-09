import apiClient from './apiClient';

const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.id ?? null;
  } catch {
    return null;
  }
};

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

export const generateAutomaticTimetable = async () => {
  const response = await apiClient.post('/admin/timetable/generate');
  return response.data;
};

// Faculty Timetable
export const getFacultyTimetable = async () => {
  const userId = getCurrentUserId();
  const response = await apiClient.get(`/timetable/faculty/${userId || 0}`);
  return response.data;
};

// Student Timetable
export const getStudentTimetable = async () => {
  const userId = getCurrentUserId();
  const response = await apiClient.get(`/timetable/student/${userId || 0}`);
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
  generateAutomaticTimetable,
  getFacultyTimetable,
  getStudentTimetable,
  organizeTimetableByDay
};
