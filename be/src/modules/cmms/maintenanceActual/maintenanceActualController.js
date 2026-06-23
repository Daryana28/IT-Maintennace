import { MaintenanceActual, MaintenanceAbnormalLog, MaintenanceLogSheet, sequelize } from "../../../models/index.js";

export const updateActualStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["PLAN", "ACTUAL"].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Status must be PLAN or ACTUAL" });
    }

    const actual = await MaintenanceActual.findByPk(id);
    if (!actual) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Actual record not found" });
    }

    const userId = req.user?.id || req.user?.user_id || null;

    if (status === "ACTUAL") {
      await actual.update({
        status: "ACTUAL",
        legend: "✓",
        created_by: userId
      }, { transaction });
    } else {
      // PLAN - reset
      await actual.update({
        status: "PLAN",
        legend: "□",
        created_by: null
      }, { transaction });

      // Delete associated abnormal logs if any
      await MaintenanceAbnormalLog.destroy({
        where: { actual_id: id },
        transaction
      });

      // Delete associated log sheets if any
      await MaintenanceLogSheet.destroy({
        where: { actual_id: id },
        transaction
      });
    }

    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: `Status successfully updated to ${status}`,
      data: { id: actual.id, status: actual.status, legend: actual.legend }
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Update actual status error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
