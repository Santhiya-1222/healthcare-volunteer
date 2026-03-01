import api from "./api";

export const register = (data) => api.post("/auth/register", data);
export const sendOtp = (phone) => api.post("/auth/send-otp", { phone });
export const verifyOtp = (phone, otp) => api.post("/auth/verify-otp", { phone, otp });
export const logout = () => api.post("/auth/logout");
export const getMe = () => api.get("/auth/me");
