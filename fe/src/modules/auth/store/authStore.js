// fe\src\app\store\authStore.js
import { create } from "zustand";

import authService from "@/modules/auth/services/authService";
import { useRBACStore } from "@/app/store/rbacStore";

const mapRBAC = (user) => ({
 roles: user?.roles
  ? user.roles
  : user?.role
   ? [user.role]
   : [],
 permissions:
  user?.permissions || [],
});

export const useAuthStore =
 create((set) => ({
  user: null,
  token: null,
  loading: true,

  hydrate: async () => {
   try {
    const res =
     await authService.getMe();

    const user =
     res?.user || null;

    useRBACStore
     .getState()
     .setRBAC(
      mapRBAC(user)
     );

    set({
     user,
     token: !!user,
     loading: false,
    });
   } catch {
    useRBACStore
     .getState()
     .clear();

    set({
     user: null,
     token: null,
     loading: false,
    });
   }
  },

  setAuth: ({
   user,
   token,
  }) => {
   useRBACStore
    .getState()
    .setRBAC(
     mapRBAC(user)
    );

   set({
    user,
    token,
    loading: false,
   });
  },

  setUser: (user) =>
   set({ user }),

  logout: async () => {
   try {
    await authService.logout();
   } finally {
    useRBACStore
     .getState()
     .clear();

    set({
     user: null,
     token: null,
     loading: false,
    });
   }
  },
 }));