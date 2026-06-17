// fe\src\modules\itam\assets\components\form\FinanceSection.jsx
import {
 Col,
 DatePicker,
 Divider,
 Form,
 Row,
} from "antd";

export default function FinanceSection({
 onPurchaseChange,
}) {
 return (
  <>
   <Divider orientation="left">
    Financial
   </Divider>

   <Row gutter={16}>
    <Col xs={24} md={12}>
     <Form.Item
      name="purchase_date"
      label="Pembelian"
     >
      <DatePicker
       style={{
        width:
         "100%",
       }}
       onChange={
        onPurchaseChange
       }
      />
     </Form.Item>
    </Col>

    <Col xs={24} md={12}>
     <Form.Item
      name="depreciation_date"
      label="Depresiasi"
     >
      <DatePicker
       style={{
        width:
         "100%",
       }}
      />
     </Form.Item>
    </Col>
   </Row>
  </>
 );
}