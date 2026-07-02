// fe\src\modules\auth\login\hooks\useLogin.js
import {
 useEffect,
 useMemo,
 useState,
 useCallback,
} from "react";

import { message } from "antd";
import { useNavigate } from "react-router-dom";

import initialForm from "../constants/initialForm";
import authService from "@/modules/auth/services/authService";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { encodePath } from "@/shared/utils/routeCipher";

export default function useLogin() {
 const navigate = useNavigate();
 const [msg, contextHolder] =
  message.useMessage();

 const {
  token,
  loading,
  setAuth,
 } = useAuthStore();

 const [form, setForm] =
  useState(initialForm);

 const [capsLock, setCapsLock] =
  useState(false);

 const [errorShake, setErrorShake] =
  useState(false);

 const [submitting, setSubmitting] =
  useState(false);

 useEffect(() => {
  if (!loading && token) {
   navigate(
    "/" +
    encodePath(
     "/itam/dashboard"
    ),
    { replace: true }
   );
  }
 }, [loading, token, navigate]);

 useEffect(() => {
  const saved =
   localStorage.getItem(
    "last_username"
   );

  if (saved) {
   setForm((p) => ({
    ...p,
    username: saved,
   }));
  }
 }, []);

 const disabled = useMemo(
  () =>
   submitting ||
   !form.username.trim() ||
   !form.password,
  [form, submitting]
 );

 const updateField =
  useCallback(
   (key) => (e) => {
    setForm((p) => ({
     ...p,
     [key]:
      key === "remember"
       ? e.target.checked
       : e.target.value,
    }));
   },
   []
  );

 const handleLogin =
  useCallback(async () => {
   if (disabled) return;

   const username =
    form.username.trim();

   try {
    setSubmitting(true);

    if (form.remember) {
     localStorage.setItem(
      "last_username",
      username
     );
    } else {
     localStorage.removeItem(
      "last_username"
     );
    }

    const res = await authService.login({
     email: username,
     password: form.password,
    });

    setAuth({
     user: res.user,
     token: res.token,
    });

    msg.success("Login berhasil");

   navigate(
     "/" +
     encodePath(
      "/itam/dashboard"
     ),
     { replace: true }
    );
   } catch (e) {
    setErrorShake(true);

    setTimeout(() => {
     setErrorShake(false);
    }, 450);

    const errorMessage =
     e?.response?.data?.message ||
     (e?.raw?.code === "ECONNABORTED"
      ? "Koneksi ke server timeout"
      : e?.raw?.message?.includes(
          "Network Error"
        ) ||
        e?.raw?.message?.includes(
          "ERR_CONNECTION"
        )
      ? "Backend tidak bisa diakses"
      : "Username atau password salah");

    msg.error(errorMessage);
   } finally {
    setSubmitting(false);
   }
  }, [
   disabled,
   form,
   msg,
   setAuth,
   navigate
  ]
  );

 return {
  loading,
  form,
  capsLock,
  setCapsLock,
  errorShake,
  submitting,
  disabled,
  updateField,
  handleLogin,
  contextHolder,
 };
}
