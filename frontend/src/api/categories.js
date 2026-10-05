import { apiClient } from "./client.js";

export async function getCategories() {
  const response = await apiClient("/categories");
  return response.data || [];
}

export async function createCategory(name) {
  const response = await apiClient("/categories", {
    method: "POST",
    body: JSON.stringify({ name })
  });
  return response.data;
}

export async function updateCategory(categoryId, name) {
  const response = await apiClient(`/categories/${categoryId}`, {
    method: "PUT",
    body: JSON.stringify({ name })
  });
  return response.data;
}

export async function deleteCategory(categoryId) {
  return apiClient(`/categories/${categoryId}`, {
    method: "DELETE"
  });
}
