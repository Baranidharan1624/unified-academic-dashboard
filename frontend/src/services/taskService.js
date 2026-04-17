import { api } from "./apiClient";

const invalidateTaskCache = () => {
  api.invalidateCacheByPrefix("/tasks");
};

export function createTask(payload) {
  return api.post("/tasks", payload).then((response) => {
    invalidateTaskCache();
    return response;
  });
}

export function getTasksByCourse(courseId) {
  return api.getCached(`/tasks/course/${courseId}`);
}

export function submitTask(payload) {
  return api.post("/tasks/submit", payload).then((response) => {
    invalidateTaskCache();
    return response;
  });
}

export function getStudentTasks(studentId) {
  return api.getCached(`/tasks/student/${studentId}`);
}
