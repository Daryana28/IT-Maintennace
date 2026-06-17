// fe/src/app/router/router.jsx
import { Suspense } from "react";

import {
 createBrowserRouter,
 Navigate,
 useLocation,
 matchPath,
} from "react-router-dom";

import {
 encodePath,
 decodePath,
 isEncodedPath,
} from "@/shared/utils/routeCipher";

import routeMap from "./routeMap";

import ErrorPage from "./ErrorPage";
import NotFoundPage from "./NotFoundPage";

import {
 AuthGuard,
 RoleGuard,
} from "./guards";

import {
 useAuthStore,
} from "@/modules/auth/store/authStore";

import MainLayout from "@/layouts/MainLayout/MainLayout";

import AuthLayout from "@/layouts/authLayout/AuthLayout";

import AppLoader from "@/layouts/MainLayout/components/AppLoader";
import PageLoader from "@/layouts/MainLayout/components/PageLoader";

function DecodeRoute() {
 const { pathname } = useLocation();

 const raw = pathname.slice(1);

 if (!isEncodedPath(raw)) {
  return <NotFoundPage />;
 }

 const decoded = decodePath(raw);

 const routeExists = routeMap.some((route) => {
  // Use matchPath to support dynamic routes like /itam/assets/:id
  return matchPath({ path: route.path, end: true }, decoded);
 });

 if (!routeExists) {
  return <NotFoundPage />;
 }

 return <Navigate to={decoded} replace />;
}

function HomeRedirect() {
 const token =
  useAuthStore(
   (state) =>
    state.token
  );

 const loading =
  useAuthStore(
   (state) =>
    state.loading
  );

 if (loading) {
  return <AppLoader />;
 }

 return (
  <Navigate
   to={
    token
     ? "/" +
       encodePath(
        "/itam/dashboard"
       )
     : "/login"
   }
   replace
  />
 );
}

function wrapElement(route) {
 const Page =
  route.component;

 let element =
  <Page />;

 if (!route.public) {
  element = (
   <AuthGuard>
    <RoleGuard
     roles={
      route.roles
     }
    >
     {element}
    </RoleGuard>
   </AuthGuard>
  );
 }

 return (
  <Suspense
   fallback={
    <PageLoader />
   }
  >
   {element}
  </Suspense>
 );
}

const loginRoute =
 routeMap.find(
  (route) =>
   route.path ===
   "/login"
 );

const privateRoutes =
 routeMap
  .filter(
   (route) =>
    !route.public
  )
  .map((route) => ({
   path: route.path,

   element: (
    <MainLayout>
     {wrapElement(
      route
     )}
    </MainLayout>
   ),

   errorElement:
    <ErrorPage />,
  }));

const publicRoutes =
 routeMap
  .filter(
   (route) =>
    route.public &&
    route.path !==
     "/login"
  )
  .map((route) => ({
   path: route.path,

   element:
    wrapElement(
     route
    ),

   errorElement:
    <ErrorPage />,
  }));

const router =
 createBrowserRouter([
  {
   path: "/login",

   element:
    <AuthLayout />,

   errorElement:
    <ErrorPage />,

   children: [
    {
     index: true,

     element:
      wrapElement(
       loginRoute
      ),
    },
   ],
  },

  ...publicRoutes,

  ...privateRoutes,

  {
   path: "/",

   element:
    <HomeRedirect />,

   errorElement:
    <ErrorPage />,
  },

  {
   path: "/:encoded",

   element:
    <DecodeRoute />,

   errorElement:
    <ErrorPage />,
  },

  {
   path: "*",

   element:
    <NotFoundPage />,
  },
 ]);

export default router;