import React, { useState } from "react";
import { Typography, Space, Select, Button, Tag, Table, Tooltip, Input } from "antd";
import { FilterOutlined, DownloadOutlined, CalendarOutlined, SearchOutlined } from "@ant-design/icons";
import "./AssetBudgetSchedulePage.css";

const { Title, Text } = Typography;
const { Option } = Select;

export default function OperationalBudgetSchedulePage() {
  const [year, setYear] = useState("2026");

  const data = [
    { key: "1", budgetCode: "OP-2026-001", itemName: "Microsoft 365", status: "Invoice", startMonth: 7, endMonth: 9, budget: "Rp 30.000.000" },
    { key: "2", budgetCode: "OP-2026-002", itemName: "AWS Hosting", status: "PO", startMonth: 7, endMonth: 9, budget: "Rp 14.800.000" },
    { key: "3", budgetCode: "OP-2026-003", itemName: "Internet ISP", status: "Closed", startMonth: 7, endMonth: 9, budget: "Rp 9.000.000" }
  ];

  const getStatusColor = (status, isGradient = false) => {
    switch(status) {
      case "Plan": return isGradient ? "linear-gradient(90deg, #d9d9d9, #bfbfbf)" : "default";
      case "PV": return isGradient ? "linear-gradient(90deg, #69c0ff, #1890ff)" : "blue";
      case "PO": return isGradient ? "linear-gradient(90deg, #5cdbd3, #13c2c2)" : "cyan";
      case "Delivery": return isGradient ? "linear-gradient(90deg, #ffc069, #fa8c16)" : "orange";
      case "Installation": return isGradient ? "linear-gradient(90deg, #b37feb, #722ed1)" : "purple";
      case "Invoice": return isGradient ? "linear-gradient(90deg, #ffadd2, #eb2f96)" : "magenta";
      case "Closed": return isGradient ? "linear-gradient(90deg, #95de64, #52c41a)" : "green";
      default: return isGradient ? "linear-gradient(90deg, #d9d9d9, #bfbfbf)" : "default";
    }
  };

  const renderStatus = (status) => {
    return <Tag color={getStatusColor(status, false)}>{status}</Tag>;
  };

  const renderGanttCell = (record, month) => {
    const isWithin = month >= record.startMonth && month <= record.endMonth;
    if (!isWithin) return null;

    const isStart = month === record.startMonth;
    const isEnd = month === record.endMonth;
    const borderRadius = `${isStart ? '14px' : '0'} ${isEnd ? '14px' : '0'} ${isEnd ? '14px' : '0'} ${isStart ? '14px' : '0'}`;

    return (
      <Tooltip title={`${record.itemName} - ${record.status} (${record.budget})`} placement="topLeft">
        <div
          className="gantt-cell-content"
          style={{
            background: getStatusColor(record.status, true),
            borderRadius: borderRadius,
            width: "100%",
            justifyContent: isStart ? "flex-start" : "center",
          }}
        >
          {isStart && <span className="gantt-text">{record.status}</span>}
        </div>
      </Tooltip>
    );
  };

  const renderMonthCol = (title, dataIndex, monthIndex) => ({
    title: <div style={{ textAlign: 'center' }}>{title}</div>,
    key: dataIndex,
    width: 90,
    align: "center",
    className: "gantt-cell",
    render: (_, record) => renderGanttCell(record, monthIndex)
  });

  const columns = [
    { title: "Budget Code", dataIndex: "budgetCode", key: "budgetCode", width: 140, fixed: 'left' },
    { title: "Item Name", dataIndex: "itemName", key: "itemName", width: 200, fixed: 'left' },
    { title: "Status", dataIndex: "status", key: "status", width: 110, render: renderStatus, fixed: 'left' },
    renderMonthCol("Jul", "m7", 7),
    renderMonthCol("Aug", "m8", 8),
    renderMonthCol("Sep", "m9", 9),
    renderMonthCol("Oct", "m10", 10),
    renderMonthCol("Nov", "m11", 11),
    renderMonthCol("Dec", "m12", 12),
  ];

  const legendItems = ["Plan", "PV", "PO", "Delivery", "Installation", "Invoice", "Closed"];

  return (
    <div className="budget-schedule-page" style={{ padding: "24px" }}>
      <div className="schedule-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#e6f7ff', padding: '12px', borderRadius: '12px', color: '#1890ff' }}>
            <CalendarOutlined style={{ fontSize: '24px' }} />
          </div>
          <div>
            <Title level={3} className="schedule-title">Operational Budget Monitoring Progress</Title>
            <Text type="secondary">Monitoring progress budget operasional untuk 3 bulan ke depan</Text>
          </div>
        </div>
        <Space size="middle">
          <Input placeholder="Cari item..." prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} style={{ width: 250, borderRadius: '6px' }} />
          <Select value={year} onChange={setYear} style={{ width: 100 }} size="large">
            <Option value="2026">2026</Option>
            <Option value="2027">2027</Option>
          </Select>
          <Button icon={<FilterOutlined />} size="large">Filter</Button>
          <Button type="primary" icon={<DownloadOutlined />} size="large">Export</Button>
        </Space>
      </div>

      <div className="timeline-table-card" style={{ background: '#fff', padding: '24px' }}>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: 1200 }}
          bordered={false}
          size="middle"
          className="timeline-table"
        />

        <div className="status-legend">
          <Text strong style={{ marginRight: '8px' }}>Status Legend :</Text>
          {legendItems.map((status) => (
            <div key={status} className="status-legend-item">
              <span className="status-dot" style={{ background: getStatusColor(status, true) }}></span>
              {status}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
