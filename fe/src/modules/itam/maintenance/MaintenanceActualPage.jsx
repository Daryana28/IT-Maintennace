import React, { useState } from "react";
import {
  Card,
  Typography,
  Table,
  Button,
  Select,
  DatePicker,
  Row,
  Col,
  Space,
  Tabs,
  Tag,
  Image,
} from "antd";
import {
  ExportOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { RangePicker } = DatePicker;

// Dummy data for Actual Maintenance
const data = [
  {
    key: "1",
    no: "1",
    tanggal: "10 May 2024\n09:45",
    tipe: "Daily",
    area: "Data Center 1",
    perangkat: "Server",
    hostname: "AVANZA-001",
    deviceName: "AST004 - Dell\nPowerEdge Server",
    teknisi: "Budi Santoso",
    deskripsi: "Pemeriksaan suhu, log system,\ndan service hardware",
    status: "Selesai",
    durasi: "45 mnt",
  },
  {
    key: "2",
    no: "2",
    tanggal: "09 May 2024\n10:30",
    tipe: "Weekly",
    area: "Network Room",
    perangkat: "Switch",
    hostname: "SW-2960-01",
    deviceName: "AST003 - Cisco\nSwitch 2960",
    teknisi: "Andi Pratama",
    deskripsi: "Pemeriksaan konektivitas port,\nlink status, dan konfigurasi",
    status: "Selesai",
    durasi: "30 mnt",
  },
  {
    key: "3",
    no: "3",
    tanggal: "08 May 2024\n15:00",
    tipe: "Semester",
    area: "IT Department",
    perangkat: "Laptop",
    hostname: "LENOVO-TP-01",
    deviceName: "AST001 - Lenovo\nThinkPad",
    teknisi: "Rizky Kurniawan",
    deskripsi: "Pembersihan internal, update\nOS, dan pengecekan performa",
    status: "Selesai",
    durasi: "1 jam",
  },
  {
    key: "4",
    no: "4",
    tanggal: "07 May 2024\n15:30",
    tipe: "Tahunan",
    area: "Finance Room",
    perangkat: "Printer",
    hostname: "HP-LJ-01",
    deviceName: "AST005 - HP\nLaserJet Printer",
    teknisi: "Siti Aisyah",
    deskripsi: "Service berkala, ganti part,\ndan calibration",
    status: "Selesai",
    durasi: "2 jam",
  },
  {
    key: "5",
    no: "5",
    tanggal: "06 May 2024\n09:40",
    tipe: "Daily",
    area: "Data Center 1",
    perangkat: "UPS",
    hostname: "APC-UPS-01",
    deviceName: "AST002 - APC UPS\n3000VA",
    teknisi: "Budi Santoso",
    deskripsi: "Pemeriksaan kapasitas\nbattery dan beban",
    status: "Selesai",
    durasi: "25 mnt",
  },
  {
    key: "6",
    no: "6",
    tanggal: "05 May 2024\n12:00",
    tipe: "Weekly",
    area: "Server Room",
    perangkat: "Firewall",
    hostname: "FW-FORT-01",
    deviceName: "AST007 - Fortinet\nFirewall",
    teknisi: "Andi Pratama",
    deskripsi: "Pemeriksaan rule, log security,\ndan update signature",
    status: "Sebagian",
    durasi: "1 jam",
  },
  {
    key: "7",
    no: "7",
    tanggal: "04 May 2024\n10:00",
    tipe: "Daily",
    area: "IT Department",
    perangkat: "Monitor",
    hostname: "DELL-MON-24",
    deviceName: "AST008 - Dell\nMonitor 24\"",
    teknisi: "Rizky Kurniawan",
    deskripsi: "Pengecekan display, kabel,\ndan kebersihan",
    status: "Dibatalkan",
    durasi: "-",
  },
  {
    key: "8",
    no: "8",
    tanggal: "03 May 2024\n14:30",
    tipe: "Semester",
    area: "Data Center 1",
    perangkat: "Storage",
    hostname: "SYNO-NAS-01",
    deviceName: "AST006 - Synology\nNAS",
    teknisi: "Siti Aisyah",
    deskripsi: "Pemeriksaan storage, backup,\ndan health disk",
    status: "Selesai",
    durasi: "1 jam 30 mnt",
  },
];

export default function MaintenanceActualPage() {
  const [activeTab, setActiveTab] = useState("all");

  const tabItems = [
    { key: "all", label: "All" },
    { key: "hardware", label: "Hardware" },
    { key: "software", label: "Software" },
  ];

  const columns = [
    { title: "No", dataIndex: "no", key: "no", width: 50, align: "center" },
    {
      title: "Tanggal Actual",
      dataIndex: "tanggal",
      key: "tanggal",
      align: "center",
      render: (val) => <div style={{ whiteSpace: "pre-line" }}>{val}</div>,
    },
    {
      title: "Tipe Maintenance",
      dataIndex: "tipe",
      key: "tipe",
      align: "center",
      render: (tipe) => {
        let color = "blue";
        if (tipe === "Weekly") color = "green";
        if (tipe === "Semester") color = "purple";
        if (tipe === "Tahunan") color = "orange";
        
        const colorMap = {
          blue: { bg: "#e6f4ff", text: "#1677ff" },
          green: { bg: "#f6ffed", text: "#52c41a" },
          purple: { bg: "#f9f0ff", text: "#722ed1" },
          orange: { bg: "#fff7e6", text: "#fa8c16" },
        };
        const c = colorMap[color];
        
        return (
          <Tag style={{ background: c.bg, color: c.text, border: "none", fontWeight: 500, padding: "2px 8px" }}>
            {tipe}
          </Tag>
        );
      },
    },
    { title: "Area", dataIndex: "area", key: "area", align: "center" },
    { title: "Perangkat", dataIndex: "perangkat", key: "perangkat", align: "center" },
    { title: "Hostname", dataIndex: "hostname", key: "hostname", align: "center" },
    {
      title: "Device Name",
      dataIndex: "deviceName",
      key: "deviceName",
      align: "center",
      render: (val) => <div style={{ whiteSpace: "pre-line" }}>{val}</div>,
    },
    { title: "Teknisi", dataIndex: "teknisi", key: "teknisi", align: "center" },
    {
      title: "Deskripsi Pekerjaan",
      dataIndex: "deskripsi",
      key: "deskripsi",
      align: "center",
      render: (val) => <div style={{ whiteSpace: "pre-line" }}>{val}</div>,
    },
    {
      title: "Status Actual",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        let c = { bg: "#f6ffed", text: "#52c41a" }; // Selesai
        if (status === "Sebagian") c = { bg: "#fff7e6", text: "#fa8c16" };
        if (status === "Dibatalkan") c = { bg: "#fff1f0", text: "#ff4d4f" };
        return (
          <Tag style={{ background: c.bg, color: c.text, border: "none", fontWeight: 500 }}>
            {status}
          </Tag>
        );
      },
    },
    { title: "Durasi", dataIndex: "durasi", key: "durasi", align: "center" },
    {
      title: "Dokumentasi",
      key: "dokumentasi",
      align: "center",
      render: (_, record) => {
        if (record.status === "Dibatalkan") return "-";
        return (
          <div style={{ width: 48, height: 32, background: "#e2e8f0", borderRadius: 4, margin: "0 auto", overflow: "hidden" }}>
            <img src={`https://picsum.photos/seed/${record.key}/48/32`} alt="doc" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        );
      },
    },
    {
      title: "Aksi",
      key: "aksi",
      align: "center",
      render: () => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} size="small" />
          <Button type="text" icon={<FileTextOutlined />} size="small" />
          <Button type="text" icon={<EditOutlined />} size="small" />
        </Space>
      ),
    },
  ];

  return (
    <div className="page-shell">
      {/* HEADER SECTION */}
      <div style={{ background: "#fff", padding: "20px 24px 0", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0, fontWeight: 700, color: "#1e293b" }}>
              Actual Maintenance
            </Title>
            <div style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>
              Maintenance &gt; Actual
            </div>
          </Col>
          <Col>
            <Space>
              <Button icon={<ExportOutlined />}>Export Excel</Button>
              <Button icon={<FilterOutlined />}>Filter</Button>
              <Button type="primary" icon={<PlusOutlined />} style={{ background: "#1677ff" }}>
                Catat Actual
              </Button>
            </Space>
          </Col>
        </Row>
        
        {/* TABS */}
        <div style={{ marginTop: 24 }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        </div>
      </div>

      <Card bordered={false} style={{ borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        {/* FILTER BAR */}
        <Row gutter={[16, 16]} align="bottom" style={{ marginBottom: 20 }}>
          <Col xs={24} md={5}>
            <div style={{ marginBottom: 6, fontSize: 12, color: "#475569" }}>Periode Actual</div>
            <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Col>
          <Col xs={24} md={4}>
            <div style={{ marginBottom: 6, fontSize: 12, color: "#475569" }}>Tipe Maintenance</div>
            <Select defaultValue="Semua" style={{ width: "100%" }}>
              <Select.Option value="Semua">Semua</Select.Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <div style={{ marginBottom: 6, fontSize: 12, color: "#475569" }}>Lokasi / Area</div>
            <Select defaultValue="Semua" style={{ width: "100%" }}>
              <Select.Option value="Semua">Semua</Select.Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <div style={{ marginBottom: 6, fontSize: 12, color: "#475569" }}>Teknisi</div>
            <Select defaultValue="Semua" style={{ width: "100%" }}>
              <Select.Option value="Semua">Semua</Select.Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <div style={{ marginBottom: 6, fontSize: 12, color: "#475569" }}>Status Actual</div>
            <Select defaultValue="Semua" style={{ width: "100%" }}>
              <Select.Option value="Semua">Semua</Select.Option>
            </Select>
          </Col>
          <Col xs={24} md={3}>
            <div style={{ display: "flex", gap: "8px", height: "32px", alignItems: "flex-end" }}>
              <Button type="primary" icon={<SearchOutlined />} style={{ background: "#1677ff" }}>
                Search
              </Button>
              <Button icon={<ReloadOutlined />}>Reset</Button>
            </div>
          </Col>
        </Row>

        {/* DATA TABLE */}
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            total: 128,
            showTotal: (total) => <span style={{ fontWeight: 500, marginRight: 'auto' }}>Total {total} data</span>,
            pageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          bordered
          size="middle"
          scroll={{ x: 1600 }}
          className="actual-table"
        />
      </Card>
      
      <style>{`
        .actual-table .ant-table-thead > tr > th {
          background: #f8fafc;
          color: #1e293b;
          font-weight: 600;
          font-size: 13px;
          text-align: center;
        }
        .actual-table .ant-table-cell {
          font-size: 13px;
        }
        .actual-table .ant-pagination {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          width: 100%;
        }
        .actual-table .ant-pagination-total-text {
          margin-right: auto;
        }
      `}</style>
    </div>
  );
}
