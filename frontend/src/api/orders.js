import { apiClient } from "./client.js";

export async function createOrder(items) {
  const response = await apiClient("/orders", {
    method: "POST",
    body: JSON.stringify({ items })
  });
  return response.data;
}

export async function getOrders(status = null) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const response = await apiClient(`/orders${query}`);
  return response.data || [];
}

export async function getOrderById(orderId) {
  const response = await apiClient(`/orders/${orderId}`);
  return response.data;
}

export async function cancelOrder(orderId) {
  const response = await apiClient(`/orders/${orderId}/cancel`, {
    method: "PATCH"
  });
  return response.data;
}

export async function updateOrderStatus(orderId, status) {
  const response = await apiClient(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
  return response.data;
}
