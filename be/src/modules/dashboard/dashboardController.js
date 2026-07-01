import { AssetBudget, MaintenanceLogSheet, MaintenanceSchedule, Asset, User } from "../../models/index.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const assetBudgets = await AssetBudget.findAll({
      limit: 7,
      order: [['created_at', 'DESC']]
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
      initialBudget: `Rp ${Number(b.initial_plan || 0).toLocaleString('id-ID')}`,
      status: "Closed" // Default mock since status may not be in DB
    }));

    return res.status(200).json({
      success: true,
      data: {
        assetBudgets: formattedBudgets,
        maintenanceLogs: formattedLogs,
        operationalBudgets: [] 
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
    const { sequelize } = await import('../../config/db/db.js');
    const assetCategories = await Asset.findAll({
      attributes: [
        'category_id',
        [sequelize.fn('COUNT', sequelize.col('asset_id')), 'count']
      ],
      group: ['category_id'],
      raw: true
    });

    // 2. Budget Summary
    const totalBudgets = await AssetBudget.count();
    const completedBudgets = await AssetBudget.count({ where: { payment_date_1: { [sequelize.Op.ne]: null } } }); // Mock logic
    const progressBudgets = totalBudgets - completedBudgets;

    // 3. Maintenance Summary
    const totalLogsheets = await MaintenanceLogSheet.count();
    const approvedLogsheets = await MaintenanceLogSheet.count({ where: { status_temuan: 'RESOLVED' } });
    const pendingLogsheets = totalLogsheets - approvedLogsheets;

    const totalActuals = await MaintenanceActual.count();
    const doneActuals = await MaintenanceActual.count({ where: { status: 'ACTUAL' } });
    const pendingActuals = await MaintenanceActual.count({ where: { status: 'PLAN' } });

    // Latest Logsheets for table
    const latestLogs = await MaintenanceLogSheet.findAll({
      limit: 5,
      order: [['tanggal_temuan', 'DESC']],
      include: [
        { model: MaintenanceSchedule, as: 'schedule', include: [{ model: Asset, as: 'asset', attributes: ['asset_name'] }] }
      ]
    });

    return res.status(200).json({
      success: true,
      data: {
        asset: {
          total: totalAsset,
          active: activeAsset,
          damaged: damagedAsset,
          inService: inServiceAsset,
          categories: assetCategories // raw data, format in frontend
        },
        budget: {
          total: totalBudgets,
          completed: completedBudgets,
          progress: progressBudgets
        },
        maintenance: {
          logsheets: {
            total: totalLogsheets,
            approved: approvedLogsheets,
            pending: pendingLogsheets,
            latest: latestLogs.map(l => ({
              key: l.id,
              logNo: `LOG-${l.id}`,
              asset: l.schedule?.asset?.asset_name || 'Unknown',
              date: new Date(l.tanggal_temuan).toLocaleDateString(),
              status: l.status_temuan === 'RESOLVED' ? 'Disetujui' : 'Menunggu Approval'
            }))
          },
          actuals: {
            total: totalActuals,
            done: doneActuals,
            pending: pendingActuals
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching full summary:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
