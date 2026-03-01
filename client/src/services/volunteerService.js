import api from "./api";

export const getMyTasks = () => api.get("/volunteers/my-tasks");
export const getProfile = () => api.get("/volunteers/profile");
