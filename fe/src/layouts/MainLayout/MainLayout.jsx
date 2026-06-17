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

export function usePageHeader() {
  return useContext(PageHeaderContext);
}

function MainLayout({ children }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [headerTitle, setHeaderTitle] = useState("");
  const [headerSubtitle, setHeaderSubtitle] = useState("");

  useEffect(() => {
    setHeaderTitle("");
    setHeaderSubtitle("");
    window.scrollTo(0, 0);
    setOpen(false);
  }, [location.pathname]);

  return (
    <PageHeaderContext.Provider
      value={{
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
                <div>
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