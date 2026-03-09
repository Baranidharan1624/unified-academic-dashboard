import api from "./api";

export function createTask(payload) {
  return api.post("/tasks", payload);
}

export function getTasksByCourse(courseId) {
  return api.get(`/tasks/course/${courseId}`);
}

export function submitTask(payload) {
  return api.post("/tasks/submit", payload);
}

export function getStudentTasks(studentId) {
  return api.get(`/tasks/student/${studentId}`);
}
