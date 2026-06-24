import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "StandardMaintenance",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      kategori: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      subKategori: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      namaPerangkat: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      tipePerangkat: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      subPerangkat: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      yearly_standard_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      source_file: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      imported_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      imported_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
      tableName: "standard_maintenances",
      timestamps: false,
      freezeTableName: true,
    }
  );
