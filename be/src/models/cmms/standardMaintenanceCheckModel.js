import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "StandardMaintenanceCheck",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      standard_maintenance_detail_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      pengecekan: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      standard: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      periodik: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      bagian: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      metode: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      alat: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      planned_dates: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const rawValue = this.getDataValue('planned_dates');
          return rawValue ? JSON.parse(rawValue) : [];
        },
        set(val) {
          this.setDataValue('planned_dates', val ? JSON.stringify(val) : null);
        }
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "standard_maintenance_checks",
      timestamps: false,
      freezeTableName: true,
    }
  );
