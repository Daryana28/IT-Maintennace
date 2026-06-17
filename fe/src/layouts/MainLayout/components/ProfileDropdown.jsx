// fe\src\layouts\MainLayout\components\ProfileDropdown.jsx
import { Dropdown } from "antd";
import {
 LogoutOutlined,
} from "@ant-design/icons";

import {
 useMemo,
 useCallback,
} from "react";

import {
 useNavigate,
} from "react-router-dom";

import { useAuthStore } from "@/modules/auth/store/authStore";
import { encodePath } from "@/shared/utils/routeCipher";

export default function ProfileDropdown() {
 const navigate =
  useNavigate();

 const user =
  useAuthStore(
   (s) => s.user
  );

 const logout =
  useAuthStore(
   (s) => s.logout
  );

 const handleLogout =
  useCallback(
   async () => {
    await logout();

    navigate(
     "/" +
     encodePath(
      "/login"
     ),
     {
      replace: true,
     }
    );
   },
   [
    logout,
    navigate,
   ]
  );

 const menu =
  useMemo(
   () => ({
    items: [
     {
      key: "logout",
      icon: (
       <LogoutOutlined />
      ),
      label:
       "Logout",
      onClick:
       handleLogout,
     },
    ],
   }),
   [handleLogout]
  );

 const name =
  user?.full_name ||
  user?.nama ||
  "User";

 const role =
  user?.roles?.[0] ||
  user?.role ||
  "User";

 const initial =
  name.charAt(0).toUpperCase();

 return (
  <Dropdown
   menu={menu}
   trigger={[
    "click",
   ]}
   placement="bottomRight"
  >
   <button
    type="button"
    className="profile-chip"
   >
    <div className="profile-avatar">
     {initial}
    </div>

    <div className="profile-meta">
     <div className="profile-name">
      {name}
     </div>

     <div className="profile-role">
      {role}
     </div>
    </div>
   </button>
  </Dropdown>
 );
}