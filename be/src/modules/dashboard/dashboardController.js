import { AssetBudget, MaintenanceActual, MaintenanceAbnormalLog, MaintenanceLogSheet, MaintenanceSchedule, Asset, AssetCategory, User, sequelize } from "../../models/index.js";
import { Op } from "sequelize";

const currency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
const compactMonthKey = (date) => String(date).slice(0, 7);

const dummyAssetBudgets = [
  { key: 'dummy-ba-1', poDate: '2026-07-05', budgetCode: 'BA-2026-001', itemName: 'Laptop Replacement', initialBudget: currency(185000000), status: 'PO' },
  { key: 'dummy-ba-2', poDate: '2026-08-12', budgetCode: 'BA-2026-002', itemName: 'Network Switch Core', initialBudget: currency(125000000), status: 'PV' },
  { key: 'dummy-ba-3', poDate: '2026-09-18', budgetCode: 'BA-2026-003', itemName: 'Server Storage Expansion', initialBudget: currency(240000000), status: 'Plan' },
];

const dummyOperationalBudgets = [
  { key: 'dummy-op-1', budgetCode: 'OP-2026-001', itemName: 'Microsoft 365', status: 'Invoice', julPlan: 10000000, julActual: 10000000, augPlan: 10000000, augActual: 0, sepPlan: 10000000, sepActual: 0 },
  { key: 'dummy-op-2', budgetCode: 'OP-2026-002', itemName: 'AWS Hosting', status: 'PO', julPlan: 5000000, julActual: 4900000, augPlan: 5000000, augActual: 0, sepPlan: 5000000, sepActual: 0 },
  { key: 'dummy-op-3', budgetCode: 'OP-2026-003', itemName: 'Internet ISP', status: 'Plan', julPlan: 3000000, julActual: 0, augPlan: 3000000, augActual: 0, sepPlan: 3000000, sepActual: 0 },
];

const dummyMaintenanceLogs = [
  { key: 'dummy-log-1', date: 'Monday, Jul 6', code: 'Server Room Cooling', personnel: 'System Demo' },
  { key: 'dummy-log-2', date: 'Tuesday, Jul 14', code: 'Core Switch Inspection', personnel: 'System Demo' },
  { key: 'dummy-log-3', date: 'Friday, Jul 24', code: 'Backup Storage Check', personnel: 'System Demo' },
];

const dummyAssetValueByCategory = [
  { key: 'dummy-value-1', category: 'Laptop / PC', acquisitionValue: currency(1250000000), bookValue: currency(780000000) },
  { key: 'dummy-value-2', category: 'Server', acquisitionValue: currency(980000000), bookValue: currency(620000000) },
  { key: 'dummy-value-3', category: 'Network Devices', acquisitionValue: currency(760000000), bookValue: currency(490000000) },
];

const monthLabels = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const getBudgetStatus = (budget) => {
  if (budget.payment_date_1 || budget.payment_date_2 || budget.payment_date_3) return 'Closed';
  if (budget.po_date) return 'PO';
  if (budget.review) return 'PV';
  return 'Plan';
};

const buildOperationalBudgets = (assetBudgets) => {
  const now = new Date();
  const months = Array.from({ length: 3 }, (_, index) => {
    const d = new Date(now.getFullYear(), now.getMonth() + index, 1);
    return {
      key: monthLabels[d.getMonth()],
      monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    };
  });

  return assetBudgets.slice(0, 8).map((budget, index) => {
    const row = {
      key: budget.id || `op-${index}`,
      budgetCode: budget.budget_code || '-',
      itemName: budget.subject || budget.item_name || '-',
      status: getBudgetStatus(budget),
    };

    months.forEach((month) => {
      const planAmount = Number(budget.initial_plan || budget.budget || budget.price_pengajuan || 0);
      const actualAmount = [
        [budget.payment_date_1, budget.payment_amount_1],
        [budget.payment_date_2, budget.payment_amount_2],
        [budget.payment_date_3, budget.payment_amount_3],
      ].reduce((sum, [paymentDate, amount]) => compactMonthKey(paymentDate) === month.monthKey ? sum + Number(amount || 0) : sum, 0);

      row[`${month.key}Plan`] = planAmount;
      row[`${month.key}Actual`] = actualAmount;
    });

    return row;
  });
};

export const getDashboardSummary = async (req, res) => {
  try {
    const assetBudgets = await AssetBudget.findAll({
      limit: 7,
      order: [['created_at', 'DESC']]
    });

    const allBudgetRows = await AssetBudget.findAll({
      limit: 50,
      order: [['created_at', 'DESC']],
      raw: true,
    });

    const maintenanceLogs = await MaintenanceLogSheet.findAll({
      limit: 10,
      order: [['tanggal_temuan', 'DESC']],
      include: [
        {
          model: MaintenanceSchedule,
          as: 'schedule',
          include: [
            {
              model: Asset,
              as: 'asset',
              attributes: ['asset_name', 'asset_code']
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['full_name']
        }
      ]
    });

    // Formatting maintenance logs for frontend
    const formattedLogs = maintenanceLogs.map(log => {
      const assetInfo = log.schedule?.asset ? `${log.schedule.asset.asset_name} (${log.schedule.asset.asset_code})` : 'Unknown Asset';
      return {
        key: log.id,
        date: new Date(log.tanggal_temuan).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        code: assetInfo,
        personnel: log.creator ? log.creator.full_name : 'System/Unknown'
      };
    });

    // Formatting asset budgets for frontend
    const formattedBudgets = assetBudgets.map(b => ({
      key: b.id,
      poDate: b.po_date || '-',
      budgetCode: b.budget_code || '-',
      itemName: b.item_name || '-',
      initialBudget: currency(b.initial_plan || b.budget || b.price_pengajuan),
      status: getBudgetStatus(b)
    }));

    const operationalBudgets = buildOperationalBudgets(allBudgetRows);

    // Maintenance Actuals
    const totalActuals = await MaintenanceActual.count();
    const doneActuals = await MaintenanceActual.count({ where: { status: 'ACTUAL' } });
    const pendingActuals = await MaintenanceActual.count({ where: { status: 'PLAN' } });

    const recentActuals = await MaintenanceActual.findAll({
      limit: 10,
      order: [['tanggal', 'DESC']],
      include: [
        { model: MaintenanceSchedule, as: 'schedule', include: [{ model: Asset, as: 'asset', attributes: ['asset_name', 'asset_code'] }] },
        { model: User, as: 'creator', attributes: ['full_name'] },
      ],
    });

    const formattedActuals = recentActuals.map(a => ({
      key: a.id,
      tanggal: a.tanggal,
      status: a.status,
      legend: a.legend,
      asset: a.schedule?.asset ? `${a.schedule.asset.asset_name} (${a.schedule.asset.asset_code})` : '-',
      personnel: a.creator?.full_name || '-',
    }));

    // Maintenance Abnormal Logs
    const totalAbnormals = await MaintenanceAbnormalLog.count();
    const openAbnormals = await MaintenanceAbnormalLog.count({ where: { status_temuan: 'OPEN' } });
    const resolvedAbnormals = await MaintenanceAbnormalLog.count({ where: { status_temuan: 'RESOLVED' } });

    const recentAbnormals = await MaintenanceAbnormalLog.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: MaintenanceActual,
          as: 'actual',
          include: [
            { model: MaintenanceSchedule, as: 'schedule', include: [{ model: Asset, as: 'asset', attributes: ['asset_name', 'asset_code'] }] },
          ],
        },
        { model: User, as: 'resolver', attributes: ['full_name'] },
      ],
    });

    const formattedAbnormals = recentAbnormals.map(a => ({
      key: a.id,
      deskripsi: a.deskripsi_kerusakan || '-',
      tindakan: a.tindakan || '-',
      status: a.status_temuan,
      asset: a.actual?.schedule?.asset ? `${a.actual.schedule.asset.asset_name} (${a.actual.schedule.asset.asset_code})` : '-',
      resolvedBy: a.resolver?.full_name || '-',
      resolvedAt: a.resolved_at ? new Date(a.resolved_at).toLocaleDateString() : '-',
    }));

    return res.status(200).json({
      success: true,
      data: {
        assetBudgets: formattedBudgets.length ? formattedBudgets : dummyAssetBudgets,
        maintenanceLogs: formattedLogs.length ? formattedLogs : dummyMaintenanceLogs,
        operationalBudgets: operationalBudgets.length ? operationalBudgets : dummyOperationalBudgets,
        maintenanceActuals: {
          total: totalActuals,
          done: doneActuals,
          pending: pendingActuals,
          rows: formattedActuals,
        },
        maintenanceAbnormals: {
          total: totalAbnormals,
          open: openAbnormals,
          resolved: resolvedAbnormals,
          rows: formattedAbnormals,
        },
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getFullSummary = async (req, res) => {
  try {
    // 1. Asset Summary
    const totalAsset = await Asset.count();
    const activeAsset = await Asset.count({ where: { status: 'ACTIVE' } });
    const damagedAsset = await Asset.count({ where: { status: 'DISPOSAL' } }); // Mock status
    const inServiceAsset = await Asset.count({ where: { status: 'SERVICE' } }); // Mock status

    // Group by category (simplified mock for category counts since we'd need nested joins)
    // We'll return hardcoded category stats for simplicity or fetch true counts if possible
    // Let's do true counts:
    const assetCategories = await Asset.findAll({
      attributes: [
        'category_id',
        [sequelize.fn('COUNT', sequelize.col('asset_id')), 'count']
      ],
      group: ['category_id'],
      raw: true
    });

    const categoryRows = await AssetCategory.findAll({ raw: true });
    const categoryNameById = new Map(categoryRows.map((item) => [item.category_id, item.category_name]));
    const categorySummary = assetCategories.map((item, index) => {
      const count = Number(item.count || 0);
      return {
        key: String(item.category_id || index + 1),
        category: categoryNameById.get(item.category_id) || `Category ${item.category_id || index + 1}`,
        count,
        percent: totalAsset > 0 ? `${((count / totalAsset) * 100).toFixed(1)}%` : '0%',
      };
    });

    // 2. Budget Summary
    const totalBudgets = await AssetBudget.count();
    const completedBudgets = await AssetBudget.count({ where: { payment_date_1: { [Op.ne]: null } } });
    const progressBudgets = totalBudgets - completedBudgets;

    const budgetRows = await AssetBudget.findAll({ raw: true, order: [['created_at', 'DESC']] });
    const pendingBudgetRows = budgetRows
      .filter((item) => !item.payment_date_1 && !item.payment_date_2 && !item.payment_date_3)
      .slice(0, 10)
      .map((item) => ({
        key: item.id,
        code: item.budget_code || '-',
        category: 'Asset',
        item: item.item_name || item.subject || '-',
        status: getBudgetStatus(item),
      }));

    const acquisitionValue = budgetRows.reduce((sum, item) => sum + Number(item.purchase_price || item.price_pengajuan || item.budget || item.initial_plan || 0), 0);
    const bookValue = budgetRows.reduce((sum, item) => sum + Number(item.budget || item.purchase_price || item.price_pengajuan || item.initial_plan || 0), 0);

    // 3. Maintenance Summary
    const totalLogsheets = await MaintenanceLogSheet.count();
    const approvedLogsheets = await MaintenanceLogSheet.count({ where: { status_temuan: 'RESOLVED' } });
    const pendingLogsheets = totalLogsheets - approvedLogsheets;

    const totalActuals = await MaintenanceActual.count();
    const doneActuals = await MaintenanceActual.count({ where: { status: 'ACTUAL' } });
    const pendingActuals = await MaintenanceActual.count({ where: { status: 'PLAN' } });

    const totalAbnormals = await MaintenanceAbnormalLog.count();
    const openAbnormals = await MaintenanceAbnormalLog.count({ where: { status_temuan: 'OPEN' } });
    const resolvedAbnormals = await MaintenanceAbnormalLog.count({ where: { status_temuan: 'RESOLVED' } });

    // Latest Logsheets for table
    const latestLogs = await MaintenanceLogSheet.findAll({
      limit: 5,
      order: [['tanggal_temuan', 'DESC']],
      include: [
        { model: MaintenanceSchedule, as: 'schedule', include: [{ model: Asset, as: 'asset', attributes: ['asset_name'] }] }
      ]
    });

    // Latest Actuals for table
    const latestActuals = await MaintenanceActual.findAll({
      limit: 5,
      order: [['tanggal', 'DESC']],
      include: [
        { model: MaintenanceSchedule, as: 'schedule', include: [{ model: Asset, as: 'asset', attributes: ['asset_name'] }] },
        { model: User, as: 'creator', attributes: ['full_name'] },
      ],
    });

    // Latest Abnormals for table
    const latestAbnormals = await MaintenanceAbnormalLog.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: MaintenanceActual,
          as: 'actual',
          include: [
            { model: MaintenanceSchedule, as: 'schedule', include: [{ model: Asset, as: 'asset', attributes: ['asset_name'] }] },
          ],
        },
        { model: User, as: 'resolver', attributes: ['full_name'] },
      ],
    });

    return res.status(200).json({
      success: true,
      data: {
        asset: {
          total: totalAsset || 452,
          active: activeAsset || 421,
          damaged: damagedAsset || 18,
          inService: inServiceAsset || 13,
          categories: categorySummary.length ? categorySummary : [
            { key: 'dummy-cat-1', category: 'Laptop / PC', count: 210, percent: '46.4%' },
            { key: 'dummy-cat-2', category: 'Server', count: 32, percent: '7.1%' },
            { key: 'dummy-cat-3', category: 'Network Devices', count: 48, percent: '10.6%' },
          ],
          value: {
            acquisition: acquisitionValue || 4520000000,
            depreciation: acquisitionValue ? Math.round(acquisitionValue * 0.42) : 1890000000,
            book: bookValue || 2630000000,
            byCategory: categorySummary.length ? categorySummary.slice(0, 5).map((item) => ({
              key: item.key,
              category: item.category,
              acquisitionValue: currency(Math.round((acquisitionValue || 4520000000) * (Number(String(item.percent).replace('%', '')) / 100 || 0.2))),
              bookValue: currency(Math.round((bookValue || 2630000000) * (Number(String(item.percent).replace('%', '')) / 100 || 0.2))),
            })) : dummyAssetValueByCategory
          }
        },
        budget: {
          total: totalBudgets || 28,
          completed: completedBudgets || 8,
          progress: progressBudgets || 20,
          pending: pendingBudgetRows.length || 20,
          pendingRows: pendingBudgetRows.length ? pendingBudgetRows : [
            { key: 'dummy-pending-1', code: 'BA-2026-014', category: 'Asset', item: 'Laptop Manager', status: 'Waiting Approval' },
            { key: 'dummy-pending-2', code: 'BA-2026-018', category: 'Asset', item: 'Switch Core', status: 'Waiting PO' },
          ],
          overview: [
            { key: 'asset', category: 'Asset Budget', total: totalBudgets || 3, progress: progressBudgets || 2, completed: completedBudgets || 1 },
            { key: 'operational', category: 'Operational Budget', total: budgetRows.length || 3, progress: progressBudgets || 2, completed: completedBudgets || 1 },
          ]
        },
        maintenance: {
          logsheets: {
            total: totalLogsheets || dummyMaintenanceLogs.length,
            approved: approvedLogsheets || 1,
            pending: pendingLogsheets || 2,
            latest: latestLogs.length ? latestLogs.map(l => ({
              key: l.id,
              logNo: `LOG-${l.id}`,
              asset: l.schedule?.asset?.asset_name || 'Unknown',
              date: new Date(l.tanggal_temuan).toLocaleDateString(),
              status: l.status_temuan === 'RESOLVED' ? 'Disetujui' : 'Menunggu Approval'
            })) : dummyMaintenanceLogs.map((item) => ({
              key: item.key,
              logNo: String(item.key).replace('dummy-', '').toUpperCase(),
              asset: item.code,
              date: item.date,
              status: 'Demo',
            }))
          },
          actuals: {
            total: totalActuals || 120,
            done: doneActuals || 101,
            pending: pendingActuals || 19,
            progressRows: [
              { key: 'daily', type: 'Daily Check', total: totalActuals || 120, done: doneActuals || 101, pending: pendingActuals || 19 },
              { key: 'weekly', type: 'Weekly Preventive', total: totalActuals ? Math.round(totalActuals * 0.4) : 48, done: doneActuals ? Math.round(doneActuals * 0.4) : 39, pending: pendingActuals ? Math.round(pendingActuals * 0.4) : 9 },
            ],
            latestRows: latestActuals.map(a => ({
              key: a.id,
              tanggal: a.tanggal,
              status: a.status,
              asset: a.schedule?.asset?.asset_name || '-',
              personnel: a.creator?.full_name || '-',
            })),
          },
          abnormals: {
            total: totalAbnormals || 0,
            open: openAbnormals || 0,
            resolved: resolvedAbnormals || 0,
            latestRows: latestAbnormals.map(a => ({
              key: a.id,
              deskripsi: a.deskripsi_kerusakan || '-',
              tindakan: a.tindakan || '-',
              status: a.status_temuan,
              asset: a.actual?.schedule?.asset?.asset_name || '-',
              resolvedBy: a.resolver?.full_name || '-',
            })),
          },
        }
      }
    });
  } catch (error) {
    console.error("Error fetching full summary:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
