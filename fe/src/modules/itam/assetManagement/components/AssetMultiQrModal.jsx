// fe\src\modules\itam\assets\components\AssetMultiQrModal.jsx
import {
 Button,
 Modal,
 Row,
 Col,
 Space,
 Typography,
} from "antd";

import {
 QRCodeCanvas,
} from "qrcode.react";

const {
 Text,
} = Typography;

export default function AssetMultiQrModal({
 open,
 rows = [],
 onCancel,
}) {
 const printAll =
  () => {
   window.print();
  };

 return (
  <Modal
   open={open}
   width={900}
   footer={null}
   title="Print Multi Labels"
   onCancel={onCancel}
  >
   <Space
    direction="vertical"
    style={{
     width: "100%",
    }}
   >
    <Button
     type="primary"
     onClick={
      printAll
     }
    >
     Print Labels
    </Button>

    <Row gutter={[16, 16]}>
     {rows.map(
      (
       item
      ) => (
       <Col
        key={
         item.asset_id
        }
        span={6}
       >
        <Space
         direction="vertical"
         align="center"
         style={{
          width: "100%",
          border:
           "1px solid #ddd",
          padding: 12,
         }}
        >
         <QRCodeCanvas
          value={`${window.location.origin}/itam/assets/${item.asset_id}`}
          size={110}
         />

         <Text strong>
          {
           item.asset_code
          }
         </Text>

         <Text>
          {
           item.asset_name
          }
         </Text>
        </Space>
       </Col>
      )
     )}
    </Row>
   </Space>
  </Modal>
 );
}