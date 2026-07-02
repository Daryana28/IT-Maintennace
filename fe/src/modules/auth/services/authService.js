// fe\src\modules\auth\services\authService.js
import api from "@/shared/services/apiClient";

const authService = {
 login: async (payload) => {
  const { data } =
   await api.post(
    "/auth/login",
    payload
   );

  return data;
 },

 getMe: async () => {
  try {
   const { data } =
    await api.get(
     "/auth/me",
     {
      // Do not hold the login screen for the full global timeout.
      timeout: 3000,
     }
    );

   return data;
  } catch {
   return null;
  }
 },

 logout: async () => {
  const { data } =
   await api.post(
    "/auth/logout"
   );

  return data;
 },

 forgotPassword:
  async (payload) => {
   const { data } =
    await api.post(
     "/auth/forgot-password",
     payload
    );

   return data;
  },

 changePassword:
  async (payload) => {
   const { data } =
    await api.post(
     "/auth/change-password",
     payload
    );

   return data;
  },
};

export default authService;
