// fe/src/app/router/NotFoundPage.jsx
import {
  ArrowLeftOutlined,
  AppstoreOutlined,
  CompassOutlined,
  CustomerServiceOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { encodePath } from "@/shared/utils/routeCipher";
import "@/styles/pages/notfound.css";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="notfound-page">
      <div className="notfound-bg-glow glow-1" />
      <div className="notfound-bg-glow glow-2" />

      <header className="notfound-header">
        <div className="notfound-logo">
          <div className="logo-icon">
            <AppstoreOutlined />
          </div>
          <span>ITAM SYSTEM</span>
        </div>

        <Link
          to={"/" + encodePath("/itam/dashboard")}
          className="notfound-home-link"
        >
          <HomeOutlined />
          <span>Kembali ke Beranda</span>
        </Link>
      </header>

      <div className="notfound-container">
        <div className="notfound-content">
          <div className="notfound-badge">ERROR 404</div>

          <h1 className="notfound-code">404</h1>
          <h2 className="notfound-title">Halaman Tidak Ditemukan</h2>
          <p className="notfound-description">
            Halaman yang Anda cari mungkin telah dihapus, namanya diubah, atau sementara tidak tersedia.
          </p>

          <div className="notfound-actions">
            <Link to={"/" + encodePath("/itam/dashboard")}>
              <Button
                type="primary"
                size="large"
                icon={<AppstoreOutlined />}
                className="notfound-btn-primary"
              >
                Ke Dashboard
              </Button>
            </Link>

            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              className="notfound-btn-secondary"
              onClick={() => navigate(-1)}
            >
              Kembali
            </Button>
          </div>
        </div>

        <div className="notfound-feature-grid">
          <div className="feature-card">
            <div className="feature-icon blue">
              <CompassOutlined />
            </div>
            <div>
              <h4>Eksplorasi Dashboard</h4>
              <p>Kembali ke dashboard utama untuk melanjutkan pekerjaan Anda.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon green">
              <AppstoreOutlined />
            </div>
            <div>
              <h4>Cek Navigasi</h4>
              <p>Gunakan menu sidebar untuk menemukan halaman yang tepat.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple">
              <CustomerServiceOutlined />
            </div>
            <div>
              <h4>Butuh Bantuan?</h4>
              <p>Hubungi tim dukungan IT jika masalah ini terus berlanjut.</p>
            </div>
          </div>
        </div>

        <footer className="notfound-footer">
          © {new Date().getFullYear()} ITAM System. Hak Cipta Dilindungi.
        </footer>
      </div>
    </section>
  );
}