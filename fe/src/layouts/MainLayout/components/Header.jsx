import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { MenuOutlined } from "@ant-design/icons";

import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";
import Sidebar from "./Sidebar";

function Header({ onMenuClick }) {
  const lastY = useRef(0);
  const frame = useRef(false);

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.querySelector(".main-content") || window;

    const getY = () =>
      target === window ? window.scrollY : target.scrollTop;

    const update = () => {
      const y = getY();
      const down = y > lastY.current + 6;

      setScrolled(y > 12);
      setHidden(y > 140 && down);

      lastY.current = y;
      frame.current = false;
    };

    const onScroll = () => {
      if (frame.current) return;

      frame.current = true;
      requestAnimationFrame(update);
    };

    target.addEventListener("scroll", onScroll, { passive: true });

    return () => target.removeEventListener("scroll", onScroll);
  }, []);

  const className = useMemo(
    () =>
      [
        "main-header",
        scrolled && "header-scrolled",
        hidden && "header-hidden",
      ]
        .filter(Boolean)
        .join(" "),
    [scrolled, hidden]
  );

  return (
    <div className="header-shell">
      <header className={className}>
        <div className="header-pattern" />

        <div className="main-toolbar">
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <MenuOutlined />
          </button>

          <div className="main-brand-row">
            <img
              src="/LogoOnly.png"
              alt="ITAM"
              className="main-brand-logo"
            />

            <div>
              <div className="main-brand">
                ITA
                <span className="amp">&</span>
                M
              </div>

              <div className="main-brand-sub">
                IT Asset & Maintenance
              </div>
            </div>
          </div>
        </div>

        <div className="header-right-group">
          <NotificationDropdown />
          <ProfileDropdown />
        </div>
      </header>

      <div className="header-navbar">
        <Sidebar mode="horizontal" />
      </div>
    </div>
  );
}

export default memo(Header);