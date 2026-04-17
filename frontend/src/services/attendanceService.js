import { api } from "./apiClient";

export function getStudentAttendance(studentId) {
  return api.getCached("/student/attendance", { params: { studentId } });
}

export function getStudentDashboard(studentId) {
  return api.getCached("/student/dashboard", { params: { studentId } });
}

export function getStudentTimetable(studentId) {
  return api.getCached("/student/timetable", { params: { studentId } });
}
