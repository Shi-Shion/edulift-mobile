import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  baseURL: "https://unpolite-amie-gratuitously.ngrok-free.dev/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setAuthToken = async (token) => {
  await AsyncStorage.setItem("auth_token", token);
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const clearAuthToken = async () => {
  await AsyncStorage.removeItem("auth_token");
  delete api.defaults.headers.common["Authorization"];
};

// Ping the server to update last_seen_at
export const pingOnline = async () => {
  try {
    await api.post("/ping");
  } catch (e) {
    // Silently fail — don't interrupt the app
  }
};

export default api;