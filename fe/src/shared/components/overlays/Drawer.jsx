// fe\src\shared\components\overlays\Drawer.jsx
import { Drawer as AntDrawer } from "antd";

export default function Drawer({ children, className = "", ...props }) {
  return (
    <AntDrawer className={className} {...props}>
      {children}
    </AntDrawer>
  );
}