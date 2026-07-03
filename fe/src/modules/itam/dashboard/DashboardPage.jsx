import { useState, useEffect } from "react";
import { Row, Col, Card, Table, Tag, Button, Progress, Space, Tabs, Badge, message } from "antd";
import { ReloadOutlined, WarningOutlined } from "@ant-design/icons";
import http from "@/shared/services/apiClient";
import "./DashboardPage.css";

const ASSET_BUDGET_SCHEDULE_STORAGE_KEY = "itam.assetBudgetSchedule.items.v1";
const OPERATIONAL_BUDGET_SCHEDULE_STORAGE_KEY = "itam.operationalBudgetSchedule.items.v1";
const BUDGET_STAGE_OPTIONS = ["Quotation", "PV", "PO", "Delivery", "Implementation", "Completion", "Invoice"];

const hasRangeFilled = (range) => Boolean(range?.start && range?.end);
const isBudgetScheduleItemClosed = (item) =>
  BUDGET_STAGE_OPTIONS.every((stage) => {
    const planRange = item?.stages?.[stage]?.plan;
    const actualRange = item?.stages?.[stage]?.actual;
    if (!hasRangeFilled(planRange)) return true;
    return hasRangeFilled(actualRange);
  });

const loadBudgetScheduleItems = (storageKey) => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
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
      key: category === "Asset Budget" ? "asset" : "operational",
      category,
      total,
      progress,
      completed,
    };
  };

  const assetSummary = summarize(assetItems, "Asset Budget");
  const operationalSummary = summarize(operationalItems, "Operational Budget");

  return {
    total: assetSummary.total + operationalSummary.total,
    progress: assetSummary.progress + operationalSummary.progress,
    completed: assetSummary.completed + operationalSummary.completed,
    overview: [assetSummary, operationalSummary],
  };
};

export default function Dashboard() {
  const [assetSummary, setAssetSummary] = useState({
    total: 0,
    active: 0,
    nonActive: 0,
    damaged: 0,
    inService: 0,
    acquisitionValue: 0,
    depreciationValue: 0,
    bookValue: 0,
    topCategories: [],
  });
  const [maintAbnormals, setMaintAbnormals] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, rows: [] });
  const [budgetProgressLocalSummary, setBudgetProgressLocalSummary] = useState(() => buildBudgetProgressLocalSummary());
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await http.get('/dashboard/summary');
      if (res.data.success) {
        setAssetSummary(res.data.data.assetSummary || {
          total: 0,
          active: 0,
          nonActive: 0,
          damaged: 0,
          inService: 0,
          acquisitionValue: 0,
          depreciationValue: 0,
          bookValue: 0,
          topCategories: [],
        });
        setMaintAbnormals(res.data.data.maintenanceAbnormals || { total: 0, open: 0, inProgress: 0, resolved: 0, rows: [] });
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const refreshBudgetProgressSummary = () => {
      setBudgetProgressLocalSummary(buildBudgetProgressLocalSummary());
    };

    refreshBudgetProgressSummary();
    window.addEventListener("storage", refreshBudgetProgressSummary);

    return () => {
      window.removeEventListener("storage", refreshBudgetProgressSummary);
    };
  }, []);

  const abnormalColumns = [
    { title: "ASET / PERANGKAT", dataIndex: "asset", key: "asset", ellipsis: true },
    { title: "DESKRIPSI", dataIndex: "deskripsi", key: "deskripsi", ellipsis: true },
    { title: "TINDAKAN", dataIndex: "tindakan", key: "tindakan", ellipsis: true },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const normalizedStatus = String(status || '').toUpperCase();
        let color = 'red';
        if (normalizedStatus === 'RESOLVED') color = 'green';
        else if (normalizedStatus !== 'OPEN') color = 'orange';
        return <Tag color={color}>{normalizedStatus || '-'}</Tag>;
      },
    },
    { title: "RESOLVED BY", dataIndex: "resolvedBy", key: "resolvedBy" },
    { title: "RESOLVED AT", dataIndex: "resolvedAt", key: "resolvedAt" },
  ];

  const assetStatItems = [
    { key: "total", label: "Total Asset", value: assetSummary.total, tone: "blue" },
    { key: "active", label: "Asset Aktif", value: assetSummary.active, tone: "green" },
    { key: "damaged", label: "Aset Rusak/Disposal", value: assetSummary.damaged, tone: "red" },
    { key: "service", label: "Aset di-Service", value: assetSummary.inService, tone: "orange" },
  ];

  const budgetProgressStatItems = [
    { key: "total", label: "Total Budget Progress", value: budgetProgressLocalSummary.total, tone: "blue" },
    { key: "progress", label: "On Progress", value: budgetProgressLocalSummary.progress, tone: "orange" },
    { key: "completed", label: "Completed", value: budgetProgressLocalSummary.completed, tone: "green" },
  ];

  return (
    <div className="dashboard-page">
      {/* PAGE HEADER */}
      <div className="dashboard-page-head">
        <div>
          <h1 className="dashboard-page-title">Dashboard</h1>
          {/* <div className="dashboard-page-subtitle">Welcome to ITAM Platform</div> */}
        </div>

        <div className="dashboard-actions">
          <Button type="default" icon={<ReloadOutlined />} onClick={fetchDashboardData} loading={loading} className="dashboard-refresh-btn">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* BUDGET SECTION */}
      <section className="section-wrap">
        <Row gutter={[24, 24]}>
          <Col xs={24} xl={12}>
            <Card title="Asset Management" hoverable variant="borderless" className="table-card asset-summary-dashboard-card">
              <div className="asset-summary-card">
                <div className="asset-summary-card__section">
                  <div className="asset-summary-card__section-title">Asset Count</div>
                  <div className="asset-summary-card__stat-grid">
                    {assetStatItems.map((item) => (
                      <div key={item.key} className={`asset-summary-card__stat asset-summary-card__stat--${item.tone}`}>
                        <div className="asset-summary-card__stat-label">{item.label}</div>
                        <div className="asset-summary-card__stat-value">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="asset-summary-card__section">
                  <div className="asset-summary-card__section-title">Top Categories</div>
                  <div className="asset-summary-card__category-list">
                    {(assetSummary.topCategories || []).map((item) => (
                      <div key={item.key} className="asset-summary-card__category-row">
                        <div className="asset-summary-card__category-meta">
                          <span className="asset-summary-card__category-name">{item.category}</span>
                          <span className="asset-summary-card__category-count">{item.count} asset</span>
                        </div>
                        <Progress
                          percent={Number(item.percent || 0)}
                          size="small"
                          strokeColor="#1677ff"
                          trailColor="#e5edf8"
                          format={(percent) => `${percent}%`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} xl={12}>
            <Card title="Budget" hoverable variant="borderless" className="table-card asset-summary-dashboard-card">
              <div className="asset-summary-card">
                <div className="asset-summary-card__section">
                  <div className="asset-summary-card__section-title">Budget Progress</div>
                  <div className="asset-summary-card__stat-grid">
                    {budgetProgressStatItems.map((item) => (
                      <div key={item.key} className={`asset-summary-card__stat asset-summary-card__stat--${item.tone}`}>
                        <div className="asset-summary-card__stat-label">{item.label}</div>
                        <div className="asset-summary-card__stat-value">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="asset-summary-card__section">
                  <div className="asset-summary-card__section-title">Budget Progress Overview</div>
                  <div className="asset-summary-card__category-list">
                    {(budgetProgressLocalSummary.overview || []).map((item) => (
                      <div key={item.key} className="asset-summary-card__category-row">
                        <div className="asset-summary-card__category-meta">
                          <span className="asset-summary-card__category-name">{item.category}</span>
                          <span className="asset-summary-card__category-count">
                            {item.completed} / {item.total} completed
                          </span>
                        </div>
                        <Progress
                          percent={item.total > 0 ? Number(((item.completed / item.total) * 100).toFixed(1)) : 0}
                          size="small"
                          strokeColor="#52c41a"
                          trailColor="#e5edf8"
                          format={(percent) => `${percent}%`}
                        />
                        <span className="asset-summary-card__category-count">
                          On progress: {item.progress}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </section>

      {/* MAINTENANCE SECTION */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} xl={24}>
          <Card hoverable variant="borderless" className="table-card" style={{ height: '420px' }}
            title={
              <Space>
                <span>Maintenance</span>
                {/* <Tag color="blue">{maintAbnormals.total} Total</Tag> */}
              </Space>
            }
          >
            <Tabs
              defaultActiveKey="abnormals"
              items={[
                {
                  key: 'abnormals',
                  label: (
                    <Space size={8}>
                      <WarningOutlined /> Logsheets
                      <Badge count={maintAbnormals.open} size="small" style={{ backgroundColor: '#ff4d4f' }} />
                      <Badge count={maintAbnormals.inProgress} size="small" style={{ backgroundColor: '#faad14' }} />
                      <Badge count={maintAbnormals.resolved} size="small" style={{ backgroundColor: '#52c41a' }} />
                    </Space>
                  ),
                  children: (
                    <>
                      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                        <Tag color="red">{maintAbnormals.open} open</Tag>
                        <Tag color="orange">{maintAbnormals.inProgress} in progress</Tag>
                        <Tag color="green">{maintAbnormals.resolved} resolved</Tag>
                      </div>
                      <Table
                        dataSource={maintAbnormals.rows}
                        columns={abnormalColumns}
                        loading={loading}
                        pagination={false}
                        size="small"
                        scroll={{ y: 244 }}
                      />
                    </>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
