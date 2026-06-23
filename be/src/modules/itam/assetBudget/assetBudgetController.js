import { AssetBudget } from "../../../models/index.js";

export const importAssetBudgets = async (req, res) => {
  try {
    const budgets = req.body;
    console.log("DEBUG: Importing asset budgets:", JSON.stringify(budgets, null, 2));
    await AssetBudget.bulkCreate(budgets);
    res.status(200).json({ success: true, message: "Berhasil import data budget" });
  } catch (error) {
    console.error("Error importing asset budgets:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssetBudgets = async (req, res) => {
  try {
    const budgets = await AssetBudget.findAll({
      order: [["budget_code", "DESC"], ["item_no", "ASC"]],
    });
    res.status(200).json({ success: true, data: budgets });
  } catch (error) {
    console.error("Error fetching asset budgets:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
