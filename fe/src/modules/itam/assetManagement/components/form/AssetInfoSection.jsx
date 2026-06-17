// fe\src\modules\itam\assets\components\form\AssetInfoSection.jsx
import {
 Col,
 Divider,
 Form,
 Input,
 Row,
 Select,
} from "antd";

const STATUS_OPTIONS = [
 {
  value: "ACTIVE",
  label: "ACTIVE",
 },
 {
  value: "INACTIVE",
  label: "INACTIVE",
 },
 {
  value: "REPAIR",
  label: "REPAIR",
 },
 {
  value: "STOCK",
  label: "STOCK",
 },
 {
  value: "SCRAP",
  label: "SCRAP",
 },
];

export default function AssetInfoSection({
 rootOptions,
 mainTypeOptions,
 lv2Options,
 lv3Options,
 form,
}) {
 return (
  <>
   <Divider orientation="left">
    Asset Info
   </Divider>

   <Row gutter={16}>
    <Col xs={24} md={12}>
     <Form.Item
      name="asset_code"
      label="No Asset"
      rules={[
       {
        required: true,
       },
      ]}
     >
      <Input />
     </Form.Item>
    </Col>

    <Col xs={24} md={12}>
     <Form.Item
      name="asset_name"
      label="Nama Asset"
      rules={[
       {
        required: true,
       },
      ]}
     >
      <Input />
     </Form.Item>
    </Col>

    <Col xs={24} md={12}>
     <Form.Item
      name="category_lv1"
      label="Type"
      rules={[
       {
        required: true,
       },
      ]}
     >
      <Select
       showSearch
       optionFilterProp="label"
       options={rootOptions}
       onChange={() =>
        form.setFieldsValue({
         main_type: null,
         category_lv2: null,
         category_id: null,
        })
       }
      />
     </Form.Item>
    </Col>

    <Col xs={24} md={12}>
     <Form.Item
      name="main_type"
      label="Main Type"
      rules={[
       {
        required: true,
       },
      ]}
     >
      <Select
       showSearch
       optionFilterProp="label"
       options={
        mainTypeOptions
       }
       onChange={() =>
        form.setFieldsValue({
         category_lv2:
          null,
         category_id:
          null,
        })
       }
      />
     </Form.Item>
    </Col>

    <Col xs={24} md={12}>
     <Form.Item
      name="category_lv2"
      label="Kategori"
      rules={[
       {
        required: true,
       },
      ]}
     >
      <Select
       showSearch
       optionFilterProp="label"
       options={
        lv2Options
       }
       onChange={() =>
        form.setFieldsValue({
         category_id:
          null,
        })
       }
      />
     </Form.Item>
    </Col>

    <Col xs={24} md={12}>
     <Form.Item
      name="category_id"
      label="Sub Kategori"
     >
      <Select
       allowClear
       showSearch
       optionFilterProp="label"
       options={
        lv3Options
       }
      />
     </Form.Item>
    </Col>
    
    <Col xs={24} md={12}>
     <Form.Item
      name="serial_number"
      label="Serial Number"
     >
      <Input />
     </Form.Item>
    </Col>

    <Col xs={24} md={12}>
     <Form.Item
      name="hostname"
      label="Hostname"
     >
      <Input />
     </Form.Item>
    </Col>

    <Col xs={24} md={12}>
     <Form.Item
      name="status"
      label="Status"
      rules={[
       {
        required: true,
       },
      ]}
     >
      <Select
       options={
        STATUS_OPTIONS
       }
      />
     </Form.Item>
    </Col>
   </Row>
  </>
 );
}