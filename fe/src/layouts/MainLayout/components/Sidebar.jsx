// fe/src/layouts/MainLayout/components/Sidebar.jsx
import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  memo,
  useRef,
} from "react";

import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

import { MENU } from "@/app/router/menuConfig";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { filterMenuByRole } from "@/shared/utils/menuFilter";

const STORAGE_KEY = "sidebar-open-keys";

function loadOpenKeys() {
  try {
    if (typeof window === "undefined") {
      return [];
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);

    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveOpenKeys(keys) {
  try {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    return;
  }
}

function mapMenu(items) {
  return items.map((item) => ({
    key: String(item.key),
    label: item.label,
    icon: item.icon ? React.createElement(item.icon) : undefined,
    children: item.children ? mapMenu(item.children) : undefined,
  }));
}

function buildKeyPathMap(items, map = {}) {
  for (const item of items) {
    if (item.path) {
      map[String(item.key)] = item.path;
    }

    if (item.children) {
      buildKeyPathMap(item.children, map);
    }
  }

  return map;
}

function findSelected(items, pathname, parentKeys = []) {
  let matched = {
    selectedKey: "",
    openKeys: [],
    score: -1,
  };

  for (const item of items) {
    if (item.path) {
      const isMatch =
        pathname === item.path ||
        pathname.startsWith(`${item.path}/`);

      if (isMatch) {
        const score = item.path.length;

        if (score > matched.score) {
          matched = {
            selectedKey: String(item.key),
            openKeys: [...parentKeys],
            score,
          };
        }
      }
    }

    if (item.children) {
      const child = findSelected(item.children, pathname, [...parentKeys, String(item.key)]);

      if (child.score > matched.score) {
        matched = child;
      }
    }
  }

  return matched;
}

const Sidebar = memo(function Sidebar({ mode = "horizontal" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((s) => s.user);

  const roles = useMemo(() => {
    if (Array.isArray(user?.roles)) {
      return user.roles
        .map((role) => (typeof role === "string" ? role : role?.name))
        .filter(Boolean);
    }

    if (typeof user?.roles === "string") {
      return [user.roles];
    }

    if (typeof user?.role === "string") {
      return [user.role];
    }

    return [];
  }, [user]);

  const menus = useMemo(() => {
    const baseMenus = filterMenuByRole(MENU, roles);
    if (user?.must_change_password) {
      const accountMenu = baseMenus.find(m => m.key === "account");
      if (accountMenu) {
        return [{
          ...accountMenu,
          children: accountMenu.children?.filter(c => c.key === "profile") || []
        }];
      }
      return [];
    }
    return baseMenus;
  }, [roles, user?.must_change_password]);

  const items = useMemo(() => mapMenu(menus), [menus]);

  const keyPathMap = useMemo(() => buildKeyPathMap(menus), [menus]);

  const current = useMemo(
    () => findSelected(menus, location.pathname),
    [menus, location.pathname]
  );

  const [openKeys, setOpenKeys] = useState(() => loadOpenKeys());
  const [hoverKeys, setHoverKeys] = useState([]);
  const ignoreHover = useRef(false);

  useEffect(() => {
    if (mode !== "inline") return;

    if (current.openKeys && current.openKeys.length > 0) {
      setOpenKeys((prev) => {
        const nextSet = new Set([...prev, ...current.openKeys]);
        const next = Array.from(nextSet);
        if (next.length !== prev.length) {
          saveOpenKeys(next);
          return next;
        }
        return prev;
      });
    }
  }, [current.openKeys, mode]);

  const onClick = useCallback(
    ({ key }) => {
      const path = keyPathMap[key];

      if (path && location.pathname !== path) {
        navigate(path);
      }

      if (mode !== "inline") {
        setHoverKeys([]);
        ignoreHover.current = true;
        setTimeout(() => {
          ignoreHover.current = false;
        }, 300);
      }
    },
    [keyPathMap, navigate, location.pathname, mode]
  );

  const onHorizontalOpenChange = useCallback((keys) => {
    if (!ignoreHover.current) {
      setHoverKeys(keys);
    }
  }, []);

  const onOpenChange = useCallback((keys) => {
    setOpenKeys(keys);
    saveOpenKeys(keys);
  }, []);

  // BRANDING BLOCKS FOR MOBILE DRAWER
  const brandHeader = mode === "inline" && (
    <div className="sidebar-brand">
      <div className="sidebar-brand-badge">
        <img
          src="/LogoOnly.png"
          alt="ITAM Logo"
          style={{ width: 24, height: 24, objectFit: "contain" }}
        />
      </div>
      <div className="sidebar-brand-text">
        <div className="sidebar-brand-title">
          ITA<span style={{ color: "#ff9b2f", margin: "0 2px" }}>&</span>M
        </div>
        <div className="sidebar-brand-subtitle">IT Asset & Maintenance</div>
      </div>
    </div>
  );

  const brandFooter = mode === "inline" && (
    <div className="sidebar-footer">
      <div>© 2024 ITA&M System</div>
      <div style={{ fontSize: 10, marginTop: 2, opacity: 0.8 }}>
        Secure access connection
      </div>
    </div>
  );

  return (
    <nav
      className={mode === "inline" ? "drawer-nav" : "topnav-wrap"}
      style={
        mode === "inline"
          ? { display: "flex", flexDirection: "column", height: "100%" }
          : undefined
      }
    >
      {brandHeader}

      <div
        style={
          mode === "inline"
            ? { flexGrow: 1, overflowY: "auto", marginTop: 12 }
            : undefined
        }
      >
        <Menu
          mode={mode}
          inlineIndent={16}
          selectable
          items={items}
          selectedKeys={current.selectedKey ? [current.selectedKey] : []}
          openKeys={mode === "inline" ? openKeys : hoverKeys}
          onOpenChange={mode === "inline" ? onOpenChange : onHorizontalOpenChange}
          triggerSubMenuAction={mode === "inline" ? "click" : "hover"}
          onClick={onClick}
          className={mode === "inline" ? "drawer-menu" : "topnav-menu"}
        />
      </div>

      {brandFooter}
    </nav>
  );
});

export default Sidebar;