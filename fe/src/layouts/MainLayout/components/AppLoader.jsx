// fe/src/layouts/MainLayout/components/AppLoader.jsx
import { useEffect, useState } from "react";
import { LockOutlined } from "@ant-design/icons";

export default function AppLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Increment progress by a random amount to make it feel natural
        const increment = Math.floor(Math.random() * 12) + 6;
        return Math.min(prev + increment, 100);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-loader-page">
      {/* Decorative technical grid background */}
      <div className="loader-perspective-grid" />

      {/* Main Center Content */}
      <div className="loader-center-content">
        {/* Glowing Logo Container */}
        <div className="loader-logo-container">
          <div className="loader-logo-ring-outer" />
          <div className="loader-logo-ring-inner" />
          <div className="loader-logo-glow" />
          <img
            src="/LogoOnly.png"
            alt="ITA&M Logo"
            className="loader-logo-img"
          />
        </div>

        {/* Brand Title */}
        <h1 className="loader-brand-title">
          ITA<span className="amp">&</span>M
        </h1>

        {/* Brand Subtitle */}
        <div className="loader-brand-subtitle">
          IT Asset & Maintenance System
        </div>

        {/* Brand Description */}
        <p className="loader-brand-desc">
          Kelola aset IT, pemeliharaan, dan siklus hidup aset secara terintegrasi dan aman.
        </p>

        {/* Dynamic Loading Progress Bar */}
        <div className="loader-progress-container">
          <div className="loader-progress-track">
            <div
              className="loader-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Secure Locking Footer */}
      <div className="loader-footer">
        <LockOutlined className="loader-lock-icon" />
        <span>2024 ITA&M System. All rights reserved.</span>
      </div>

      {/* Sparkle Decorative Element */}
      <div className="loader-sparkle">
        <svg viewBox="0 0 24 24" className="loader-sparkle-star">
          <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
        </svg>
      </div>
    </div>
  );
}