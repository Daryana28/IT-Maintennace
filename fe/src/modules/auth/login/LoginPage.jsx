// fe/src/modules/auth/login/LoginPage.jsx
import useLogin from "./hooks/useLogin";
import LoginBrand from "./components/LoginBrand";
import LoginForm from "./components/LoginForm";
import LoginLoader from "./components/LoginLoader";

export default function LoginPage() {
  const state = useLogin();

  if (state.loading) {
    return <LoginLoader />;
  }

  return (
    <>
      {state.contextHolder}

      <div className="auth-page">
        <div className="auth-shell">
          <LoginBrand />
          <LoginForm {...state} />
        </div>
      </div>
    </>
  );
}