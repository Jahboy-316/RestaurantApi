import { apiClient } from "./client.js";

export async function getTables() {
  const response = await apiClient("/tables");
  return response.data || [];
}

export async function getTableById(tableId) {
  const response = await apiClient(`/tables/${tableId}`);
  return response.data;
}

export async function createTable({ tableNumber, capacity }) {
  const response = await apiClient("/tables", {
    method: "POST",
    body: JSON.stringify({ tableNumber: Number(tableNumber), capacity: Number(capacity) })
  });
  return response.data;
}

export async function updateTable(tableId, data) {
  const response = await apiClient(`/tables/${tableId}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
  return response.data;
}

export async function updateTableAvailability(tableId, isAvailable) {
  const response = await apiClient(`/tables/${tableId}/availability`, {
    method: "PATCH",
    body: JSON.stringify({ isAvailable: Boolean(isAvailable) })
  });
  return response.data;
}

export async function deleteTable(tableId) {
  const response = await apiClient(`/tables/${tableId}`, {
    method: "DELETE"
  });
  return response;
}
