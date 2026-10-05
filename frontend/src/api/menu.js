import { apiClient } from "./client.js";

export async function getMenuItems({ categoryId, search, isAvailable } = {}) {
  const params = new URLSearchParams();

  if (categoryId) {
    params.append("categoryId", categoryId);
  }
  if (search) {
    params.append("search", search);
  }
  if (isAvailable !== undefined) {
    params.append("isAvailable", isAvailable);
  }

  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await apiClient(`/menu-items${query}`);
  return response.data || [];
}

export async function createMenuItem(item) {
  const response = await apiClient("/menu-items", {
    method: "POST",
    body: JSON.stringify(item)
  });
  return response.data;
}

export async function updateMenuItem(itemId, item) {
  const response = await apiClient(`/menu-items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(item)
  });
  return response.data;
}

export async function updateMenuItemAvailability(itemId, isAvailable) {
  const response = await apiClient(`/menu-items/${itemId}/availability`, {
    method: "PATCH",
    body: JSON.stringify({ isAvailable })
  });
  return response.data;
}

export async function deleteMenuItem(itemId) {
  return apiClient(`/menu-items/${itemId}`, {
    method: "DELETE"
  });
}
