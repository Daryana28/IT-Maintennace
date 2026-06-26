import React, {
  createContext,
  useContext,
  memo,
  useEffect,
  useState,
} from "react";

import { Layout, Drawer, Alert } from "antd";
import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuthStore } from "@/modules/auth/store/authStore";
import HeaderBar from "./components/Header";
import Sidebar from "./components/Sidebar";

const PageHeaderContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function usePageHeader() {
  return useContext(PageHeaderContext);
}

function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [headerBreadcrumb, setHeaderBreadcrumb] = useState("");
  const [headerTitle, setHeaderTitle] = useState("");
  const [headerSubtitle, setHeaderSubtitle] = useState("");

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timerId = window.setTimeout(() => {
      setOpen(false);
    }, 0);
    return () => window.clearTimeout(timerId);
  }, [location.pathname]);

  // First-time login / password reset redirect guard
  useEffect(() => {
    if (Boolean(user?.must_change_password) && location.pathname !== "/itam/account/profile") {
      navigate("/itam/account/profile", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  return (
    <PageHeaderContext.Provider
      value={{
        setHeaderBreadcrumb,
        setHeaderTitle,
        setHeaderSubtitle,
      }}
    >
      <Layout className="main-layout">
        <header className="main-header-sticky">
          <HeaderBar onMenuClick={() => setOpen(true)} />
        </header>

        <Drawer
          placement="left"
          open={open}
          onClose={() => setOpen(false)}
          style={{ width: 280 }}
          styles={{
            body: { padding: 0 },
            header: { display: "none" },
          }}
        >
          <Sidebar mode="inline" />
        </Drawer>

        <Layout.Content className="main-content">
          <main
            key={location.pathname}
            className="main-content-inner page-fade"
          >
            {headerTitle && (
              <div className="dashboard-page-head">
                <div className="dashboard-page-heading">
                  {headerBreadcrumb && (
                    <div className="dashboard-page-breadcrumb">{headerBreadcrumb}</div>
                  )}
                  <h1 className="dashboard-page-title">{headerTitle}</h1>
                  {headerSubtitle && (
                    <div className="dashboard-page-subtitle">{headerSubtitle}</div>
                  )}
                </div>
              </div>
            )}
            
            {Boolean(user?.must_change_password) && (
              <div style={{ margin: "0 0 20px 0" }}>
                <Alert
                  message="Ganti Password Wajib"
                  description="Ini adalah login pertama Anda atau password Anda baru saja di-reset oleh Admin. Silakan perbarui password Anda di halaman profil ini sebelum mengakses menu lain."
                  type="warning"
                  showIcon
                />
              </div>
            )}

            {children || <Outlet />}
          </main>
        </Layout.Content>
      </Layout>
    </PageHeaderContext.Provider>
  );
}

export default memo(MainLayout);
