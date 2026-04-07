import { api } from "./apiClient";

export function getCourses(params = {}) {
  return api.get("/courses", { params });
}

export function getCourseDepartments() {
  return api.get("/admin/courses/departments");
}

export function getCourseSemesters() {
  return api.get("/admin/courses/semesters");
}

export function createCourse(payload) {
  return api.post("/admin/courses", payload);
}

export function updateCourse(id, payload) {
  return api.put(`/admin/courses/${id}`, payload);
}

export function deleteCourse(id) {
  return api.delete(`/admin/courses/${id}`);
}

export function importCourses(formData) {
  return api.post("/admin/courses/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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

