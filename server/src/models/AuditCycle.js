const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AuditCycle = sequelize.define('AuditCycle', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  scope: { type: DataTypes.ENUM('department', 'location'), allowNull: false },
  scopeValue: { type: DataTypes.STRING, allowNull: false },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('active', 'closed'), defaultValue: 'active' },
  createdById: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'AuditCycles', timestamps: true });

module.exports = AuditCycle;
