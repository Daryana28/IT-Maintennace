import express from "express";
import { updateActualStatus } from "./maintenanceActualController.js";
import authMiddleware from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.put("/:id/status", updateActualStatus);

export default router;
