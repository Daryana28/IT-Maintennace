import express from "express";
import { generateSchedule, getSchedules, createSchedule, updateSchedule, cancelSchedule } from "./maintenanceScheduleController.js";
import authMiddleware from "../../../middlewares/authMiddleware.js";


const router = express.Router();

router.use(authMiddleware);

router.post("/generate", generateSchedule);
router.post("/", createSchedule);
router.get("/", getSchedules);
router.put("/:id", updateSchedule);
router.patch("/:id/cancel", cancelSchedule);


export default router;
