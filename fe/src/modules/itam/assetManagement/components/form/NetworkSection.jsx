// fe\src\modules\itam\assets\components\form\NetworkSection.jsx
import {
  Col,
  Divider,
  Form,
  Input,
  Row,
} from "antd";

import { getWorkbookTabFieldLabels } from "../../utils/assetWorkbookTabs";

export default function NetworkSection({
  typeProfile,
  workbookTabKey = "",
}) {
  const isWorkbookMode = Boolean(workbookTabKey);
  const workbookLabels = getWorkbookTabFieldLabels(workbookTabKey);
  return (
    <>
      <Divider orientation="left">
        {typeProfile.networkSectionTitle}
      </Divider>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="ip_main"
            label={isWorkbookMode ? workbookLabels.ipMain : typeProfile.ipMainLabel}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="ip_backup"
            label={isWorkbookMode ? workbookLabels.ipBackup : typeProfile.ipBackupLabel}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
