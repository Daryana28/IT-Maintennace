import express from "express";
import * as controller from "./assetBudgetController.js";

const router = express.Router();

router.post("/import", controller.importAssetBudgets);

export default router;
