// fe\src\app\store\notificationStore.js
import { create } from "zustand";

export const useNotificationStore =
 create((set) => ({
  items: [],

  push: (payload) =>
   set((state) => ({
    items: [
     {
      id: Date.now(),
      read: false,
      ...payload,
     },
     ...state.items,
    ],
   })),

  markAllRead: () =>
   set((state) => ({
    items: state.items.map((x) => ({
     ...x,
     read: true,
    })),
   })),
 }));