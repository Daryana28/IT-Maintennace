// fe\src\modules\itam\assets\components\form\UserSection.jsx
import {
  Col,
  Divider,
  Form,
  Input,
  Row,
} from "antd";

export default function UserSection() {
  return (
    <>
      <Divider orientation="left">
        User Assignment
      </Divider>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="division"
            label="Division"
          >
            <Input />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="department"
            label="Department"
          >
            <Input />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="owner_name"
            label="Nama User"
          >
            <Input />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="nik"
            label="NIK"
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}