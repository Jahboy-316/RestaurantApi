const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && token && !endpoint.startsWith("/auth/login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
      const error = new Error(data.message || "An error occurred while communicating with the server.");
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw new Error("Unable to connect to the restaurant server. Please make sure the backend is running.");
  }
}
