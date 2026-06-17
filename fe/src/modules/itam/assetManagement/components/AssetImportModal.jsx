// fe\src\modules\itam\assets\components\AssetImportModal.jsx
import {
 Modal,
} from "antd";

export default function AssetImportModal({
 open,
 rows = [],
 onCancel,
 onOk,
 confirmLoading,
}) {
 return (
  <Modal
   open={open}
   title="Preview Import Excel"
   width={900}
   onCancel={onCancel}
   onOk={onOk}
   confirmLoading={confirmLoading}
  >
   <p>
    Total Row:{" "}
    {rows.length}
   </p>

   <pre
    style={{
     maxHeight: 400,
     overflow:
      "auto",
     background:
      "#f5f5f5",
     padding: 12,
    }}
   >
    {JSON.stringify(
     rows.slice(
      0,
      10
     ),
     null,
     2
    )}
   </pre>
  </Modal>
 );
}