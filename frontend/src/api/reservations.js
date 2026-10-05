import { apiClient } from "./client.js";

export async function createReservation({ tableId, reservationDate, customerId }) {
  const payload = {
    tableId: Number(tableId),
    reservationDate
  };
  if (customerId) {
    payload.customerId = Number(customerId);
  }

  const response = await apiClient("/reservations", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return response.data;
}

export async function getReservations(status = null) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const response = await apiClient(`/reservations${query}`);
  return response.data || [];
}

export async function getReservationById(reservationId) {
  const response = await apiClient(`/reservations/${reservationId}`);
  return response.data;
}

export async function updateReservationStatus(reservationId, status) {
  const response = await apiClient(`/reservations/${reservationId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
  return response.data;
}

export async function cancelReservation(reservationId) {
  const response = await apiClient(`/reservations/${reservationId}/cancel`, {
    method: "PATCH"
  });
  return response.data;
}
