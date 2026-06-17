// fe\src\modules\itam\assets\components\form\ClassificationSection.jsx
import {
  Checkbox,
  Col,
  Divider,
  Form,
  Row,
} from "antd";

export default function ClassificationSection() {
  return (
    <>
      <Divider orientation="left">
        User Classification
      </Divider>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            name="cls_managerial"
            valuePropName="checked"
          >
            <Checkbox>
              Managerial
            </Checkbox>
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            name="cls_meeting"
            valuePropName="checked"
          >
            <Checkbox>
              Meeting
            </Checkbox>
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            name="cls_teknikal"
            valuePropName="checked"
          >
            <Checkbox>
              Teknikal
            </Checkbox>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}