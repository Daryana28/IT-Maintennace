import { Row, Col, Card, Typography, Table, Tag, Button, Progress, Avatar, Space } from "antd";
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
  { key: "1", period: "Bulan ini", budgetCode: "BA-001", itemName: "Laptop Lenovo Thinkpad", initialBudget: "Rp 150.000.000", status: "Plan" },
  { key: "2", period: "Bulan ini", budgetCode: "BA-002", itemName: "Server Rack", initialBudget: "Rp 350.000.000", status: "Done" },
  { key: "3", period: "Bulan ini", budgetCode: "BA-003", itemName: "Dell P2419H Monitor", initialBudget: "Rp 150.000.000", status: "Plan" },
  { key: "4", period: "3 Bulan Kedepan", budgetCode: "BA-004", itemName: "Cisco Switch", initialBudget: "Rp 75.000.000", status: "Plan" },
];

const budgetColumns = [
  { title: "PERIODE", dataIndex: "period", key: "period" },
  { title: "BUDGET CODE", dataIndex: "budgetCode", key: "budgetCode" },
  { title: "ITEM NAME", dataIndex: "itemName", key: "itemName" },
  { title: "INITIAL BUDGET", dataIndex: "initialBudget", key: "initialBudget" },
  {
    title: "STATUS",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      let color = status === "Done" ? "green" : "blue";
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: "",
    key: "action",
    render: () => <Button type="text" icon={<MoreOutlined />} />
  }
];

const mockBarData = [
  { name: 'RM-001', Planned: 90, Actual: 75 },
  { name: 'RM-002', Planned: 65, Actual: 45 },
  { name: 'RM-003', Planned: 80, Actual: 35 },
  { name: 'RM-004', Planned: 95, Actual: 30 },
  { name: 'RM-005', Planned: 80, Actual: 25 },
  { name: 'RM-006', Planned: 45, Actual: 15 },
];

// Asset Lifecycle
const mockUrgentReplacements = [
  { key: "1", action: "Replace", assetCode: "AST-001", notes: "Monitor Dell 24 inch reason" },
  { key: "2", action: "Replace", assetCode: "AST-002", notes: "Current Notice-mason reason" },
  { key: "3", action: "Replace", assetCode: "AST-003", notes: "Dell 19H Monitor" },
  { key: "4", action: "Dispose", assetCode: "AST-004", notes: "Dell P2419H Monitor" },
  { key: "5", action: "Dispose", assetCode: "AST-005", notes: "Keyboard Mechanical" },
];

const assetColumns = [
  {
    title: "ACTION",
    dataIndex: "action",
    key: "action",
    render: (action) => (
      <span style={{ borderLeft: `3px solid ${action === 'Replace' ? '#faad14' : '#f5222d'}`, paddingLeft: '8px' }}>
        {action}
      </span>
    )
  },
  { title: "ASSET CODE", dataIndex: "assetCode", key: "assetCode" },
  { title: "NOTES", dataIndex: "notes", key: "notes" },
  {
    title: "STATUS",
    key: "status",
    render: () => <Button size="small">Order</Button>,
  },
];

// Maintenance Calendar
const mockMaintCalendar = [
  { key: "1", date: "Tuesday, Oct 15", code: "Server Rack 1", personnel: "Sarius Sopmon" },
  { key: "2", date: "Tuesday, Oct 15", code: "CCTV Warehouse", personnel: "Danii Achert" },
  { key: "3", date: "Tuesday, Oct 15", code: "Genset Building A", personnel: "John Smith" },
  { key: "4", date: "Tuesday, Oct 15", code: "CCTV Rack1", personnel: "John Rovh" },
  { key: "5", date: "Tuesday, Oct 15", code: "Server Rack", personnel: "John Rovh" },
];

const maintColumns = [
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
    render: () => <Button size="small">View Details</Button>,
  },
];

export default function Dashboard() {
  const tableProps = {
    pagination: false,
    size: "small",
    scroll: { y: 250 },
  };

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
            <Card title="Maintenance Budget (RM)" hoverable variant="borderless" className="table-card" style={{ height: '380px' }}>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <BarChart data={mockBarData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => val} />
                    <RechartsTooltip />
                    <Legend verticalAlign="top" align="right" iconType="square" wrapperStyle={{ paddingBottom: '20px' }} />
                    <Bar dataKey="Planned" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="Actual" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ textAlign: 'center', color: '#8c8c8c', fontSize: '12px', marginTop: '-10px' }}>
                Planned vs. Actual Spend
              </div>
            </Card>
          </Col>
        </Row>
      </section>

      {/* ASSET & MAINTENANCE SECTION */}
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={12}>
          <SectionHeader
            icon={<DesktopOutlined />}
            title="Asset Status"
            subtitle="Status terkini untuk pergantian dan pembuangan aset."
          />
          <Card title="Asset Lifecycle Management" hoverable variant="borderless" className="table-card" style={{ height: '380px' }}>
            <div style={{ display: 'flex', height: '100%', gap: '24px' }}>
              {/* Donut Chart */}
              <div style={{ flex: '0 0 160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ height: '140px', width: '140px' }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: 40, color: '#3b82f6' },
                          { name: 'Replace', value: 30, color: '#22c55e' },
                          { name: 'Replace 2', value: 15, color: '#fbbf24' },
                          { name: 'Dispose', value: 15, color: '#ef4444' }
                        ]}
                        innerRadius={35}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {[
                          { name: 'Active', value: 40, color: '#3b82f6' },
                          { name: 'Replace', value: 30, color: '#22c55e' },
                          { name: 'Replace 2', value: 15, color: '#fbbf24' },
                          { name: 'Dispose', value: 15, color: '#ef4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
                  <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span> Active</div>
                  <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span> Replace</div>
                  <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }}></span> Replace</div>
                  <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span> Dispose</div>
                </div>
              </div>

              {/* Table */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Urgent Replacements</div>
                <Table dataSource={mockUrgentReplacements} columns={assetColumns} {...tableProps} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <SectionHeader
            icon={<ToolOutlined />}
            title="Maintenance Schedule"
            subtitle="Jadwal pemeliharaan aset dan infrastruktur IT."
          />
          <Card title="Maintenance Calendar & Log" hoverable variant="borderless" className="table-card" style={{ height: '380px' }}>
            <Table dataSource={mockMaintCalendar} columns={maintColumns} {...tableProps} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}