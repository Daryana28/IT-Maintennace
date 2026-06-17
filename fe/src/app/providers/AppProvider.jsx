// fe\src\app\providers\AppProvider.jsx.
import { useEffect, useRef } from "react";
import {
 QueryClient,
 QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import { useAuthStore } from "@/modules/auth/store/authStore";
import AppLoader from "@/layouts/MainLayout/components/AppLoader";

const queryClient = new QueryClient({
 defaultOptions: {
  queries: {
   retry: 1,
   staleTime: 30000,
   refetchOnWindowFocus: false,
  },
 },
});

const AppProvider = ({ children }) => {
 const hydrate = useAuthStore((s) => s.hydrate);
 const loading = useAuthStore((s) => s.loading);

 const booted = useRef(false);

 useEffect(() => {
  if (booted.current) return;

  booted.current = true;
  hydrate();
 }, [hydrate]);

 if (loading) {
  return <AppLoader />;
 }

 return (
  <QueryClientProvider client={queryClient}>
   {children}
   <Toaster
    position="top-right"
    toastOptions={{
     duration: 3000,
    }}
   />
  </QueryClientProvider>
 );
};

export default AppProvider;