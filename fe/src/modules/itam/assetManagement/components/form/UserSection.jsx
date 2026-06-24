// fe\src\modules\itam\assets\components\form\UserSection.jsx
import {
  Col,
  Divider,
  Form,
  Input,
  Row,
} from "antd";

import { getWorkbookTabFieldLabels } from "../../utils/assetWorkbookTabs";

export default function UserSection({
  typeProfile,
  workbookTabKey = "",
}) {
  const isWorkbookMode = Boolean(workbookTabKey);
  const workbookLabels = getWorkbookTabFieldLabels(workbookTabKey);
  return (
    <>
      <Divider orientation="left">
        {typeProfile.userSectionTitle}
      </Divider>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="division"
            label={isWorkbookMode ? workbookLabels.division : "Division"}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="department"
            label={isWorkbookMode ? workbookLabels.department : "Department"}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="owner_name"
            label={isWorkbookMode ? workbookLabels.ownerName : typeProfile.ownerNameLabel}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="nik"
            label={isWorkbookMode ? workbookLabels.nik : "NIK"}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
