import api from "../utils/api";

export const validateToken = async () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const response = await api.get("/auth/validate");
    return response.status === 200;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};
