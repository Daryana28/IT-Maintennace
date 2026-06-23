import express from "express";
import { updateActualStatus } from "./maintenanceActualController.js";
import { submitAbnormalLog } from "../maintenanceAbnormalLog/maintenanceAbnormalLogController.js";
import authMiddleware from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.put("/:id/status", updateActualStatus);
router.post("/:id/abnormal", submitAbnormalLog);

export default router;
