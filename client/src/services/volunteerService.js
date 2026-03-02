import api from "./api";

export const getMyTasks          = () => api.get("/volunteers/my-tasks");
export const getProfile          = () => api.get("/volunteers/profile");
export const getNearbyVolunteers = (lat, lon, distance = 10000) =>
  api.get(`/volunteers/nearby?lat=${lat}&lon=${lon}&distance=${distance}`);
