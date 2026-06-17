import React, { useState } from 'react';
import { Card, Typography, Tabs, Row, Col, Statistic, Table, Divider } from 'antd';
import {
  DatabaseOutlined,
  ToolOutlined,
  InboxOutlined,
  LineChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function SummaryPage() {
  const [activeTab, setActiveTab] = useState('asset');

  // Dummy statistics for each category
  // 1. Asset Summary Data
  const assetStats = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#f8fafc' }}>
            <Statistic title="Total Asset" value={452} prefix={<DatabaseOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#f8fafc' }}>
            <Statistic title="Aset Aktif" value={410} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#f8fafc' }}>
            <Statistic title="Aset Rusak/Disposal" value={18} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#f8fafc' }}>
            <Statistic title="Aset di-Service" value={24} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
      </Row>
      <Divider />
      <Title level={5}>Top Asset Categories</Title>
      <Table
        pagination={false}
        size="small"
        columns={[
          { title: 'Kategori', dataIndex: 'category', key: 'category' },
          { title: 'Jumlah', dataIndex: 'count', key: 'count' },
          { title: 'Persentase', dataIndex: 'percent', key: 'percent' },
        ]}
        dataSource={[
          { key: '1', category: 'Laptop / PC', count: 210, percent: '46.4%' },
          { key: '2', category: 'Server', count: 32, percent: '7.1%' },
          { key: '3', category: 'Network Devices (Switch/Router)', count: 48, percent: '10.6%' },
          { key: '4', category: 'Printer / Scanner', count: 62, percent: '13.7%' },
          { key: '5', category: 'Lain-lain', count: 100, percent: '22.2%' },
        ]}
      />
    </div>
  );

  // 2. Maintenance Summary Data
  const maintenanceStats = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#f8fafc' }}>
            <Statistic title="Total Kegiatan Maintenance" value={184} prefix={<ToolOutlined style={{ color: '#722ed1' }} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#f8fafc' }}>
            <Statistic title="Selesai Tepat Waktu" value={152} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#f8fafc' }}>
            <Statistic title="Terlambat / Pending" value={32} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>
      <Divider />
      <Title level={5}>Maintenance Bi-Weekly Overview</Title>
      <Table
        pagination={false}
        size="small"
        columns={[
          { title: 'Tipe Maintenance', dataIndex: 'type', key: 'type' },
          { title: 'Total Kasus', dataIndex: 'total', key: 'total' },
          { title: 'Rata-rata Durasi', dataIndex: 'avgDuration', key: 'avgDuration' },
        ]}
        dataSource={[
          { key: '1', type: 'Daily Check', total: 120, avgDuration: '30 mnt' },
          { key: '2', type: 'Weekly Preventive', total: 48, avgDuration: '1.5 jam' },
          { key: '3', type: 'Monthly Maintenance', total: 12, avgDuration: '3 jam' },
          { key: '4', type: 'Corrective / Repair', total: 4, avgDuration: '6 jam' },
        ]}
      />
    </div>
  );

  // 3. Inventory Summary Data
  const inventoryStats = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#f8fafc' }}>
            <Statistic title="Total Item Stok" value="1,248" prefix={<InboxOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#f8fafc' }}>
            <Statistic title="Tersedia" value={856} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#f8fafc' }}>
            <Statistic title="Minimum Alert" value={132} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#f8fafc' }}>
            <Statistic title="Stok Habis" value={18} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>
      <Divider />
      <Title level={5}>Spareparts & Consumables Summary</Title>
      <Table
        pagination={false}
        size="small"
        columns={[
          { title: 'Nama Barang', dataIndex: 'name', key: 'name' },
          { title: 'Grup', dataIndex: 'group', key: 'group' },
          { title: 'Stok Saat Ini', dataIndex: 'stock', key: 'stock' },
          { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Text style={{ color: s === 'Aman' ? '#52c41a' : '#ff4d4f' }}>{s}</Text> },
        ]}
        dataSource={[
          { key: '1', name: 'SSD V-Gen 512GB', group: 'Storage Upgrade', stock: 45, status: 'Aman' },
          { key: '2', name: 'RAM DDR4 8GB Sodimm', group: 'Memory Upgrade', stock: 5, status: 'Restock Alert' },
          { key: '3', name: 'Kabel UTP Cat6 1 Roll', group: 'Network Cables', stock: 12, status: 'Aman' },
          { key: '4', name: 'Tinta Printer Canon Black', group: 'Consumables', stock: 0, status: 'Habis' },
        ]}
      />
    </div>
  );

  // 4. Depreciation Summary Data
  const depreciationStats = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#f8fafc' }}>
            <Statistic title="Nilai Awal Aset" value="Rp 4.520.000.000" prefix={<LineChartOutlined style={{ color: '#fa8c16' }} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#f8fafc' }}>
            <Statistic title="Akumulasi Depresiasi" value="Rp 1.890.000.000" valueStyle={{ color: '#ff4d4f' }} prefix={<ArrowDownOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#f8fafc' }}>
            <Statistic title="Nilai Buku Saat Ini" value="Rp 2.630.000.000" valueStyle={{ color: '#52c41a' }} prefix={<ArrowUpOutlined />} />
          </Card>
        </Col>
      </Row>
      <Divider />
      <Title level={5}>Depreciation Schedule Overview</Title>
      <Table
        pagination={false}
        size="small"
        columns={[
          { title: 'Tahun Depresiasi', dataIndex: 'year', key: 'year' },
          { title: 'Nilai Depresiasi Tahunan', dataIndex: 'depValue', key: 'depValue' },
          { title: 'Sisa Nilai Buku', dataIndex: 'bookValue', key: 'bookValue' },
        ]}
        dataSource={[
          { key: '1', year: '2024', depValue: 'Rp 650.000.000', bookValue: 'Rp 2.630.000.000' },
          { key: '2', year: '2025 (Estimasi)', depValue: 'Rp 580.000.000', bookValue: 'Rp 2.050.000.000' },
          { key: '3', year: '2026 (Estimasi)', depValue: 'Rp 500.000.000', bookValue: 'Rp 1.550.000.000' },
        ]}
      />
    </div>
  );

  const items = [
    {
      key: 'asset',
      label: 'Asset Summary',
      children: assetStats,
    },
    {
      key: 'maintenance',
      label: 'Maintenance Summary',
      children: maintenanceStats,
    },
    {
      key: 'inventory',
      label: 'Inventory Summary',
      children: inventoryStats,
    },
    {
      key: 'depreciation',
      label: 'Depreciation Summary',
      children: depreciationStats,
    },
  ];

  return (
    <div className="page-shell">
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Title level={3} style={{ marginBottom: 4, fontWeight: 700 }}>Summary Center</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Melihat secara menyeluruh ringkasan status aset, aktivitas perawatan, sisa stok, dan penyusutan nilai buku.
        </Text>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} type="card" />
      </Card>
    </div>
  );
}
