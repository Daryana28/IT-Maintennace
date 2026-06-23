// fe\src\modules\itam\assets\components\form\NetworkSection.jsx
import {
  Col,
  Divider,
  Form,
  Input,
  Row,
} from "antd";

export default function NetworkSection({
  typeProfile,
}) {
  return (
    <>
      <Divider orientation="left">
        {typeProfile.networkSectionTitle}
      </Divider>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="ip_main"
            label={typeProfile.ipMainLabel}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="ip_backup"
            label={typeProfile.ipBackupLabel}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
