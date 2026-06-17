import React, { useState } from 'react';
import { Card, Typography, DatePicker, Row, Col, Statistic, Table, Button, Space, Tag } from 'antd';
import {
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function MonthlyReportPage() {
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  // Report statistics
  const stats = [
    { title: 'Aset Baru Terdaftar', value: 18, suffix: 'Aset', color: '#1677ff' },
    { title: 'Biaya Pemeliharaan', value: 'Rp 12.450.000', suffix: '', color: '#ff4d4f' },
    { title: 'Penyusutan Periode Ini', value: 'Rp 45.000.000', suffix: '', color: '#fa8c16' },
    { title: 'Jadwal Pemeliharaan', value: '14 / 15 Selesai', suffix: '93%', color: '#52c41a' },
  ];

  // Activities Log
  const activities = [
    { key: '1', date: '2026-05-18', activity: 'Disposal Server IBM Rackmount', category: 'Disposal', cost: 'Rp 0', status: 'Selesai' },
    { key: '2', date: '2026-05-15', activity: 'Pembelian 5 unit Monitor LG 24"', category: 'Procurement', cost: 'Rp 7.500.000', status: 'Selesai' },
    { key: '3', date: '2026-05-10', activity: 'Aktivitas Maintenance AC Ruang Server', category: 'Maintenance', cost: 'Rp 1.500.000', status: 'Selesai' },
    { key: '4', date: '2026-05-05', activity: 'Perbaikan Switch Cisco Core (Ganti Port)', category: 'Repair', cost: 'Rp 3.450.000', status: 'Selesai' },
  ];

  const columns = [
    { title: 'Tanggal', dataIndex: 'date', key: 'date' },
    { title: 'Aktivitas / Deskripsi', dataIndex: 'activity', key: 'activity' },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => {
        const colors = {
          Disposal: 'red',
          Procurement: 'blue',
          Maintenance: 'green',
          Repair: 'orange',
        };
        return <Tag color={colors[cat] || 'default'}>{cat}</Tag>;
      },
    },
    { title: 'Biaya', dataIndex: 'cost', key: 'cost' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color="success">{s}</Tag> },
  ];

  return (
    <div className="page-shell">
      {/* HEADER */}
      <div style={{ background: '#fff', padding: '20px 24px', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 24 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Laporan Bulanan (Monthly Report)</Title>
            <Text type="secondary">Review performance, status, pengeluaran, dan depresiasi aset bulanan.</Text>
          </Col>
          <Col>
            <Space size="middle">
              <DatePicker
                picker="month"
                value={selectedMonth}
                onChange={(val) => val && setSelectedMonth(val)}
                allowClear={false}
              />
              <Button type="primary" icon={<DownloadOutlined />} style={{ background: '#1677ff' }}>
                Download PDF
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* STATS ROW */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                valueStyle={{ color: stat.color, fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* DETAILED LOG */}
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} title={`Log Kejadian Utama - ${selectedMonth.format('MMMM YYYY')}`}>
        <Table columns={columns} dataSource={activities} pagination={false} />
      </Card>
    </div>
  );
}
