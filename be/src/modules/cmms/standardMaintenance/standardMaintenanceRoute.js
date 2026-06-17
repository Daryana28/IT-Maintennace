import express from "express";
import {
  createStandardMaintenance,
  getAllStandardMaintenance,
  getYearsStandardMaintenance,
  getYearlyStandardMaintenanceById,
  createYearlyStandardMaintenance,
  updateYearlyStandardMaintenance,
  deleteYearlyStandardMaintenance,
  requestDeleteYearlyStandardMaintenance,
  upsertFlatStandardMaintenance,
  deleteFlatStandardMaintenance,
  updateStandardMaintenance,
  deleteStandardMaintenance,
  deleteStandardMaintenanceDetail,
} from "./standardMaintenanceController.js";

const router = express.Router();

router.post("/", createStandardMaintenance);
router.get("/", getAllStandardMaintenance);
router.put("/:id", updateStandardMaintenance);
router.delete("/:id", deleteStandardMaintenance);
router.delete("/detail/:id", deleteStandardMaintenanceDetail);
router.get("/years", getYearsStandardMaintenance);
router.get("/years/:id", getYearlyStandardMaintenanceById);
router.post("/years", createYearlyStandardMaintenance);
router.put("/years/:id", updateYearlyStandardMaintenance);
router.delete("/years/:id", deleteYearlyStandardMaintenance);
router.post("/years/:id/request-delete", requestDeleteYearlyStandardMaintenance);

router.post("/flat", upsertFlatStandardMaintenance);
router.delete("/flat/:check_id", deleteFlatStandardMaintenance);

export default router;
