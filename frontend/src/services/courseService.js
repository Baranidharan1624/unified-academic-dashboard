import { api } from "./apiClient";

const invalidateCourseCache = () => {
  api.invalidateCacheByPrefix("/courses");
  api.invalidateCacheByPrefix("/admin/courses");
  api.invalidateCacheByPrefix("/admin/course-offerings");
};

export function getCourses(params = {}) {
  return api.getCached("/courses", { params });
}

export function getCourseDepartments() {
  return api.getCached("/admin/courses/departments");
}

export function getCourseSemesters() {
  return api.getCached("/admin/courses/semesters");
}

export function createCourse(payload) {
  return api.post("/admin/courses", payload).then((response) => {
    invalidateCourseCache();
    return response;
  });
}

export function updateCourse(id, payload) {
  return api.put(`/admin/courses/${id}`, payload).then((response) => {
    invalidateCourseCache();
    return response;
  });
}

export function deleteCourse(id) {
  return api.delete(`/admin/courses/${id}`).then((response) => {
    invalidateCourseCache();
    return response;
  });
}

export function importCourses(formData) {
  return api.post("/admin/courses/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }).then((response) => {
    invalidateCourseCache();
    return response;
  });
}

export function getCourseOfferings(params = {}) {
  return api.getCached("/admin/course-offerings", { params });
}

export function createCourseOffering(payload) {
  return api.post("/admin/course-offerings", payload).then((response) => {
    invalidateCourseCache();
    return response;
  });
}

export function deleteCourseOffering(id) {
  return api.delete(`/admin/course-offerings/${id}`).then((response) => {
    invalidateCourseCache();
    return response;
  });
}

