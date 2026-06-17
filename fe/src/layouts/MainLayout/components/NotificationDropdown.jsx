// fe/src/layouts/MainLayout/components/NotificationDropdown.jsx
// fe/src/layouts/MainLayout/components/NotificationDropdown.jsx
import {
 Dropdown,
 Empty,
} from "antd";

import {
 BellOutlined,
 CheckCircleOutlined,
 ClockCircleOutlined,
} from "@ant-design/icons";

import { useMemo } from "react";

import { useNotificationStore } from "@/app/store/notificationStore";

export default function NotificationDropdown() {
 const items =
  useNotificationStore(
   (s) => s.items
  );

 const markAllRead =
  useNotificationStore(
   (s) => s.markAllRead
  );

 const unread =
  useMemo(
   () =>
    items.reduce(
     (n, item) =>
      item.read
       ? n
       : n + 1,
     0
    ),
   [items]
  );

 const content = (
  <div className="notification-panel">
   <div className="notification-head">
    <span>
     Notifications
    </span>

    {!!unread && (
     <strong>
      {unread} New
     </strong>
    )}
   </div>

   {!items.length && (
    <div className="notification-empty">
     <Empty
      image={
       Empty.PRESENTED_IMAGE_SIMPLE
      }
      description="No notifications"
     />
    </div>
   )}

   {!!items.length &&
    items.map((item) => (
     <div
      key={item.id}
      className={`notification-item ${
       item.read
        ? ""
        : "notification-unread"
      }`}
     >
      <div className="notification-row">
       <div className="notification-status">
        {item.read ? (
         <CheckCircleOutlined />
        ) : (
         <ClockCircleOutlined />
        )}
       </div>

       <div className="notification-body">
        <div className="notification-title">
         {item.title}
        </div>

        <div className="notification-desc">
         {item.message}
        </div>
       </div>
      </div>
     </div>
    ))}
  </div>
 );

 return (
  <Dropdown
   trigger={["click"]}
   placement="bottomRight"
   arrow
   onOpenChange={(
    open
   ) => {
    if (open)
     markAllRead();
   }}
   popupRender={() =>
    content
   }
  >
   <button
    type="button"
    className="notify-btn"
    aria-label="Notifications"
   >
    <BellOutlined />

    {!!unread && (
     <span className="notify-badge">
      {unread > 9
       ? "9+"
       : unread}
     </span>
    )}
   </button>
  </Dropdown>
 );
}