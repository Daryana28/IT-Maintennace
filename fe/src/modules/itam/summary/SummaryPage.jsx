import React, { useState, useEffect } from 'react';
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
import http from '@/shared/services/apiClient';

const { Title, Text } = Typography;

const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function SummaryPage() {
  const [activeTab, setActiveTab] = useState('asset');
  const [activeAssetTab, setActiveAssetTab] = useState('total');
  const [activeBudgetTab, setActiveBudgetTab] = useState('progress');
  const [activeMaintenanceTab, setActiveMaintenanceTab] = useState('logsheet');

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await http.get('/dashboard/full-summary');
        if (res.data.success) {
          setSummaryData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const assetTotalSummary = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={6}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Total Asset" value={summaryData?.asset?.total ?? 0} prefix={<DatabaseOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Aset Aktif" value={summaryData?.asset?.active ?? 0} styles={{ content: { color: '#52c41a' } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Aset Rusak/Disposal" value={summaryData?.asset?.damaged ?? 0} styles={{ content: { color: '#ff4d4f' } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Aset di-Service" value={summaryData?.asset?.inService ?? 0} styles={{ content: { color: '#fa8c16' } }} />
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
        dataSource={summaryData?.asset?.categories || []}
      />
    </div>
  );

  const assetValueSummary = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Nilai Perolehan" value={formatCurrency(summaryData?.asset?.value?.acquisition)} prefix={<DollarOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Akumulasi Penyusutan" value={formatCurrency(summaryData?.asset?.value?.depreciation)} styles={{ content: { color: '#ff4d4f' } }} prefix={<ArrowDownOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Nilai Buku" value={formatCurrency(summaryData?.asset?.value?.book)} styles={{ content: { color: '#52c41a' } }} prefix={<ArrowUpOutlined />} />
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
        dataSource={summaryData?.asset?.value?.byCategory || []}
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
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Total Budget Progress" value={summaryData?.budget?.total ?? 0} prefix={<DollarOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="On Progress" value={summaryData?.budget?.progress ?? 0} styles={{ content: { color: '#1677ff' } }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Completed" value={summaryData?.budget?.completed ?? 0} styles={{ content: { color: '#52c41a' } }} />
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
        dataSource={summaryData?.budget?.overview || []}
      />
    </div>
  );

  const budgetPendingSummary = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Total Pending Budget" value={summaryData?.budget?.pending ?? 0} prefix={<ArrowDownOutlined style={{ color: '#fa8c16' }} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Asset Pending" value={summaryData?.budget?.pending ?? 0} styles={{ content: { color: '#ff4d4f' } }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Operational Pending" value={0} styles={{ content: { color: '#fa8c16' } }} />
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
        dataSource={summaryData?.budget?.pendingRows || []}
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
        <Col span={24}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Total Logsheet" value={summaryData?.maintenance?.logsheets?.total ?? 0} prefix={<FormOutlined style={{ color: '#1677ff' }} />} />
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
        ]}
        dataSource={summaryData?.maintenance?.logsheets?.latest || []}
      />
    </div>
  );

  const maintenanceActualsSummary = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Total Actuals" value={summaryData?.maintenance?.actuals?.total ?? 0} prefix={<ToolOutlined style={{ color: '#722ed1' }} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Selesai (Actual)" value={summaryData?.maintenance?.actuals?.done ?? 0} styles={{ content: { color: '#52c41a' } }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Pending (Plan)" value={summaryData?.maintenance?.actuals?.pending ?? 0} styles={{ content: { color: '#ff4d4f' } }} />
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
        dataSource={summaryData?.maintenance?.actuals?.progressRows || []}
      />

      <Divider />
      <Title level={5}>Recent Actual Entries</Title>
      <Table
        pagination={false}
        size="small"
        columns={[
          { title: 'Tanggal', dataIndex: 'tanggal', key: 'tanggal' },
          { title: 'Aset', dataIndex: 'asset', key: 'asset' },
          { title: 'Status', dataIndex: 'status', key: 'status' },
          { title: 'Personnel', dataIndex: 'personnel', key: 'personnel' },
        ]}
        dataSource={summaryData?.maintenance?.actuals?.latestRows || []}
      />
    </div>
  );

  const maintenanceAbnormalsSummary = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Total Abnormal" value={summaryData?.maintenance?.abnormals?.total ?? 0} prefix={<ToolOutlined style={{ color: '#ff4d4f' }} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Open" value={summaryData?.maintenance?.abnormals?.open ?? 0} styles={{ content: { color: '#ff4d4f' } }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Resolved" value={summaryData?.maintenance?.abnormals?.resolved ?? 0} styles={{ content: { color: '#52c41a' } }} />
          </Card>
        </Col>
      </Row>

      <Divider />
      <Title level={5}>Recent Abnormal Findings</Title>
      <Table
        pagination={false}
        size="small"
        columns={[
          { title: 'Aset', dataIndex: 'asset', key: 'asset' },
          { title: 'Deskripsi', dataIndex: 'deskripsi', key: 'deskripsi' },
          { title: 'Tindakan', dataIndex: 'tindakan', key: 'tindakan' },
          { title: 'Status', dataIndex: 'status', key: 'status' },
          { title: 'Resolved By', dataIndex: 'resolvedBy', key: 'resolvedBy' },
        ]}
        dataSource={summaryData?.maintenance?.abnormals?.latestRows || []}
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
          key: 'actuals',
          label: 'Actuals',
          children: maintenanceActualsSummary,
        },
        {
          key: 'abnormals',
          label: 'Abnormal Logs',
          children: maintenanceAbnormalsSummary,
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
