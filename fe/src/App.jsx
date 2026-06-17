import { RouterProvider } from "react-router-dom";
import router from "./app/router/router";
import { useAuthStore } from "./modules/auth/store/authStore";
import useSocket from "./shared/hooks/useSocket";

export default function App() {
  const token = useAuthStore((state) => state.token);

  useSocket(token);

  return <RouterProvider router={router} />;
}