import { memo } from "react";
import { Row, Col, DatePicker, Select, Button, Segmented, Typography } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const ScheduleFilterBar = memo(function ScheduleFilterBar({
    viewMode,
    onViewModeChange,
    onSearch,
    onReset,
    currentDate,
    onDateChange,
    categories = [],
    selectedCategory = "Semua",
    onCategoryChange,
}) {
    return (
        <div className="filter-container">
            <Row gutter={[24, 16]} align="bottom">
                {viewMode !== "yearly" && (
                <Col xs={24} md={6}>
                    <Text className="filter-label">Periode Waktu</Text>
                    <RangePicker
                        className="premium-input"
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        value={Array.isArray(currentDate) ? currentDate : [currentDate, currentDate]}
                        onChange={(dates) => {
                            if (dates) onDateChange(dates);
                        }}
                        allowClear={false}
                    />
                </Col>
                )}
                <Col xs={24} md={5}>
                    <Text className="filter-label">Sub Kategori</Text>
                    <Select
                        value={selectedCategory}
                        onChange={onCategoryChange}
                        className="premium-input"
                        style={{ width: "100%" }}
                        showSearch
                    >
                        <Select.Option value="Semua">Semua Sub Kategori</Select.Option>
                        {categories.map((cat, idx) => (
                            <Select.Option key={idx} value={cat}>{cat}</Select.Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} md={5}>
                    <Text className="filter-label">Lokasi / Area</Text>
                    <Select
                        defaultValue="Semua"
                        className="premium-input"
                        style={{ width: "100%" }}
                    >
                        <Select.Option value="Semua">
                            Semua Area
                        </Select.Option>
                    </Select>
                </Col>
                <Col xs={24} md={5}>
                    <Text className="filter-label">Tampilan</Text>
                    <Segmented
                        options={[
                            { label: "1 Hari", value: "daily" },
                            { label: "1 Minggu", value: "weekly" },
                            { label: "1 Bulan", value: "monthly" },
                            { label: "Tahunan", value: "yearly" },
                        ]}
                        value={viewMode}
                        onChange={onViewModeChange}
                        className="premium-segmented"
                        block
                    />
                </Col>
                <Col xs={24} md={3}>
                    <div className="filter-actions">
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            className="action-btn-primary search-btn"
                            onClick={onSearch}
                        >
                            Cari
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            className="action-btn-secondary"
                            onClick={onReset}
                        >
                            Reset
                        </Button>
                    </div>
                </Col>
            </Row>
        </div>
    );
});

export default ScheduleFilterBar;