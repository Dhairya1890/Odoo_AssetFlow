const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AuditCycleAuditor = sequelize.define('AuditCycleAuditor', {
  auditCycleId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'AuditCycleAuditors', timestamps: false });

module.exports = AuditCycleAuditor;
