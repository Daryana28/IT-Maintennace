import { memo } from "react";
import { Row, Col, Space, Button, Typography } from "antd";
import {
    ExportOutlined,
    FilterOutlined,
    CalendarOutlined,
    SyncOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const SchedulePageHeader = memo(function SchedulePageHeader({
    loading,
    onExport,
    onHoliday,
    onSync,
    isReadOnly,
}) {
    return (
        <div className="premium-header-card">
            <Row justify="space-between" align="middle">
                <Col>
                    <Title level={3} className="page-title">
                        Jadwal Maintenance
                    </Title>
                    <div className="page-breadcrumb">
                        Maintenance / Penjadwalan
                    </div>
                </Col>
                <Col>
                    <Space size="middle">
                        <Button
                            icon={<ExportOutlined />}
                            className="action-btn-secondary"
                            onClick={onExport}
                        >
                            Export
                        </Button>
                        <Button
                            icon={<FilterOutlined />}
                            className="action-btn-secondary"
                        >
                            Filter
                        </Button>
                        {!isReadOnly && (
                            <>
                                <Button
                                    icon={<CalendarOutlined />}
                                    className="action-btn-secondary"
                                    onClick={onHoliday}
                                >
                                    Kelola Hari Libur
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<SyncOutlined />}
                                    className="action-btn-primary"
                                    loading={loading}
                                    onClick={onSync}
                                >
                                    Sync Standard Maintenance
                                </Button>
                            </>
                        )}
                    </Space>
                </Col>
            </Row>
        </div>
    );
});

export default SchedulePageHeader;