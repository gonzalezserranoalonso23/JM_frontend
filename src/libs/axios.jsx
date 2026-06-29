import axios from "axios";
import { useAuthStore } from "../store/auth";
///import.meta.env.VITE_API_URL
const authApi = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

authApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth;
  config.headers = {
    Authorization: `Bearer ${token}`,
  };
  return config;
});

export default authApi;
