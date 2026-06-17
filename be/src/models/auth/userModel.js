// be\src\models\userModel.js
import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "User",
    {
      user_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      company_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      department_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      job_level_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      supervisor_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      full_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "users",
      timestamps: false,
      freezeTableName: true,
    }
  );