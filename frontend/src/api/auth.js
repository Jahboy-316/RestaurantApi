import { apiClient } from "./client.js";

export async function register(userData) {
  const response = await apiClient("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData)
  });

  if (response.token) {
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  return response;
}

export async function login(credentials) {
  const response = await apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  });

  if (response.token) {
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  return response;
}

export async function getProfile() {
  return await apiClient("/auth/profile");
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getStoredUser() {
  const userJson = localStorage.getItem("user");
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function getStoredToken() {
  return localStorage.getItem("token");
}
