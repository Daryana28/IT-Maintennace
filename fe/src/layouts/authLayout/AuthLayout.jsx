// fe\src\layouts\AuthLayout.jsx
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <main className="auth-layout">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-grid" />

      <section className="auth-layout-content auth-fade-up">
        <Outlet />
      </section>
    </main>
  );
};

export default AuthLayout;