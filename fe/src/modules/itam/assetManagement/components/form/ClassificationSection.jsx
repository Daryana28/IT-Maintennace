// fe\src\modules\itam\assets\components\form\ClassificationSection.jsx
import {
  Checkbox,
  Col,
  Divider,
  Form,
  Row,
} from "antd";

export default function ClassificationSection({
  typeProfile,
}) {
  return (
    <>
      <Divider orientation="left">
        {typeProfile.classificationSectionTitle}
      </Divider>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            name="cls_managerial"
            valuePropName="checked"
          >
            <Checkbox>
              {typeProfile.classificationLabels[0]}
            </Checkbox>
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            name="cls_meeting"
            valuePropName="checked"
          >
            <Checkbox>
              {typeProfile.classificationLabels[1]}
            </Checkbox>
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            name="cls_teknikal"
            valuePropName="checked"
          >
            <Checkbox>
              {typeProfile.classificationLabels[2]}
            </Checkbox>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
