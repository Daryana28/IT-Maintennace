import React, { useState, useEffect } from 'react';
import { Card, Typography, Tabs, Row, Col, Statistic, Table, Divider, Badge, Space, Button } from 'antd';
import {
  DatabaseOutlined,
  ToolOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import http from '@/shared/services/apiClient';

const { Title, Text } = Typography;

const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
const escapeCsvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const OPERATIONAL_BUDGET_STORAGE_KEY = 'itam.operationalBudget.items.v2';
const ASSET_BUDGET_SCHEDULE_STORAGE_KEY = 'itam.assetBudgetSchedule.items.v1';
const OPERATIONAL_BUDGET_SCHEDULE_STORAGE_KEY = 'itam.operationalBudgetSchedule.items.v1';
const BUDGET_STAGE_OPTIONS = ['Quotation', 'PV', 'PO', 'Delivery', 'Implementation', 'Completion', 'Invoice'];
const auditKmcCellStyle = {
  minHeight: 56,
  display: 'flex',
  alignItems: 'center',
};
const formatAuditKmcCurrency = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '-';
  if (/^rp\.?/i.test(raw)) return raw;

  const normalized = raw
    .replace(/\s*k$/i, '')
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  const amount = Number(normalized);

  if (Number.isNaN(amount)) return raw;
  return `Rp. ${amount.toLocaleString('id-ID')}`;
};
const renderAuditKmcTextCell = (value, align = 'left') => (
  <div style={{ ...auditKmcCellStyle, justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
    <span>{value || '-'}</span>
  </div>
);
const getOperationalBudgetAmount = (item) => {
  const initialBudgetPlan = Number(item?.initialBudgetPlan ?? 0);
  if (initialBudgetPlan > 0) return initialBudgetPlan;

  return ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].reduce(
    (sum, month) => sum + Number(item?.[`${month}Plan`] ?? 0),
    0
  );
};
const hasRangeFilled = (range) => Boolean(range?.start && range?.end);
const isBudgetScheduleItemClosed = (item) =>
  BUDGET_STAGE_OPTIONS.every((stage) => {
    const planRange = item?.stages?.[stage]?.plan;
    const actualRange = item?.stages?.[stage]?.actual;
    if (!hasRangeFilled(planRange)) return true;
    return hasRangeFilled(actualRange);
  });
const normalizeBudgetScheduleItems = (items) =>
  Array.isArray(items)
    ? items.map((item, index) => ({
        ...item,
        key: String(item?.key || index + 1),
        no: index + 1,
      }))
    : [];
const loadBudgetScheduleItems = (storageKey) => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = JSON.parse(raw || '[]');
    return normalizeBudgetScheduleItems(parsed);
  } catch {
    return [];
  }
};
const buildBudgetProgressLocalSummary = () => {
  const assetItems = loadBudgetScheduleItems(ASSET_BUDGET_SCHEDULE_STORAGE_KEY);
  const operationalItems = loadBudgetScheduleItems(OPERATIONAL_BUDGET_SCHEDULE_STORAGE_KEY);

  const summarize = (items, category) => {
    const total = items.length;
    const completed = items.filter((item) => isBudgetScheduleItemClosed(item)).length;
    const progress = Math.max(total - completed, 0);
    return {
      key: category === 'Asset Budget' ? 'asset' : 'operational',
      category,
      total,
      progress,
      completed,
    };
  };

  const assetSummary = summarize(assetItems, 'Asset Budget');
  const operationalSummary = summarize(operationalItems, 'Operational Budget');

  return {
    total: assetSummary.total + operationalSummary.total,
    progress: assetSummary.progress + operationalSummary.progress,
    completed: assetSummary.completed + operationalSummary.completed,
    overview: [assetSummary, operationalSummary],
  };
};
const loadOperationalBudgetExpenseSection = () => {
  if (typeof window === 'undefined') {
    return {
      key: 'expense',
      title: 'Expense for IT',
      rows: [
        { key: 'rental', item: 'Rental fee', localCurrency: '', mainContents: [] },
        { key: 'maintenance', item: 'Maintenance and repair fee', localCurrency: '', mainContents: [] },
        { key: 'total', item: 'Total', localCurrency: '', mainContents: [], isTotal: true },
      ],
    };
  }

  try {
    const raw = window.localStorage.getItem(OPERATIONAL_BUDGET_STORAGE_KEY);
    const parsed = JSON.parse(raw || '[]');
    const grouped = Array.isArray(parsed)
      ? Array.from(
          parsed.reduce((map, item) => {
            const budgetCode = String(item?.budgetCode || '').trim();
            if (!budgetCode) return map;

            const current = map.get(budgetCode) || { budgetCode, amount: 0 };
            current.amount += getOperationalBudgetAmount(item);
            map.set(budgetCode, current);
            return map;
          }, new Map()).values()
        )
      : [];

    const maintenanceAmount = grouped.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

    return {
      key: 'expense',
      title: 'Expense for IT',
      rows: [
        { key: 'rental', item: 'Rental fee', localCurrency: '', mainContents: [] },
        {
          key: 'maintenance',
          item: 'Maintenance and repair fee',
          localCurrency: maintenanceAmount > 0 ? `Rp. ${maintenanceAmount.toLocaleString('id-ID')}` : '',
          mainContents: grouped
            .sort((left, right) => left.budgetCode.localeCompare(right.budgetCode))
            .map((entry) => `${entry.budgetCode} (Rp. ${Number(entry.amount || 0).toLocaleString('id-ID')})`),
        },
        {
          key: 'total',
          item: 'Total',
          localCurrency: maintenanceAmount > 0 ? `Rp. ${maintenanceAmount.toLocaleString('id-ID')}` : '',
          mainContents: [],
          isTotal: true,
        },
      ],
    };
  } catch {
    return {
      key: 'expense',
      title: 'Expense for IT',
      rows: [
        { key: 'rental', item: 'Rental fee', localCurrency: '', mainContents: [] },
        { key: 'maintenance', item: 'Maintenance and repair fee', localCurrency: '', mainContents: [] },
        { key: 'total', item: 'Total', localCurrency: '', mainContents: [], isTotal: true },
      ],
    };
  }
};
const renderAuditKmcContents = (value) => {
  if (Array.isArray(value) && value.length) {
    return (
      <div
        style={{
          ...auditKmcCellStyle,
          alignItems: 'flex-start',
          flexDirection: 'column',
          maxHeight: 220,
          width: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: 8,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
        }}
      >
        {value.map((entry, index) => (
          <div key={`${entry}-${index}`} style={{ marginBottom: 4, width: '100%' }}>
            - {entry}
          </div>
        ))}
      </div>
    );
  }

  return value || '-';
};

export default function SummaryPage() {
  const [activeTab, setActiveTab] = useState('asset');
  const [activeAssetTab, setActiveAssetTab] = useState('total');
  const [activeBudgetTab, setActiveBudgetTab] = useState('progress');
  const [activeMaintenanceTab, setActiveMaintenanceTab] = useState('abnormals');

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [budgetProgressLocalSummary, setBudgetProgressLocalSummary] = useState(() => buildBudgetProgressLocalSummary());

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

  useEffect(() => {
    const refreshBudgetProgressSummary = () => {
      setBudgetProgressLocalSummary(buildBudgetProgressLocalSummary());
    };

    refreshBudgetProgressSummary();
    window.addEventListener('storage', refreshBudgetProgressSummary);

    return () => {
      window.removeEventListener('storage', refreshBudgetProgressSummary);
    };
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
        // {
        //   key: 'nilai',
        //   label: 'Nilai',
        //   children: assetValueSummary,
        // },
      ]}
    />
  );

  const budgetProgressSummary = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Total Budget Progress" value={budgetProgressLocalSummary.total ?? 0} prefix={<DollarOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="On Progress" value={budgetProgressLocalSummary.progress ?? 0} styles={{ content: { color: '#1677ff' } }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Completed" value={budgetProgressLocalSummary.completed ?? 0} styles={{ content: { color: '#52c41a' } }} />
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
        dataSource={budgetProgressLocalSummary.overview || []}
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

  const operationalBudgetExpenseSection = loadOperationalBudgetExpenseSection();
  const rawAuditKmcSections = summaryData?.budget?.auditKmcSections || [];
  const auditKmcSections = rawAuditKmcSections.some((section) => section.key === 'expense')
    ? rawAuditKmcSections.map((section) => (section.key === 'expense' ? operationalBudgetExpenseSection : section))
    : [...rawAuditKmcSections, operationalBudgetExpenseSection];
  const auditKmcTotalSections = auditKmcSections.length;
  const auditKmcTotalRows = auditKmcSections.reduce(
    (total, section) => total + (section.rows?.filter((row) => !row.isTotal).length || 0),
    0
  );
  const auditKmcFilledRows = auditKmcSections.reduce(
    (total, section) =>
      total +
      (section.rows?.filter((row) => {
        const hasCurrency = String(row.localCurrency || '').trim();
        const hasContents = Array.isArray(row.mainContents)
          ? row.mainContents.length > 0
          : String(row.mainContents || '').trim();
        return !row.isTotal && (hasCurrency || hasContents);
      }).length || 0),
    0
  );
  const auditKmcSummaryRows = auditKmcSections.map((section) => ({
    key: section.key,
    category: section.title,
    totalItems: section.rows?.filter((row) => !row.isTotal).length || 0,
    status: section.rows?.some((row) => {
      const hasCurrency = String(row.localCurrency || '').trim();
      const hasContents = Array.isArray(row.mainContents) ? row.mainContents.length > 0 : String(row.mainContents || '').trim();
      return hasCurrency || hasContents;
    })
      ? 'In Progress'
      : 'Empty',
  }));
  const downloadAuditKmcSection = (section) => {
    const rows = [
      ['Item', 'Local Currency', 'Main Contents'],
      ...(section.rows || []).map((row) => [
        row.item || '',
        row.localCurrency || '',
        Array.isArray(row.mainContents) ? row.mainContents.join(' | ') : row.mainContents || '',
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${String(section.title || 'audit-kmc').replace(/[^\w\-]+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const budgetAuditKmcSummary = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Total Audit Section" value={auditKmcTotalSections} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Total Audit Item" value={auditKmcTotalRows} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" style={{ background: '#f8fafc' }}>
            <Statistic title="Filled Content" value={auditKmcFilledRows} styles={{ content: { color: '#1677ff' } }} />
          </Card>
        </Col>
      </Row>

      {auditKmcSections.map((section) => (
        <React.Fragment key={section.key}>
          <Divider />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={5} style={{ margin: 0 }}>{section.title}</Title>
            <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadAuditKmcSection(section)}>
              Unduh
            </Button>
          </div>
          <Table
            bordered
            pagination={false}
            size="small"
            scroll={{ x: 900 }}
            tableLayout="fixed"
            columns={[
              {
                title: 'Item',
                dataIndex: 'item',
                key: 'item',
                width: 220,
                onHeaderCell: () => ({ style: { textAlign: 'center' } }),
                render: (value) => renderAuditKmcTextCell(value),
              },
              {
                title: 'Local Currency',
                dataIndex: 'localCurrency',
                key: 'localCurrency',
                width: 180,
                onHeaderCell: () => ({ style: { textAlign: 'center' } }),
                render: (value) => renderAuditKmcTextCell(formatAuditKmcCurrency(value), 'center'),
              },
              {
                title: 'Main Contents',
                dataIndex: 'mainContents',
                key: 'mainContents',
                width: 500,
                onHeaderCell: () => ({ style: { textAlign: 'center' } }),
                render: renderAuditKmcContents,
              },
            ]}
            dataSource={section.rows || []}
            rowClassName={(record) => (record.isTotal ? 'ant-table-row-selected' : '')}
          />
        </React.Fragment>
      ))}
      {auditKmcSections.length === 0 ? (
        <>
          <Divider />
          <Text type="secondary">Data Audit KMC belum tersedia dari summary budget.</Text>
        </>
      ) : null}
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
        // {
        //   key: 'pending',
        //   label: 'Pending',
        //   children: budgetPendingSummary,
        // },
        {
          key: 'audit-kmc',
          label: 'Audit KMC',
          children: budgetAuditKmcSummary,
        },
      ]}
    />
  );

  const maintenanceAbnormalsSummary = (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={16}>
        <Col span={6}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Total Abnormal" value={summaryData?.maintenance?.abnormals?.total ?? 0} prefix={<ToolOutlined style={{ color: '#ff4d4f' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Open" value={summaryData?.maintenance?.abnormals?.open ?? 0} styles={{ content: { color: '#ff4d4f' } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="In Progress" value={summaryData?.maintenance?.abnormals?.inProgress ?? 0} styles={{ content: { color: '#fa8c16' } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" style={{ background: '#f8fafc' }} loading={loading}>
            <Statistic title="Resolved" value={summaryData?.maintenance?.abnormals?.resolved ?? 0} styles={{ content: { color: '#52c41a' } }} />
          </Card>
        </Col>
      </Row>

      <Divider />
      <Space size={12} style={{ marginBottom: 12 }}>
        <span>
          Open <Badge count={summaryData?.maintenance?.abnormals?.open ?? 0} size="small" style={{ backgroundColor: '#ff4d4f' }} />
        </span>
        <span>
          In Progress <Badge count={summaryData?.maintenance?.abnormals?.inProgress ?? 0} size="small" style={{ backgroundColor: '#faad14' }} />
        </span>
        <span>
          Resolved <Badge count={summaryData?.maintenance?.abnormals?.resolved ?? 0} size="small" style={{ backgroundColor: '#52c41a' }} />
        </span>
      </Space>
      <Title level={5}>Recent Abnormal Findings</Title>
      <Table
        pagination={false}
        size="small"
        columns={[
          { title: 'Aset / Perangkat', dataIndex: 'asset', key: 'asset' },
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
          key: 'abnormals',
          label: 'Logsheets',
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
