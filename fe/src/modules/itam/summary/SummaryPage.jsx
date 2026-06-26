import React, { useState } from 'react';
import { Card, Typography, Tabs, Row, Col, Statistic, Table, Divider } from 'antd';
import {
  DatabaseOutlined,
  ToolOutlined,
  LineChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FormOutlined,
  CheckCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function SummaryPage() {
  const [activeTab, setActiveTab] = useState('asset');
  const [activeAssetTab, setActiveAssetTab] = useState('total');
  const [activeBudgetTab, setActiveBudgetTab] = useState('progress');
  const [activeMaintenanceTab, setActiveMaintenanceTab] = useState('logsheet');

  const assetTotalSummary = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={6}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Total Asset" value={452} prefix={<DatabaseOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Aset Aktif" value={410} styles={{ content: { color: '#52c41a' } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Aset Rusak/Disposal" value={20} styles={{ content: { color: '#ff4d4f' } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Aset di-Service" value={24} styles={{ content: { color: '#fa8c16' } }} />
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
          { key: '3', category: 'Network Devices', count: 48, percent: '10.6%' },
          { key: '4', category: 'Printer / Scanner', count: 62, percent: '13.7%' },
          { key: '5', category: 'Lain-lain', count: 100, percent: '22.2%' },
        ]}
      />
    </div>
  );

  const assetValueSummary = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Nilai Perolehan" value="Rp 4.520.000.000" prefix={<DollarOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Akumulasi Penyusutan" value="Rp 1.890.000.000" styles={{ content: { color: '#ff4d4f' } }} prefix={<ArrowDownOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Nilai Buku" value="Rp 2.630.000.000" styles={{ content: { color: '#52c41a' } }} prefix={<ArrowUpOutlined />} />
          </Card>
        </Col>
      </Row>

      <Divider />
      <Title level={5}>Nilai Asset per Kategori</Title>
      <Table
        pagination={false}
        size="small"
        columns={[
          { title: 'Kategori', dataIndex: 'category', key: 'category' },
          { title: 'Nilai Perolehan', dataIndex: 'acquisitionValue', key: 'acquisitionValue' },
          { title: 'Nilai Buku', dataIndex: 'bookValue', key: 'bookValue' },
        ]}
        dataSource={[
          { key: '1', category: 'Laptop / PC', acquisitionValue: 'Rp 1.250.000.000', bookValue: 'Rp 780.000.000' },
          { key: '2', category: 'Server', acquisitionValue: 'Rp 980.000.000', bookValue: 'Rp 620.000.000' },
          { key: '3', category: 'Network Devices', acquisitionValue: 'Rp 760.000.000', bookValue: 'Rp 490.000.000' },
          { key: '4', category: 'Printer / Scanner', acquisitionValue: 'Rp 430.000.000', bookValue: 'Rp 280.000.000' },
          { key: '5', category: 'Lain-lain', acquisitionValue: 'Rp 1.100.000.000', bookValue: 'Rp 460.000.000' },
        ]}
      />
    </div>
  );

  const assetSummary = (
    <Tabs
      activeKey={activeAssetTab}
      onChange={setActiveAssetTab}
      type="line"
      items={[
        {
          key: 'total',
          label: 'Total',
          children: assetTotalSummary,
        },
        {
          key: 'nilai',
          label: 'Nilai',
          children: assetValueSummary,
        },
      ]}
    />
  );

  const budgetProgressSummary = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Total Budget Progress" value={171} prefix={<DollarOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="On Progress" value={94} styles={{ content: { color: '#1677ff' } }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Completed" value={77} styles={{ content: { color: '#52c41a' } }} />
          </Card>
        </Col>
      </Row>

      <Divider />
      <Title level={5}>Budget Progress Overview</Title>
      <Table
        pagination={false}
        size="small"
        columns={[
          { title: 'Kategori Budget', dataIndex: 'category', key: 'category' },
          { title: 'Total Item', dataIndex: 'total', key: 'total' },
          { title: 'On Progress', dataIndex: 'progress', key: 'progress' },
          { title: 'Completed', dataIndex: 'completed', key: 'completed' },
        ]}
        dataSource={[
          { key: '1', category: 'Asset Budget', total: 96, progress: 58, completed: 38 },
          { key: '2', category: 'Operational Budget', total: 75, progress: 36, completed: 39 },
        ]}
      />
    </div>
  );

  const budgetPendingSummary = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Total Pending Budget" value={28} prefix={<ArrowDownOutlined style={{ color: '#fa8c16' }} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Asset Pending" value={15} styles={{ content: { color: '#ff4d4f' } }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Operational Pending" value={13} styles={{ content: { color: '#fa8c16' } }} />
          </Card>
        </Col>
      </Row>

      <Divider />
      <Title level={5}>Pending Budget Detail</Title>
      <Table
        pagination={false}
        size="small"
        columns={[
          { title: 'Budget Code', dataIndex: 'code', key: 'code' },
          { title: 'Kategori', dataIndex: 'category', key: 'category' },
          { title: 'Item', dataIndex: 'item', key: 'item' },
          { title: 'Status Pending', dataIndex: 'status', key: 'status' },
        ]}
        dataSource={[
          { key: '1', code: 'BA-2026-014', category: 'Asset', item: 'Laptop Manager', status: 'Waiting Approval' },
          { key: '2', code: 'BA-2026-018', category: 'Asset', item: 'Switch Core', status: 'Waiting PO' },
          { key: '3', code: 'OP-2026-022', category: 'Operational', item: 'Cloud Service', status: 'Waiting Review' },
          { key: '4', code: 'OP-2026-024', category: 'Operational', item: 'Internet ISP', status: 'Waiting Payment' },
        ]}
      />
    </div>
  );

  const budgetSummary = (
    <Tabs
      activeKey={activeBudgetTab}
      onChange={setActiveBudgetTab}
      type="line"
      items={[
        {
          key: 'progress',
          label: 'Progress',
          children: budgetProgressSummary,
        },
        {
          key: 'pending',
          label: 'Pending',
          children: budgetPendingSummary,
        },
      ]}
    />
  );

  const maintenanceLogsheetSummary = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Total Logsheet" value={145} prefix={<FormOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Disetujui" value={120} styles={{ content: { color: '#52c41a' } }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Menunggu Approval" value={25} styles={{ content: { color: '#fa8c16' } }} />
          </Card>
        </Col>
      </Row>

      <Divider />
      <Title level={5}>Logsheet Summary</Title>
      <Table
        pagination={false}
        size="small"
        columns={[
          { title: 'No. Logsheet', dataIndex: 'logNo', key: 'logNo' },
          { title: 'Aset', dataIndex: 'asset', key: 'asset' },
          { title: 'Tanggal', dataIndex: 'date', key: 'date' },
          { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Text style={{ color: s === 'Disetujui' ? '#52c41a' : '#fa8c16' }}>{s}</Text> },
        ]}
        dataSource={[
          { key: '1', logNo: 'LOG-2024-001', asset: 'Genset Utama', date: '18 Jun 2024', status: 'Menunggu Approval' },
          { key: '2', logNo: 'LOG-2024-002', asset: 'Server Room AC', date: '17 Jun 2024', status: 'Disetujui' },
          { key: '3', logNo: 'LOG-2024-003', asset: 'UPS Data Center', date: '16 Jun 2024', status: 'Disetujui' },
        ]}
      />
    </div>
  );

  const maintenanceProgressSummary = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Total Progress Monthly" value={184} prefix={<ToolOutlined style={{ color: '#722ed1' }} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Selesai Bulan Ini" value={152} styles={{ content: { color: '#52c41a' } }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Pending Bulan Ini" value={32} styles={{ content: { color: '#ff4d4f' } }} />
          </Card>
        </Col>
      </Row>

      <Divider />
      <Title level={5}>Progress Maintenance (Monthly)</Title>
      <Table
        pagination={false}
        size="small"
        columns={[
          { title: 'Tipe Maintenance', dataIndex: 'type', key: 'type' },
          { title: 'Total Kasus', dataIndex: 'total', key: 'total' },
          { title: 'Selesai', dataIndex: 'done', key: 'done' },
          { title: 'Pending', dataIndex: 'pending', key: 'pending' },
        ]}
        dataSource={[
          { key: '1', type: 'Daily Check', total: 120, done: 101, pending: 19 },
          { key: '2', type: 'Weekly Preventive', total: 48, done: 39, pending: 9 },
          { key: '3', type: 'Monthly Maintenance', total: 12, done: 10, pending: 2 },
          { key: '4', type: 'Corrective / Repair', total: 4, done: 2, pending: 2 },
        ]}
      />
    </div>
  );

  const maintenanceSummary = (
    <Tabs
      activeKey={activeMaintenanceTab}
      onChange={setActiveMaintenanceTab}
      type="line"
      items={[
        {
          key: 'logsheet',
          label: 'Logsheet',
          children: maintenanceLogsheetSummary,
        },
        {
          key: 'progress',
          label: 'Progress (Monthly)',
          children: maintenanceProgressSummary,
        },
      ]}
    />
  );

  const items = [
    {
      key: 'asset',
      label: 'Asset',
      children: assetSummary,
    },
    {
      key: 'budget',
      label: 'Budget',
      children: budgetSummary,
    },
    {
      key: 'maintenance',
      label: 'Maintenance',
      children: maintenanceSummary,
    },
  ];

  return (
    <div className="page-shell">
      <Card variant="borderless" style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 20 }}>
        <Title level={3} style={{ marginBottom: 4, fontWeight: 700 }}>Summary Center</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Melihat ringkasan utama untuk asset, budget, dan maintenance dalam satu halaman.
        </Text>
      </Card>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} type="card" />
    </div>
  );
}
