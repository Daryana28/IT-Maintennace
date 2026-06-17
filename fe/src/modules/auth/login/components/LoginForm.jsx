// fe/src/modules/auth/login/components/LoginForm.jsx
import {
  Card,
  Input,
  Button,
  Checkbox,
} from "antd";

import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

export default function LoginForm({
  form,
  capsLock,
  setCapsLock,
  errorShake,
  submitting,
  disabled,
  updateField,
  handleLogin,
}) {
  return (
    <div className="auth-form-panel">
      <Card
        className={`auth-card ${errorShake ? "auth-shake" : ""}`}
        variant="borderless"
      >
        {/* Brand header inside the card */}
        <div className="auth-form-logo-container">
          <img
            src="/LogoOnly.png"
            alt="ITA&M Logo"
            className="auth-form-logo-img"
          />
        </div>

        <div className="auth-form-header-wrap">
          <h2 className="auth-form-title" style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#0f172a' }}>
            ITA&M
          </h2>
          <h1 className="auth-form-title">
            Welcome Back
          </h1>
          <div className="auth-form-subtitle">
            Sign in to access your dashboard securely
          </div>
        </div>

        {/* Username/Email Input Group */}
        <div className="auth-input-group">
          <label className="auth-input-label">Email Address</label>
          <Input
            autoFocus
            placeholder="example@company.com"
            prefix={<UserOutlined />}
            value={form.username}
            onChange={updateField("username")}
            onPressEnter={handleLogin}
            className="auth-input-field"
          />
        </div>

        {/* Password Input Group */}
        <div className="auth-input-group">
          <label className="auth-input-label">Password</label>
          <Input.Password
            placeholder="Enter your password"
            prefix={<LockOutlined />}
            value={form.password}
            onChange={updateField("password")}
            onPressEnter={handleLogin}
            onKeyUp={(e) =>
              setCapsLock(
                e.getModifierState("CapsLock")
              )
            }
            className="auth-input-field"
          />
        </div>

        {/* Caps Lock Warning */}
        {capsLock && (
          <span className="auth-warning">
            ⚠️ Caps Lock is active
          </span>
        )}

        {/* Remember me & Forgot Password Actions */}
        <div className="auth-actions-row">
          <Checkbox
            checked={form.remember}
            onChange={updateField("remember")}
            className="auth-checkbox"
          >
            Remember me
          </Checkbox>

          <Button type="link" className="auth-forgot-link">
            Forgot password?
          </Button>
        </div>

        {/* Login Button */}
        <Button
          type="primary"
          block
          loading={submitting}
          disabled={disabled}
          onClick={handleLogin}
          className="auth-submit-btn"
        >
          {submitting ? (
            "Signing In..."
          ) : (
            <>
              Sign In
              <ArrowRightOutlined />
            </>
          )}
        </Button>

        {/* SSO Divider */}
        <div className="auth-divider-wrap">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">or continue with</span>
          <div className="auth-divider-line" />
        </div>

        {/* SSO Button */}
        <Button className="auth-sso-btn">
          <SafetyCertificateOutlined /> Single Sign-On (SSO)
        </Button>

        {/* Protected Session Status Footer */}
        <div className="auth-card-footer">
          <LockOutlined /> Protected by encrypted access
        </div>
      </Card>
    </div>
  );
}