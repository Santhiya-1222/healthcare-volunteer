import api from "./api";

export const getDashboard = () => api.get("/admin/dashboard");
export const getPendingVolunteers = () => api.get("/admin/volunteers/pending");
export const getAllVolunteers = () => api.get("/admin/volunteers/all");
export const verifyVolunteer = (id) => api.put(`/admin/volunteers/${id}/verify`);
export const blockVolunteer = (id) => api.put(`/admin/volunteers/${id}/block`);
export const getAllRequests = () => api.get("/admin/requests");
