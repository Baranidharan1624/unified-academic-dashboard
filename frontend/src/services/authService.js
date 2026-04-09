import api from "./api";

export async function login(email, password) {
  const response = await api.post("/auth/login", { email, password });
  const data = response.data;
  const user = {
    id: data.userId,
    email: data.email ?? email,
    role: data.role,
    name: data.fullName,
    department: data.department,
    semester: data.semester,
    section: data.section,
    studentId: data.studentId,
    facultyId: data.facultyId,
  };
  localStorage.setItem("user", JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem("user");
}

export function getCurrentUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}
