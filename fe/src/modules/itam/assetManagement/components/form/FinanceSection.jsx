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
 typeProfile,
}) {
 return (
  <>
   <Divider orientation="left">
    {typeProfile.financeSectionTitle}
   </Divider>

   <Row gutter={16}>
    <Col xs={24} md={12}>
     <Form.Item
      name="purchase_date"
      label={typeProfile.purchaseDateLabel}
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
      label={typeProfile.depreciationDateLabel}
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
