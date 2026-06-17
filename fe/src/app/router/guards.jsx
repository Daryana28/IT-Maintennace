// fe\src\app\router\guards.jsx
import { Navigate, useLocation } from "react-router-dom";
import { encodePath } from "@/shared/utils/routeCipher";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useRBACStore } from "@/app/store/rbacStore";

const ROOT_ROLES = [
 "SUPERADMIN",
 "SUPERADMINISTRATOR",
];

export function AuthGuard({ children }) {
 const token = useAuthStore((s) => s.token);
 const loading = useAuthStore((s) => s.loading);
 const location = useLocation();

 if (loading) return null;

 if (!token) {
  return (
   <Navigate
    to="/login"
    state={{ from: location }}
    replace
   />
  );
 }

 return children;
}


export function GuestGuard({ children }) {
 const token = useAuthStore((s) => s.token);
 const loading = useAuthStore((s) => s.loading);

 if (loading) return null;

 if (token) {
  return (
   <Navigate
    to={
     "/" +
     encodePath("/itam/dashboard")
    }
    replace
   />
  );
 }

 return children;
}

export function RoleGuard({ roles = [], children }) {
 const userRoles = useAuthStore((s) => s.user?.roles || []);

 // Normalize both route roles and user roles to uppercase for case-insensitive comparison
 const normalizedRoles = roles.map(r => String(r).toUpperCase());
 const normalizedUserRoles = userRoles.map(r => String(r).toUpperCase());

 const isRoot = normalizedUserRoles.some((r) =>
  ROOT_ROLES.includes(r)
 );

 const allowed =
  normalizedRoles.length === 0 ||
  isRoot ||
  normalizedRoles.some((r) => normalizedUserRoles.includes(r));

 if (!allowed) {
  return <Navigate to="/403" replace />;
 }

 return children;
}


export function PermissionGuard({
 children,
 permission,
}) {
 const hasPermission = useRBACStore((s) => s.hasPermission);

 if (!permission) return children;

 if (hasPermission(permission)) {
  return children;
 }

 return <Navigate to="/403" replace />;
}