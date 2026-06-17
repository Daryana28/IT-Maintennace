// fe\src\shared\components\overlays\ConfirmDialog.jsx
import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  title = "Confirm action",
  description = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
    >
      <p className="confirm-dialog-description">{description}</p>

      <div className="confirm-dialog-actions">
        <button type="button" className="confirm-dialog-cancel" onClick={onCancel}>
          {cancelText}
        </button>
        <button
          type="button"
          className="confirm-dialog-confirm"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Processing..." : confirmText}
        </button>
      </div>
    </Modal>
  );
}