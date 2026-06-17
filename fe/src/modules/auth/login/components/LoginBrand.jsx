// fe/src/modules/auth/login/components/LoginBrand.jsx
import {
  SyncOutlined,
  PartitionOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
} from "@ant-design/icons";

export default function LoginBrand() {
  const benefits = [
    {
      icon: <SyncOutlined />,
      title: "Asset Lifecycle Tracking",
      desc: "Pantau siklus hidup aset dari pengadaan hingga disposisi.",
    },
    {
      icon: <PartitionOutlined />,
      title: "Service Desk Integration",
      desc: "Kelola tiket, incident, dan permintaan layanan dengan mudah.",
    },
    {
      icon: <ToolOutlined />,
      title: "Maintenance Control",
      desc: "Jadwalkan dan pantau aktivitas pemeliharaan aset.",
    },
    {
      icon: <SafetyCertificateOutlined />,
      title: "Secure & Reliable",
      desc: "Keamanan data tingkat enterprise dengan akses terenkripsi.",
    },
  ];

  return (
    <div className="auth-brand-panel">
      {/* Main content container */}
      <div className="auth-brand-content">
        <div className="auth-brand-logo-container">
          <img
            src="/LogoOnly.png"
            alt="ITA&M Logo"
            className="auth-brand-logo-img"
          />
        </div>

        <h1 className="auth-brand-title">
          ITA<span className="amp">&</span>M
        </h1>

        <div className="auth-brand-subtitle">
          IT Asset & Maintenance System
        </div>

        <p className="auth-brand-desc">
          Kelola aset IT, pemeliharaan, dan siklus hidup aset secara terintegrasi dan aman.
        </p>

        {/* Vertical cards stack */}
        <div className="auth-benefits-list">
          {benefits.map((benefit, index) => (
            <div key={index} className="auth-benefit-item">
              <div className="auth-benefit-icon">{benefit.icon}</div>
              <div className="auth-benefit-text-wrap">
                <div className="auth-benefit-title">{benefit.title}</div>
                <div className="auth-benefit-desc">{benefit.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cyber footer */}
      <div className="auth-brand-footer">
        <LockOutlined className="lock-icon" />
        <span>© 2024 ITA&M System. All rights reserved.</span>
      </div>
    </div>
  );
}