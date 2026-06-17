// fe\src\modules\itam\assets\components\form\NetworkSection.jsx
import {
  Col,
  Divider,
  Form,
  Input,
  Row,
} from "antd";

export default function NetworkSection() {
  return (
    <>
      <Divider orientation="left">
        Network
      </Divider>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="ip_main"
            label="IP Main"
          >
            <Input />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="ip_backup"
            label="IP Backup"
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}