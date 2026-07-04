import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
export const CHAT_URL = import.meta.env.VITE_CHAT_URL ?? "http://localhost:4000/chat";
export const GAME_SERVER_URL = import.meta.env.VITE_GAME_SERVER_URL ?? "ws://localhost:2567";

export const apiClient = axios.create({ baseURL: API_URL });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("nova_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
