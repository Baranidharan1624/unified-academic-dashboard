import api from "./api";

export function getCourses(params = {}) {
  return api.get("/courses", { params });
}

export function createCourse(payload) {
  return api.post("/courses", payload);
}

export function updateCourse(id, payload) {
  return api.put(`/courses/${id}`, payload);
}

export function deleteCourse(id) {
  return api.delete(`/courses/${id}`);
}

export function getCourseOfferings(params = {}) {
  return api.get("/admin/course-offerings", { params });
}

export function createCourseOffering(payload) {
  return api.post("/admin/course-offerings", payload);
}

export function deleteCourseOffering(id) {
  return api.delete(`/admin/course-offerings/${id}`);
}

