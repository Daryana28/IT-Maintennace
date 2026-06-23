import { useState } from "react";
import { Row, Col, Card, Typography, Table, Tag, Button, Progress, Avatar, Space, Modal } from "antd";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  PieChartOutlined,
  ToolOutlined,
  DesktopOutlined,
  ReloadOutlined,
  CalendarOutlined,
  FundProjectionScreenOutlined,
  UserOutlined,
  MoreOutlined
} from "@ant-design/icons";
import "./DashboardPage.css";

const { Title, Text } = Typography;

// SECTION HEAD COMPONENT
const SectionHeader = ({ icon, title, subtitle }) => {
  return (
    <div className="section-head-wrap" style={{ marginTop: '24px', marginBottom: '16px' }}>
      <div className="section-head-icon-box" style={{ background: '#e6f7ff', padding: '12px', borderRadius: '8px', color: '#1890ff' }}>{icon}</div>
      <div className="section-head-text-wrap">
        <h2 className="section-head-title" style={{ fontSize: '18px', fontWeight: 'bold' }}>{title}</h2>
        <p className="section-head-subtitle" style={{ fontSize: '13px', color: '#8c8c8c' }}>{subtitle}</p>
      </div>
    </div>
  );
};

// --- MOCK DATA ---

// Budget
const mockAsset = [
  { key: "1", poDate: "2026-07-15", budgetCode: "BDG-2026-004", itemName: "UPS APC 1000VA", initialBudget: "Rp 15.000.000", status: "Plan" },
  { key: "2", poDate: "2026-08-10", budgetCode: "BDG-2026-005", itemName: "Switch Hub 24 Port", initialBudget: "Rp 8.500.000", status: "PV" },
  { key: "3", poDate: "2026-09-05", budgetCode: "BDG-2026-006", itemName: "MacBook Pro M3", initialBudget: "Rp 45.000.000", status: "PO" },
  { key: "4", poDate: "2026-09-10", budgetCode: "BDG-2026-007", itemName: "Server Rack", initialBudget: "Rp 120.000.000", status: "Delivery" },
  { key: "5", poDate: "2026-09-15", budgetCode: "BDG-2026-008", itemName: "Access Point", initialBudget: "Rp 12.000.000", status: "Installation" },
  { key: "6", poDate: "2026-09-20", budgetCode: "BDG-2026-009", itemName: "CCTV Camera", initialBudget: "Rp 25.000.000", status: "Invoice" },
  { key: "7", poDate: "2026-09-25", budgetCode: "BDG-2026-010", itemName: "Laptop Managerial", initialBudget: "Rp 75.000.000", status: "Closed" },
];

const budgetColumns = [
  { title: "PO DATE", dataIndex: "poDate", key: "poDate" },
  { title: "BUDGET CODE", dataIndex: "budgetCode", key: "budgetCode" },
  { title: "ITEM NAME", dataIndex: "itemName", key: "itemName" },
  { title: "INITIAL BUDGET", dataIndex: "initialBudget", key: "initialBudget" },
  {
    title: "STATUS",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      let color = "default";
      switch(status) {
        case "Plan": color = "default"; break;
        case "PV": color = "blue"; break;
        case "PO": color = "cyan"; break;
        case "Delivery": color = "orange"; break;
        case "Installation": color = "purple"; break;
        case "Invoice": color = "magenta"; break;
        case "Closed": color = "green"; break;
        default: color = "default";
      }
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: "",
    key: "action",
    render: () => <Button type="text" icon={<MoreOutlined />} />
  }
];

const mockOpBudget = [
  { key: "1", budgetCode: "OP-2026-001", itemName: "Microsoft 365", status: "Invoice", julPlan: 10000000, julActual: 10000000, augPlan: 10000000, augActual: 10000000, sepPlan: 10000000, sepActual: 10000000 },
  { key: "2", budgetCode: "OP-2026-002", itemName: "AWS Hosting", status: "PO", julPlan: 5000000, julActual: 4900000, augPlan: 5000000, augActual: 5000000, sepPlan: 5000000, sepActual: 4800000 },
  { key: "3", budgetCode: "OP-2026-003", itemName: "Internet ISP", status: "Closed", julPlan: 3000000, julActual: 3000000, augPlan: 3000000, augActual: 3000000, sepPlan: 3000000, sepActual: 3000000 }
];

const opBudgetColumns = [
  { title: "BUDGET CODE", dataIndex: "budgetCode", key: "budgetCode", width: 120 },
  { title: "ITEM NAME", dataIndex: "itemName", key: "itemName", width: 140 },
  ...["Jul", "Aug", "Sep"].map(m => ({
    title: m.toUpperCase(),
    key: m.toLowerCase(),
    width: 110,
    render: (_, record) => {
      const plan = record[`${m.toLowerCase()}Plan`];
      const actual = record[`${m.toLowerCase()}Actual`];
      const formatCurrency = (val) => new Intl.NumberFormat("id-ID", { notation: "compact", compactDisplay: "short" }).format(val);
      return (
        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '10px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>Plan</span>
            <span style={{ color: '#475569', fontWeight: 500 }}>{formatCurrency(plan)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#059669', fontSize: '10px', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Act</span>
            <span style={{ color: '#059669', fontWeight: 700 }}>{formatCurrency(actual)}</span>
          </div>
        </div>
      );
    }
  })),
  {
    title: "STATUS",
    dataIndex: "status",
    key: "status",
    width: 90,
    align: "center",
    render: (status) => {
      let color = "default";
      switch(status) {
        case "Plan": color = "default"; break;
        case "PV": color = "blue"; break;
        case "PO": color = "cyan"; break;
        case "Delivery": color = "orange"; break;
        case "Installation": color = "purple"; break;
        case "Invoice": color = "magenta"; break;
        case "Closed": color = "green"; break;
        default: color = "default";
      }
      return <Tag color={color}>{status}</Tag>;
    },
  }
];

// Maintenance Logsheet
const mockMaintLogs = [
  { key: "1", date: "Monday, Oct 14", code: "Server Rack 1", personnel: "Sarius Sopmon" },
  { key: "2", date: "Monday, Oct 14", code: "CCTV Warehouse", personnel: "Danii Achert" },
  { key: "3", date: "Sunday, Oct 13", code: "Genset Building A", personnel: "John Smith" },
  { key: "4", date: "Saturday, Oct 12", code: "CCTV Rack1", personnel: "John Rovh" },
  { key: "5", date: "Friday, Oct 11", code: "Server Rack", personnel: "John Rovh" },
];

export default function Dashboard() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const handleViewLog = (record) => {
    setSelectedLog(record);
    setIsModalVisible(true);
  };

  const tableProps = {
    pagination: false,
    size: "small",
    scroll: { y: 250 },
  };

  const maintLogColumns = [
    { title: "DATE", dataIndex: "date", key: "date", render: (text) => <strong>{text}</strong> },
    { title: "CODE", dataIndex: "code", key: "code" },
    {
      title: "PERSONNEL",
      dataIndex: "personnel",
      key: "personnel",
      render: (name) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{name}</span>
        </Space>
      )
    },
    {
      title: "",
      key: "action",
      render: (_, record) => <Button size="small" onClick={() => handleViewLog(record)}>View Log</Button>,
    },
  ];

  return (
    <div className="dashboard-page">
      {/* PAGE HEADER */}
      <div className="dashboard-page-head">
        <div>
          <h1 className="dashboard-page-title">Dashboard</h1>
          <div className="dashboard-page-subtitle">Welcome to ITAM Platform</div>
        </div>

        <div className="dashboard-actions">
          <div className="dashboard-status-badge">
            <span className="status-dot" />
            System Operational
          </div>

          <Button type="default" icon={<ReloadOutlined />} className="dashboard-refresh-btn">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* BUDGET SECTION */}
      <section className="section-wrap">
        <Row gutter={[24, 24]}>
          <Col xs={24} xl={12}>
            <Card title="Asset Budget (BA)" hoverable variant="borderless" className="table-card" style={{ height: '380px' }}>
              <Table dataSource={mockAsset} columns={budgetColumns} {...tableProps} />
            </Card>
          </Col>
          <Col xs={24} xl={12}>
            <Card title="Operational Budget (Next 3 Months)" hoverable variant="borderless" className="table-card" style={{ height: '380px' }}>
              <Table dataSource={mockOpBudget} columns={opBudgetColumns} {...tableProps} />
            </Card>
          </Col>
        </Row>
      </section>

      {/* MAINTENANCE SECTION */}
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={24}>
          <SectionHeader
            icon={<ToolOutlined />}
            title="Maintenance Logsheet"
            subtitle="Riwayat aktivitas pemeliharaan aset dan infrastruktur IT yang telah dilakukan."
          />
          <Card title="Maintenance Activity Log" hoverable variant="borderless" className="table-card" style={{ height: '380px' }}>
            <Table dataSource={mockMaintLogs} columns={maintLogColumns} {...tableProps} />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Maintenance Log Detail"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedLog && (
          <div>
            <p><strong>Date:</strong> {selectedLog.date}</p>
            <p><strong>Code:</strong> {selectedLog.code}</p>
            <p><strong>Personnel:</strong> {selectedLog.personnel}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}