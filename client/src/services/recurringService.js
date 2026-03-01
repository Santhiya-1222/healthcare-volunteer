import api from "./api";

export const createSchedule = (data) => api.post("/recurring", data);
export const getMySchedules = () => api.get("/recurring/my");
export const cancelSchedule = (id) => api.put(`/recurring/${id}/cancel`);
