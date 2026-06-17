import { DataTypes } from "sequelize";

export default (sequelize) =>
 sequelize.define(
  "AssetBudget",
  {
   id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
   },
   budget_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
   },
   subject: {
    type: DataTypes.STRING(255),
    allowNull: true,
   },
   initial_plan: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
   },
   review: {
    type: DataTypes.STRING(255),
    allowNull: true,
   },
   item_no: {
    type: DataTypes.STRING(100),
    allowNull: true,
   },
   item_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
   },
   qty: {
    type: DataTypes.INTEGER,
    allowNull: true,
   },
   purchase_price: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
   },
   rate: {
    type: DataTypes.STRING(50),
    allowNull: true,
   },
   budget: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
   },
   po_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
   },
   ship_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
   },
   estimation_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
   },
   payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
   },
   payment_amount_1: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
   },
   created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
   },
   updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
   },
  },
  {
   tableName: "asset_budgets",
   timestamps: true,
   createdAt: "created_at",
   updatedAt: "updated_at",
   freezeTableName: true,
  }
 );
