// fe\src\app\store\rbacStore.js
import { create } from "zustand";

const ROOT_ROLES = [
  "SUPERADMIN",
  "SUPERADMINISTRATOR",
];

export const useRBACStore =
  create((set, get) => ({
    roles: [],
    permissions: [],

    setRBAC: ({
      roles = [],
      permissions = [],
    }) =>
      set({
        roles,
        permissions,
      }),

    hasRole: (role) => {
      const roles =
        get().roles.map(r => String(r).toUpperCase());
      const roleUpper = String(role).toUpperCase();

      const isRoot =
        ROOT_ROLES.some(
          (r) =>
            roles.includes(r.toUpperCase())
        );

      return (
        isRoot ||
        roles.includes(roleUpper)
      );
    },

    hasPermission: (
      perm
    ) => {
      const roles =
        get().roles.map(r => String(r).toUpperCase());
      const permUpper = String(perm).toUpperCase();
      const perms = get().permissions.map(p => String(p).toUpperCase());

      const isRoot =
        ROOT_ROLES.some(
          (r) =>
            roles.includes(r.toUpperCase())
        );

      return (
        isRoot ||
        perms.includes(permUpper)
      );
    },

    clear: () =>
      set({
        roles: [],
        permissions: [],
      }),
  }));