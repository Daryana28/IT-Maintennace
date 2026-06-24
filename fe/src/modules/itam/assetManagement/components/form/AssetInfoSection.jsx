// fe\src\modules\itam\assets\components\form\AssetInfoSection.jsx
import {
 Col,
 Divider,
 Form,
 Input,
 Row,
 Select,
} from "antd";

import { getWorkbookTabFieldLabels } from "../../utils/assetWorkbookTabs";

const WORKBOOK_STATUS_OPTIONS = [
 { value: "ACTIVE", label: "ACTIVE" },
 { value: "NON ACTIVE", label: "NON ACTIVE" },
];

export default function AssetInfoSection({
 rootOptions,
 mainTypeOptions,
 lv2Options,
 lv3Options,
 form,
 typeProfile,
 workbookTabKey = "",
}) {
 const profile = typeProfile;
 const isWorkbookMode = Boolean(workbookTabKey);
 const workbookLabels = getWorkbookTabFieldLabels(workbookTabKey);
 const statusOptions = isWorkbookMode
  ? WORKBOOK_STATUS_OPTIONS
  : profile.statusOptions;

 return (
  <>
   <Divider orientation="left">
    {profile.assetSectionTitle}
   </Divider>

   <Row gutter={16}>
    <Col xs={24} md={12}>
     <Form.Item
      name="asset_code"
      label={isWorkbookMode ? workbookLabels.assetCode : "Asset Code"}
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
      label={isWorkbookMode ? workbookLabels.type : "Asset Name"}
      rules={[
       {
         required: true,
       },
      ]}
     >
      <Input />
     </Form.Item>
    </Col>

    {!isWorkbookMode && (
     <>
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
     </>
    )}
    
    {!isWorkbookMode && (
     <Col xs={24} md={12}>
      <Form.Item
       name="serial_number"
       label={profile.serialNumberLabel}
      >
       <Input />
      </Form.Item>
     </Col>
    )}

    <Col xs={24} md={12}>
     <Form.Item
      name="hostname"
      label={isWorkbookMode ? workbookLabels.hostname : profile.hostnameLabel}
     >
      <Input />
     </Form.Item>
    </Col>

    <Col xs={24} md={12}>
     <Form.Item
      name="status"
      label={isWorkbookMode ? workbookLabels.status : "Status"}
      rules={[
       {
        required: true,
       },
      ]}
     >
      <Select
       options={statusOptions}
      />
     </Form.Item>
    </Col>
   </Row>
  </>
 );
}
