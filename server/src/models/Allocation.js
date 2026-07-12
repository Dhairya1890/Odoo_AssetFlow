const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Allocation = sequelize.define('Allocation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  assetId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  allocatedById: { type: DataTypes.INTEGER, allowNull: false },
  departmentId: { type: DataTypes.INTEGER, allowNull: true },
  expectedReturnDate: { type: DataTypes.DATEONLY, allowNull: true },
  actualReturnDate: { type: DataTypes.DATEONLY, allowNull: true },
  status: {
    type: DataTypes.ENUM('active', 'returned', 'overdue', 'transfer_requested'),
    defaultValue: 'active',
  },
  conditionOnReturn: { type: DataTypes.STRING, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'Allocations', timestamps: true });

module.exports = Allocation;
