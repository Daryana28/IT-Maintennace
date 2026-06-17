// fe\src\modules\itam\assets\components\AssetQrModal.jsx
import {
 Button,
 Modal,
 Space,
 Typography,
} from "antd";

import {
 QRCodeCanvas,
} from "qrcode.react";

const {
 Text,
 Title,
} = Typography;

export default function AssetQrModal({
 open,
 asset,
 onCancel,
}) {
 const value =
  asset
   ? `${window.location.origin}/itam/assets/${asset.asset_id}`
   : "";

 const printLabel =
  () => {
   window.print();
  };

 return (
  <Modal
   open={open}
   footer={null}
   width={360}
   onCancel={onCancel}
   title="Asset QR Label"
  >
   {asset && (
    <Space
     direction="vertical"
     align="center"
     style={{
      width: "100%",
     }}
    >
     <QRCodeCanvas
      value={value}
      size={180}
     />

     <Title
      level={5}
      style={{
       margin: 0,
      }}
     >
      {asset.asset_code}
     </Title>

     <Text>
      {asset.asset_name}
     </Text>

     <Button
      type="primary"
      onClick={
       printLabel
      }
     >
      Print Label
     </Button>
    </Space>
   )}
  </Modal>
 );
}