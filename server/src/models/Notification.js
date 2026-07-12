const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  type: {
    type: DataTypes.ENUM(
      'asset_assigned',
      'maintenance_approved',
      'maintenance_rejected',
      'booking_confirmed',
      'booking_cancelled',
      'booking_reminder',
      'transfer_approved',
      'transfer_rejected',
      'overdue_return',
      'audit_discrepancy'
    ),
    allowNull: false,
  },
  message: { type: DataTypes.TEXT, allowNull: false },
  metadata: { type: DataTypes.JSON, allowNull: true },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'Notifications', timestamps: true });

module.exports = Notification;
