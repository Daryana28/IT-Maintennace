// fe\src\shared\services\apiClient.js
import axios from "axios";
import { useAuthStore } from "@/modules/auth/store/authStore";

const http = axios.create({
 baseURL: import.meta.env.VITE_API_URL,
 withCredentials: true,
 timeout: 15000,
 headers: {
  "Content-Type": "application/json",
 },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
 failedQueue.forEach(({ resolve, reject }) => {
  if (error) reject(error);
  else resolve();
 });

 failedQueue = [];
};

http.interceptors.response.use(
 (response) => response,
 async (error) => {
  const originalRequest = error.config;
  const status = error?.response?.status;

  if (
   status === 401 &&
   !originalRequest._retry &&
   !originalRequest.url.includes("/auth/refresh")
  ) {
   if (isRefreshing) {
    return new Promise((resolve, reject) => {
     failedQueue.push({
      resolve: () => resolve(http(originalRequest)),
      reject,
     });
    });
   }

   originalRequest._retry = true;
   isRefreshing = true;

   try {
    await axios.post(
     `${import.meta.env.VITE_API_URL}/auth/refresh`,
     {},
     { withCredentials: true }
    );

    processQueue();
    return http(originalRequest);
   } catch (refreshError) {
    processQueue(refreshError);
    useAuthStore.getState().logout();
    return Promise.reject(refreshError);
   } finally {
    isRefreshing = false;
   }
  }

  return Promise.reject({
   status,
   message:
    error?.response?.data?.message ||
    error?.message ||
    "Request failed",
   raw: error,
  });
 }
);

export default http;