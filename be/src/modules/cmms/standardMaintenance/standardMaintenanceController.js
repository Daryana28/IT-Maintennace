import { StandardMaintenance, StandardMaintenanceDetail, StandardMaintenanceCheck, YearlyStandardMaintenance, sequelize } from "../../../models/index.js";

export const createStandardMaintenance = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const payload = req.body;

    // 1. Create Parent (Device/Kategori)
    const standardMaintenance = await StandardMaintenance.create({
      kategori: payload.kategori,
      subKategori: payload.subKategori,
      namaPerangkat: payload.namaPerangkat,
      tipePerangkat: payload.tipePerangkat || "-",
      subPerangkat: payload.subPerangkat,
      yearly_standard_id: payload.yearly_standard_id,
    }, { transaction });

    // 2. Create Details & Checks
    if (payload.maintenanceDetails && payload.maintenanceDetails.length > 0) {
      for (const detail of payload.maintenanceDetails) {
        const standardDetail = await StandardMaintenanceDetail.create({
          standard_maintenance_id: standardMaintenance.id,
          fungsi: detail.fungsi,
          deskripsi: detail.deskripsi,
        }, { transaction });

        if (detail.pengecekanList && detail.pengecekanList.length > 0) {
          const checks = detail.pengecekanList.map((cek) => ({
            standard_maintenance_detail_id: standardDetail.id,
            pengecekan: cek.pengecekan,
            standard: cek.standard,
            periodik: cek.periodik,
            bagian: cek.bagian,
            metode: cek.metode,
            alat: cek.alat,
          }));

          await StandardMaintenanceCheck.bulkCreate(checks, { transaction });
        }
      }
    }

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Standard maintenance created successfully",
      data: standardMaintenance,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error in createStandardMaintenance:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create standard maintenance",
    });
  }
};

export const getAllStandardMaintenance = async (req, res) => {
  try {
    const { yearly_standard_id } = req.query;
    const whereClause = {};
    if (yearly_standard_id) {
      whereClause.yearly_standard_id = yearly_standard_id;
    }

    const data = await StandardMaintenance.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: StandardMaintenanceDetail,
          as: "details",
          include: [
            {
              model: StandardMaintenanceCheck,
              as: "pengecekanList",
            }
          ]
        }
      ]
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in getAllStandardMaintenance:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve standard maintenance data",
    });
  }
};

export const getYearsStandardMaintenance = async (req, res) => {
  try {
    const data = await YearlyStandardMaintenance.findAll({
      order: [['tahun', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in getYearsStandardMaintenance:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve yearly standard maintenance data",
    });
  }
};

export const getYearlyStandardMaintenanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await YearlyStandardMaintenance.findByPk(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in getYearlyStandardMaintenanceById:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createYearlyStandardMaintenance = async (req, res) => {
  try {
    const payload = req.body;
    const yearly = await YearlyStandardMaintenance.create({
      tahun: payload.tahun,
      judul: payload.judul,
      status_approval: "DRAFT"
    });

    return res.status(201).json({
      success: true,
      message: "Yearly standard maintenance created successfully",
      data: yearly,
    });
  } catch (error) {
    console.error("Error in createYearlyStandardMaintenance:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create yearly standard maintenance",
    });
  }
};

export const updateYearlyStandardMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { tahun, judul } = req.body;

    const yearly = await YearlyStandardMaintenance.findByPk(id);
    if (!yearly) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    await yearly.update({ tahun, judul });

    return res.status(200).json({
      success: true,
      message: "Data berhasil diperbarui",
      data: yearly,
    });
  } catch (error) {
    console.error("Error in updateYearlyStandardMaintenance:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteYearlyStandardMaintenance = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const yearly = await YearlyStandardMaintenance.findByPk(id);
    if (!yearly) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    if (yearly.status_approval !== "DRAFT") {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Hanya data DRAFT yang bisa dihapus langsung" });
    }

    // Cascade delete children manually
    const standardMaintenances = await StandardMaintenance.findAll({ where: { yearly_standard_id: id } });
    for (const sm of standardMaintenances) {
      const details = await StandardMaintenanceDetail.findAll({ where: { standard_maintenance_id: sm.id } });
      for (const d of details) {
        await StandardMaintenanceCheck.destroy({ where: { standard_maintenance_detail_id: d.id }, transaction });
      }
      await StandardMaintenanceDetail.destroy({ where: { standard_maintenance_id: sm.id }, transaction });
    }
    await StandardMaintenance.destroy({ where: { yearly_standard_id: id }, transaction });
    await yearly.destroy({ transaction });

    await transaction.commit();
    return res.status(200).json({ success: true, message: "Data berhasil dihapus" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error in deleteYearlyStandardMaintenance:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const requestDeleteYearlyStandardMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { alasan_hapus } = req.body;

    const yearly = await YearlyStandardMaintenance.findByPk(id);
    if (!yearly) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    await yearly.update({
      status_approval: "WAITING_FOR_DELETION",
      alasan_hapus
    });

    return res.status(200).json({
      success: true,
      message: "Permintaan hapus berhasil diajukan",
      data: yearly,
    });
  } catch (error) {
    console.error("Error in requestDeleteYearlyStandardMaintenance:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const upsertFlatStandardMaintenance = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      detailId, // Add detailId support
      cekId,
      yearly_standard_id,
      kategori, subKategori, namaPerangkat, tipePerangkat, subPerangkat,
      fungsi, deskripsi,
      pengecekan, standard, periodik, bagian, metode, alat
    } = req.body;

    let sm = await StandardMaintenance.findOne({
      where: { 
        yearly_standard_id, 
        kategori, 
        subKategori, 
        namaPerangkat, 
        tipePerangkat: tipePerangkat || "-",
        subPerangkat: subPerangkat || null
      },
      transaction
    });

    if (!sm) {
      sm = await StandardMaintenance.create({
        yearly_standard_id, kategori, subKategori, namaPerangkat, tipePerangkat: tipePerangkat || "-", subPerangkat
      }, { transaction });
    }

    let smDetail = null;
    if (detailId) {
       smDetail = await StandardMaintenanceDetail.findByPk(detailId, { transaction });
       if (smDetail) {
          await smDetail.update({ standard_maintenance_id: sm.id, fungsi, deskripsi }, { transaction });
       }
    }

    if (!smDetail) {
      smDetail = await StandardMaintenanceDetail.findOne({
        where: { standard_maintenance_id: sm.id, fungsi },
        transaction
      });

      if (!smDetail) {
        smDetail = await StandardMaintenanceDetail.create({
          standard_maintenance_id: sm.id, fungsi, deskripsi
        }, { transaction });
      } else if (deskripsi !== undefined && smDetail.deskripsi !== deskripsi) {
        await smDetail.update({ deskripsi }, { transaction });
      }
    }

    let smCheck = null;
    // ONLY process Check logic if pengecekan is actually provided!
    if (pengecekan !== undefined && pengecekan !== null && pengecekan !== "") {
      if (cekId) {
        smCheck = await StandardMaintenanceCheck.findByPk(cekId, { transaction });
        if (smCheck) {
          await smCheck.update({
            standard_maintenance_detail_id: smDetail.id,
            pengecekan, standard, periodik, bagian, metode, alat
          }, { transaction });
        }
      }

      if (!smCheck) {
        smCheck = await StandardMaintenanceCheck.create({
          standard_maintenance_detail_id: smDetail.id,
          pengecekan, standard, periodik, bagian, metode, alat
        }, { transaction });
      }
    }

    await transaction.commit();
    return res.status(200).json({ success: true, data: smCheck || smDetail, message: "Data berhasil disimpan" });
  } catch (error) {
    await transaction.rollback();
    console.error("Upsert Flat Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFlatStandardMaintenance = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { check_id } = req.params;
    const smCheck = await StandardMaintenanceCheck.findByPk(check_id, { transaction });
    if (!smCheck) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Pengecekan tidak ditemukan" });
    }

    const detailId = smCheck.standard_maintenance_detail_id;
    await smCheck.destroy({ transaction });

    const remainingChecks = await StandardMaintenanceCheck.count({ where: { standard_maintenance_detail_id: detailId }, transaction });
    if (remainingChecks === 0) {
      const smDetail = await StandardMaintenanceDetail.findByPk(detailId, { transaction });
      if (smDetail) {
        const smId = smDetail.standard_maintenance_id;
        await smDetail.destroy({ transaction });
        const remainingDetails = await StandardMaintenanceDetail.count({ where: { standard_maintenance_id: smId }, transaction });
        if (remainingDetails === 0) {
          await StandardMaintenance.destroy({ where: { id: smId }, transaction });
        }
      }
    }

    await transaction.commit();
    return res.status(200).json({ success: true, message: "Data berhasil dihapus" });
  } catch (error) {
    await transaction.rollback();
    console.error("Delete Flat Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStandardMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { kategori, subKategori, namaPerangkat, tipePerangkat, subPerangkat } = req.body;
    
    const sm = await StandardMaintenance.findByPk(id);
    if (!sm) {
      return res.status(404).json({ success: false, message: "Perangkat tidak ditemukan" });
    }

    const updateClause = { kategori, subKategori, namaPerangkat };
    if (tipePerangkat !== undefined) updateClause.tipePerangkat = tipePerangkat;

    const whereClause = {
      yearly_standard_id: sm.yearly_standard_id,
      kategori: sm.kategori,
      subKategori: sm.subKategori,
      namaPerangkat: sm.namaPerangkat
    };

    if (subPerangkat !== undefined) {
      updateClause.subPerangkat = subPerangkat;
      whereClause.subPerangkat = sm.subPerangkat;
    }

    await StandardMaintenance.update(updateClause, { where: whereClause });

    return res.status(200).json({
      success: true,
      message: "Data perangkat berhasil diperbarui",
      data: updateClause,
    });
  } catch (error) {
    console.error("Error in updateStandardMaintenance:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStandardMaintenance = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { level } = req.query; // 'namaPerangkat' or 'jenisPerangkat'
    
    const sm = await StandardMaintenance.findByPk(id);
    if (!sm) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Perangkat tidak ditemukan" });
    }
    
    const whereClause = {
      yearly_standard_id: sm.yearly_standard_id,
      kategori: sm.kategori,
      subKategori: sm.subKategori,
      namaPerangkat: sm.namaPerangkat
    };

    if (level === 'jenisPerangkat') {
      whereClause.subPerangkat = sm.subPerangkat;
    }

    const smList = await StandardMaintenance.findAll({ where: whereClause, transaction });

    for (const item of smList) {
      const details = await StandardMaintenanceDetail.findAll({ where: { standard_maintenance_id: item.id }, transaction });
      for (const d of details) {
        await StandardMaintenanceCheck.destroy({ where: { standard_maintenance_detail_id: d.id }, transaction });
      }
      await StandardMaintenanceDetail.destroy({ where: { standard_maintenance_id: item.id }, transaction });
      await item.destroy({ transaction });
    }
    
    await transaction.commit();
    return res.status(200).json({ success: true, message: "Perangkat berhasil dihapus" });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStandardMaintenanceDetail = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const detail = await StandardMaintenanceDetail.findByPk(id);
    if (!detail) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Detail tidak ditemukan" });
    }
    
    await StandardMaintenanceCheck.destroy({ where: { standard_maintenance_detail_id: id }, transaction });
    await detail.destroy({ transaction });
    
    await transaction.commit();
    return res.status(200).json({ success: true, message: "Deskripsi berhasil dihapus" });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ success: false, message: error.message });
  }
};
