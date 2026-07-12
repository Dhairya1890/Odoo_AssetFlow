const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  assetId: { type: DataTypes.INTEGER, allowNull: false },
  raisedById: { type: DataTypes.INTEGER, allowNull: false },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  issueDescription: { type: DataTypes.TEXT, allowNull: false },
  photoUrl: { type: DataTypes.STRING, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'assigned', 'in_progress', 'resolved'),
    defaultValue: 'pending',
  },
  approvedById: { type: DataTypes.INTEGER, allowNull: true },
  technicianId: { type: DataTypes.INTEGER, allowNull: true },
  resolutionNotes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'MaintenanceRequests', timestamps: true });

module.exports = MaintenanceRequest;
