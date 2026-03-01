import api from "./api";

export const createRequest = (data) => api.post("/requests", data);
export const getMyRequests = () => api.get("/requests/my");
export const getNearbyRequests = (distance) => api.get(`/requests/nearby?distance=${distance || 5000}`);
export const acceptRequest = (id) => api.put(`/requests/${id}/accept`);
export const updateStatus = (id, status) => api.put(`/requests/${id}/status`, { status });
export const submitFeedback = (id, data) => api.post(`/requests/${id}/feedback`, data);
export const getRequestById = (id) => api.get(`/requests/${id}`);
