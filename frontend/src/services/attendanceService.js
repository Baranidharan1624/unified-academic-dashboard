import api from "./api";

export function getStudentAttendance(studentId) {
  return api.get("/student/attendance", { params: { studentId } });
}

export function getStudentDashboard(studentId) {
  return api.get("/student/dashboard", { params: { studentId } });
}

export function getStudentTimetable(studentId) {
  return api.get("/student/timetable", { params: { studentId } });
}
