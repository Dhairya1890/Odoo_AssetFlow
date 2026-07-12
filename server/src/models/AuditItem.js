const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AuditItem = sequelize.define('AuditItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  auditCycleId: { type: DataTypes.INTEGER, allowNull: false },
  assetId: { type: DataTypes.INTEGER, allowNull: false },
  auditorId: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'missing', 'damaged'),
    defaultValue: 'pending',
  },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'AuditItems', timestamps: true });

module.exports = AuditItem;
