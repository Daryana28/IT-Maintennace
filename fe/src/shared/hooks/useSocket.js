// fe/src/shared/hooks/useSocket.js
import {
 useEffect,
} from "react";

import { socket }
 from "../services/socketClient";

import {
 useNotificationStore,
} from "../../app/store/notificationStore";

export default function useSocket(
 token
) {
 const push =
  useNotificationStore(
   (state) => state.push
  );

 useEffect(() => {
  if (!token) {
   socket.disconnect();

   return;
  }

  socket.auth = {
   token,
  };

  const handleNotification =
   (data) => {
    push(data);
   };

  socket.connect();

  socket.on(
   "notification",
   handleNotification
  );

  return () => {
   socket.off(
    "notification",
    handleNotification
   );
  };
 }, [token, push]);
}