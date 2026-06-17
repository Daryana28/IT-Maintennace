// fe\src\shared\components\overlays\Modal.jsx
import { Modal as AntModal } from "antd";

export default function Modal({ children, className = "", ...props }) {
  return (
    <AntModal className={className} centered {...props}>
      {children}
    </AntModal>
  );
}