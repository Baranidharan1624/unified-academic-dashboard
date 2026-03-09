import api from "./api";

export async function login(email, password) {
  const response = await api.post("/auth/login", { email, password });
  const data = response.data;
  const user = {
    id: data.userId,
    email,
    role: data.role,
    name: data.fullName,
  };
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getCurrentUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}
