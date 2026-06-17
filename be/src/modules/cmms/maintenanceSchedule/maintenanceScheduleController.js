import { MaintenanceSchedule, Asset, StandardMaintenance, YearlyStandardMaintenance, AssetCategory, StandardMaintenanceDetail, StandardMaintenanceCheck } from "../../../models/index.js";

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
        if (str.includes("hari")) return num;
        if (str.includes("minggu")) return num * 7;
        if (str.includes("bulan")) return num * 30;
        if (str.includes("tahun")) return num * 365;
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

        if (!existing) {
          await MaintenanceSchedule.create({
            asset_id: asset.asset_id,
            yearly_standard_id: yearly_standard_id,
            standard_maintenance_id: sm.id,
            periodik: derivedPeriodik,
            status: "ACTIVE"
          });
          createdCount++;
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

