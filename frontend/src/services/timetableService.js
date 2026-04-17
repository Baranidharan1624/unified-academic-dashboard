import { api, getCached, invalidateApiCacheByPrefix } from './apiClient';

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
  return getCached('/admin/rooms');
};

export const getRoomById = async (id) => {
  return getCached(`/admin/rooms/${id}`);
};

export const createRoom = async (roomData) => {
  const response = await api.post('/admin/rooms', roomData);
  invalidateApiCacheByPrefix('/admin/rooms');
  return response.data;
};

export const deleteRoom = async (id) => {
  const response = await api.delete(`/admin/rooms/${id}`);
  invalidateApiCacheByPrefix('/admin/rooms');
  return response.data;
};

// Timetable Services
export const getTimetableEntries = async () => {
  return getCached('/admin/timetable');
};

export const getTimetableEntryById = async (id) => {
  return getCached(`/admin/timetable/${id}`);
};

export const createTimetableEntry = async (entryData) => {
  const response = await api.post('/admin/timetable', entryData);
  invalidateApiCacheByPrefix('/admin/timetable');
  invalidateApiCacheByPrefix('/timetable/student/');
  invalidateApiCacheByPrefix('/timetable/faculty/');
  return response.data;
};

export const updateTimetableEntry = async (id, entryData) => {
  const response = await api.put(`/admin/timetable/${id}`, entryData);
  invalidateApiCacheByPrefix('/admin/timetable');
  invalidateApiCacheByPrefix('/timetable/student/');
  invalidateApiCacheByPrefix('/timetable/faculty/');
  return response.data;
};

export const deleteTimetableEntry = async (id) => {
  const response = await api.delete(`/admin/timetable/${id}`);
  invalidateApiCacheByPrefix('/admin/timetable');
  invalidateApiCacheByPrefix('/timetable/student/');
  invalidateApiCacheByPrefix('/timetable/faculty/');
  return response.data;
};

export const generateAutomaticTimetable = async () => {
  const response = await api.post('/admin/timetable/generate');
  invalidateApiCacheByPrefix('/admin/timetable');
  invalidateApiCacheByPrefix('/timetable/student/');
  invalidateApiCacheByPrefix('/timetable/faculty/');
  return response.data;
};

// Faculty Timetable
export const getFacultyTimetable = async () => {
  const userId = getCurrentUserId();
  return getCached(`/timetable/faculty/${userId || 0}`);
};

// Student Timetable
export const getStudentTimetable = async () => {
  const userId = getCurrentUserId();
  return getCached(`/timetable/student/${userId || 0}`);
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
