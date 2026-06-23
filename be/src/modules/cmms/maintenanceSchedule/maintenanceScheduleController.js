import { sequelize, MaintenanceSchedule, Asset, StandardMaintenance, YearlyStandardMaintenance, AssetCategory, StandardMaintenanceDetail, StandardMaintenanceCheck, MaintenanceActual } from "../../../models/index.js";
import { generateCheckboxDates } from "./checkboxGenerator.js";
import dayjs from "dayjs";
import { Op } from "sequelize";

export const generateSchedule = async (req, res) => {
  try {
    const { yearly_standard_id } = req.body;

    if (!yearly_standard_id) {
      return res.status(400).json({ success: false, message: "Yearly Standard ID is required" });
    }

    const yearlyStandard = await YearlyStandardMaintenance.findByPk(yearly_standard_id);
    if (!yearlyStandard) {
      return res.status(404).json({ success: false, message: "Yearly Standard not found" });
    }

    // Ambil semua standard maintenance untuk tahun ini beserta relasinya
    const standardsRaw = await StandardMaintenance.findAll({
      where: { yearly_standard_id },
      include: [
        {
          model: StandardMaintenanceDetail,
          as: "details",
          include: [
            {
              model: StandardMaintenanceCheck,
              as: "pengecekanList"
            }
          ]
        }
      ]
    });

    const standards = standardsRaw.map(s => s.toJSON());

    if (standards.length === 0) {
      return res.status(404).json({ success: false, message: "No Standard Maintenance records found for this year" });
    }

    let createdCount = 0;

    for (const sm of standards) {
      // Gunakan subKategori sebagai acuan utama untuk mencari Asset Category
      const leafName = sm.subKategori && sm.subKategori.trim() !== "-" ? sm.subKategori : sm.kategori;
      if (!leafName) continue;

      const category = await AssetCategory.findOne({ 
        where: { category_name: leafName },
        raw: true
      });

      if (!category) continue;

      const assets = await Asset.findAll({
        where: { category_id: category.category_id },
        raw: true
      });

      // Cari periodik terkecil (paling sering) dari semua pengecekan
      let derivedPeriodik = "1 Bulan"; // fallback
      let minDuration = Infinity;

      const formatPeriodik = (val) => {
        if (!val) return "";
        return val.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      };

      const parseDuration = (val) => {
        if (!val) return Infinity;
        const str = val.toLowerCase();
        const num = parseInt(str) || 1;
        if (str.includes("hari") || str.includes("d")) return num;
        if (str.includes("minggu") || str.includes("week") || str.includes("w")) return num * 7;
        if (str.includes("bulan") || str.includes("month") || str.includes("m")) return num * 30;
        if (str.includes("tahun") || str.includes("year") || str.includes("y")) return num * 365;
        return Infinity;
      };

      if (sm.details && sm.details.length > 0) {
        for (const detail of sm.details) {
          if (detail.pengecekanList && detail.pengecekanList.length > 0) {
            for (const cek of detail.pengecekanList) {
              if (cek.periodik) {
                const duration = parseDuration(cek.periodik);
                if (duration < minDuration) {
                  minDuration = duration;
                  derivedPeriodik = formatPeriodik(cek.periodik);
                }
              }
            }
          }
        }
      }

      for (const asset of assets) {
        // Cek apakah sudah ada schedule untuk asset ini dan standard ini
        const existing = await MaintenanceSchedule.findOne({
          where: {
            asset_id: asset.asset_id,
            yearly_standard_id: yearly_standard_id,
            standard_maintenance_id: sm.id
          }
        });

        let targetSchedule = existing;
        if (!existing) {
          targetSchedule = await MaintenanceSchedule.create({
            asset_id: asset.asset_id,
            yearly_standard_id: yearly_standard_id,
            standard_maintenance_id: sm.id,
            periodik: derivedPeriodik,
            status: "ACTIVE"
          });
          createdCount++;
        } else {
          await existing.update({ status: "ACTIVE", periodik: derivedPeriodik });
        }

        // Auto-generate actual checkbox matrix for this schedule
        const checks = await StandardMaintenanceCheck.findAll({
          include: {
            model: StandardMaintenanceDetail,
            where: { standard_maintenance_id: sm.id }
          }
        });

        const actualRecords = [];
        for (const check of checks) {
          const periodikString = check.periodik || targetSchedule.periodik || derivedPeriodik || "1 Bulan";
          const dates = await generateCheckboxDates(yearlyStandard.tahun, periodikString);
          for (const date of dates) {
            actualRecords.push({
              schedule_id: targetSchedule.id,
              check_id: check.id,
              tanggal: date,
              status: "PLAN",
              legend: "□",
              created_at: new Date(),
              updated_at: new Date()
            });
          }
        }

        if (actualRecords.length > 0) {
          const existingActuals = await MaintenanceActual.findAll({
            where: { schedule_id: targetSchedule.id },
            raw: true
          });
          const existingKeys = new Set(
            existingActuals.map(act => `${act.schedule_id}-${act.check_id}-${act.tanggal}`)
          );

          const newActualRecords = actualRecords.filter(
            rec => !existingKeys.has(`${rec.schedule_id}-${rec.check_id}-${rec.tanggal}`)
          );

          if (newActualRecords.length > 0) {
            await MaintenanceActual.bulkCreate(newActualRecords);
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully generated ${createdCount} new maintenance schedules.`,
      data: { created: createdCount }
    });

  } catch (error) {
    console.error("Generate schedule error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSchedules = async (req, res) => {
  try {
    const { yearly_standard_id } = req.query;
    const whereClause = {};
    if (yearly_standard_id) whereClause.yearly_standard_id = yearly_standard_id;

    const schedulesRaw = await MaintenanceSchedule.findAll({
      where: whereClause,
      include: [
        { 
          model: Asset, 
          as: "asset",
          include: ["location"]
        },
        { 
          model: StandardMaintenance, 
          as: "StandardMaintenance",
          include: [
            {
              model: StandardMaintenanceDetail,
              as: "details",
              include: [
                {
                  model: StandardMaintenanceCheck,
                  as: "pengecekanList"
                }
              ]
            }
          ]
        }
      ]
    });
    const schedules = schedulesRaw.map(s => s.toJSON());

    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSchedule = async (req, res) => {
  try {
    const { asset_ids, yearly_standard_id, standard_maintenance_id, periodik } = req.body;

    if (!asset_ids || !Array.isArray(asset_ids) || asset_ids.length === 0 || !yearly_standard_id || !standard_maintenance_id || !periodik) {
      return res.status(400).json({ success: false, message: "Semua field (asset_ids, yearly, standard, periodik) harus diisi" });
    }

    let createdCount = 0;
    for (const asset_id of asset_ids) {
      const existing = await MaintenanceSchedule.findOne({
        where: {
          asset_id,
          yearly_standard_id,
          standard_maintenance_id
        }
      });

      let nextDate = req.body.next_maintenance_date || null;
      let nextEndDate = req.body.next_maintenance_end_date || null;
      if (req.body.asset_dates && req.body.asset_dates[asset_id]) {
        const ad = req.body.asset_dates[asset_id];
        if (typeof ad === 'object' && ad !== null) {
          nextDate = ad.start || null;
          nextEndDate = ad.end || null;
        } else {
          nextDate = ad;
        }
      }

      if (!existing) {
        await MaintenanceSchedule.create({
          asset_id,
          yearly_standard_id,
          standard_maintenance_id,
          periodik,
          status: "ACTIVE",
          next_maintenance_date: nextDate,
          next_maintenance_end_date: nextEndDate
        });
        createdCount++;
      } else {
        // Jika sudah ada (bisa jadi CANCELLED), aktifkan kembali dan update data
        const updateData = { status: "ACTIVE", periodik };
        if (nextDate) updateData.next_maintenance_date = nextDate;
        if (nextEndDate) updateData.next_maintenance_end_date = nextEndDate;
        await existing.update(updateData);
        createdCount++;
      }
    }

    res.status(201).json({ success: true, message: `Berhasil membuat ${createdCount} jadwal manual` });
  } catch (error) {
    console.error("Create schedule error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { asset_ids, next_maintenance_date, next_maintenance_end_date, periodik, standard_maintenance_id } = req.body;

    const schedule = await MaintenanceSchedule.findByPk(id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan" });
    }

    if (asset_ids && Array.isArray(asset_ids) && asset_ids.length > 0) {
      schedule.asset_id = asset_ids[0];
    }
    
    if (next_maintenance_date !== undefined) {
      schedule.next_maintenance_date = next_maintenance_date;
    }
    if (next_maintenance_end_date !== undefined) {
      schedule.next_maintenance_end_date = next_maintenance_end_date;
    }

    if (periodik) schedule.periodik = periodik;
    if (standard_maintenance_id) schedule.standard_maintenance_id = standard_maintenance_id;

    await schedule.save();

    res.status(200).json({ success: true, message: "Berhasil mengubah jadwal" });
  } catch (error) {
    console.error("Update schedule error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const schedule = await MaintenanceSchedule.findByPk(id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan" });
    }

    if (schedule.status === "CANCELLED") {
      return res.status(400).json({ success: false, message: "Jadwal sudah dibatalkan sebelumnya" });
    }

    await schedule.update({
      status: "CANCELLED",
      cancel_reason: reason || null,
    });

    res.status(200).json({
      success: true,
      message: "Jadwal berhasil dibatalkan",
      data: { id: schedule.id, status: "CANCELLED" },
    });
  } catch (error) {
    console.error("Cancel schedule error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateCheckboxes = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { yearly_standard_id, schedule_id } = req.body;

    let schedules = [];
    let year = null;

    if (schedule_id) {
      const schedule = await MaintenanceSchedule.findByPk(schedule_id, {
        include: [{ model: YearlyStandardMaintenance }]
      });
      if (!schedule) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: "Schedule not found" });
      }
      schedules = [schedule];
      year = schedule.YearlyStandardMaintenance?.tahun;
    } else if (yearly_standard_id) {
      const yearlyStandard = await YearlyStandardMaintenance.findByPk(yearly_standard_id);
      if (!yearlyStandard) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: "Yearly Standard not found" });
      }
      schedules = await MaintenanceSchedule.findAll({
        where: { yearly_standard_id }
      });
      year = yearlyStandard.tahun;
    } else {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "yearly_standard_id or schedule_id is required" });
    }

    if (schedules.length === 0) {
      await transaction.rollback();
      return res.status(200).json({ success: true, message: "No schedules found to generate checkboxes.", data: { created: 0 } });
    }

    let createdCount = 0;

    for (const schedule of schedules) {
      const checks = await StandardMaintenanceCheck.findAll({
        include: {
          model: StandardMaintenanceDetail,
          where: { standard_maintenance_id: schedule.standard_maintenance_id }
        }
      });

      const actualRecords = [];

      for (const check of checks) {
        const periodikString = check.periodik || schedule.periodik || "1 Bulan";
        const dates = await generateCheckboxDates(year, periodikString);

        for (const date of dates) {
          actualRecords.push({
            schedule_id: schedule.id,
            check_id: check.id,
            tanggal: date,
            status: "PLAN",
            legend: "□",
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }

      if (actualRecords.length > 0) {
        await MaintenanceActual.bulkCreate(actualRecords, {
          transaction,
          ignoreDuplicates: true
        });
        createdCount += actualRecords.length;
      }
    }

    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: `Successfully generated ${createdCount} checkbox cells.`,
      data: { created: createdCount }
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Generate checkboxes error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getScheduleCheckboxes = async (req, res) => {
  try {
    const { id } = req.params;
    const { month } = req.query;

    const schedule = await MaintenanceSchedule.findByPk(id, {
      include: [{ model: YearlyStandardMaintenance }]
    });

    if (!schedule) {
      return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan" });
    }

    const whereClause = { schedule_id: id };
    if (month) {
      const monthNum = parseInt(month);
      whereClause[Op.and] = [
        sequelize.where(sequelize.fn("MONTH", sequelize.col("tanggal")), monthNum)
      ];
    }

    const checkboxes = await MaintenanceActual.findAll({
      where: whereClause,
      include: [
        {
          model: StandardMaintenanceCheck,
          as: "check",
          include: {
            model: StandardMaintenanceDetail
          }
        },
        {
          model: MaintenanceActual.sequelize.models.MaintenanceAbnormalLog,
          as: "abnormalLogs"
        }
      ],
      order: [["tanggal", "ASC"]]
    });

    const formatted = checkboxes.map(cb => {
      const cbJSON = cb.toJSON();
      const abnormal = cbJSON.abnormalLogs && cbJSON.abnormalLogs.length > 0 ? cbJSON.abnormalLogs[0] : null;
      return {
        actual_id: cbJSON.id,
        date: cbJSON.tanggal,
        week: dayjs(cbJSON.tanggal).isoWeek(),
        status: cbJSON.status,
        legend: cbJSON.legend,
        check_id: cbJSON.check_id,
        check: cbJSON.check,
        abnormal: abnormal ? {
          id: abnormal.id,
          deskripsi_kerusakan: abnormal.deskripsi_kerusakan,
          tindakan: abnormal.tindakan,
          status: abnormal.status_temuan
        } : null
      };
    });

    res.status(200).json({
      success: true,
      data: {
        year: schedule.YearlyStandardMaintenance?.tahun,
        periodik: schedule.periodik,
        checkboxes: formatted
      }
    });

  } catch (error) {
    console.error("Get schedule checkboxes error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMonthlyScheduleMatrix = async (req, res) => {
  try {
    const { year, month, category } = req.query;

    if (!year || !month) {
      return res.status(400).json({ success: false, message: "Year and Month parameters are required" });
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    const yearlyStandard = await YearlyStandardMaintenance.findOne({
      where: { tahun: yearNum }
    });

    if (!yearlyStandard) {
      return res.status(404).json({ success: false, message: `Yearly Standard for ${yearNum} not found` });
    }

    const scheduleWhere = { yearly_standard_id: yearlyStandard.id };
    
    const standardWhere = {};
    if (category) {
      const catMap = {
        "hardware": ["hardware"],
        "software-hardware": ["hardware"],
        "application": ["software"],
        "software": ["software"],
        "network": ["networking"],
        "networking": ["networking"],
        "cyber": ["cyber"],
        "cyber-security": ["cyber"],
        "network-cyber": ["networking", "cyber"]
      };
      
      const mappedCats = catMap[category.toLowerCase()] || [category];
      standardWhere.kategori = {
        [Op.in]: mappedCats
      };
    }

    const schedules = await MaintenanceSchedule.findAll({
      where: scheduleWhere,
      include: [
        {
          model: Asset,
          as: "asset",
          include: ["location"]
        },
        {
          model: StandardMaintenance,
          as: "StandardMaintenance",
          where: standardWhere,
          include: [
            {
              model: StandardMaintenanceDetail,
              as: "details",
              include: [
                {
                  model: StandardMaintenanceCheck,
                  as: "pengecekanList"
                }
              ]
            }
          ]
        }
      ]
    });

    const matrixData = [];

    for (const schedule of schedules) {
      const sm = schedule.StandardMaintenance;
      if (!sm || !sm.details) continue;

      for (const detail of sm.details) {
        if (!detail.pengecekanList) continue;

        for (const check of detail.pengecekanList) {
          const actuals = await MaintenanceActual.findAll({
            where: {
              schedule_id: schedule.id,
              check_id: check.id,
              [Op.and]: [
                sequelize.where(sequelize.fn("YEAR", sequelize.col("tanggal")), yearNum),
                sequelize.where(sequelize.fn("MONTH", sequelize.col("tanggal")), monthNum)
              ]
            },
            include: [
              {
                model: MaintenanceActual.sequelize.models.MaintenanceAbnormalLog,
                as: "abnormalLogs"
              }
            ],
            order: [["tanggal", "ASC"]]
          });

          const checkboxes = actuals.map(act => {
            const actJSON = act.toJSON();
            const abnormal = actJSON.abnormalLogs && actJSON.abnormalLogs.length > 0 ? actJSON.abnormalLogs[0] : null;
            return {
              actual_id: actJSON.id,
              date: actJSON.tanggal,
              week: dayjs(actJSON.tanggal).isoWeek(),
              status: actJSON.status,
              legend: actJSON.legend,
              abnormal: abnormal ? {
                id: abnormal.id,
                deskripsi_kerusakan: abnormal.deskripsi_kerusakan,
                tindakan: abnormal.tindakan,
                status: abnormal.status_temuan
              } : null
            };
          });

          matrixData.push({
            schedule_id: schedule.id,
            asset: schedule.asset,
            kategori: sm.kategori,
            subKategori: sm.subKategori,
            namaPerangkat: sm.namaPerangkat,
            tipePerangkat: sm.tipePerangkat,
            subPerangkat: sm.subPerangkat,
            detail_id: detail.id,
            fungsi: detail.fungsi,
            deskripsi: detail.deskripsi,
            check_id: check.id,
            pengecekan: check.pengecekan,
            standard: check.standard,
            periodik: check.periodik || schedule.periodik,
            checkboxes
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: matrixData
    });

  } catch (error) {
    console.error("Get monthly schedule matrix error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

