import React, {
  createContext,
  useContext,
  memo,
  useEffect,
  useState,
} from "react";

import { Layout, Drawer } from "antd";
import {
  Outlet,
  useLocation,
} from "react-router-dom";

import HeaderBar from "./components/Header";
import Sidebar from "./components/Sidebar";

const PageHeaderContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function usePageHeader() {
  return useContext(PageHeaderContext);
}

function MainLayout({ children }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [headerBreadcrumb, setHeaderBreadcrumb] = useState("");
  const [headerTitle, setHeaderTitle] = useState("");
  const [headerSubtitle, setHeaderSubtitle] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    const timerId = window.setTimeout(() => {
      setOpen(false);
    }, 0);
    return () => window.clearTimeout(timerId);
  }, [location.pathname]);

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
            {children || <Outlet />}
          </main>
        </Layout.Content>
      </Layout>
    </PageHeaderContext.Provider>
  );
}

export default memo(MainLayout);
