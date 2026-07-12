const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TransferRequest = sequelize.define('TransferRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  assetId: { type: DataTypes.INTEGER, allowNull: false },
  fromUserId: { type: DataTypes.INTEGER, allowNull: true },
  toUserId: { type: DataTypes.INTEGER, allowNull: false },
  requestedById: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'allocated'),
    defaultValue: 'pending',
  },
  approvedById: { type: DataTypes.INTEGER, allowNull: true },
  expectedReturnDate: { type: DataTypes.DATE, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'TransferRequests', timestamps: true });

module.exports = TransferRequest;
