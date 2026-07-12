const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  assetId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  startTime: { type: DataTypes.DATE, allowNull: false },
  endTime: { type: DataTypes.DATE, allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'ongoing', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'Bookings', timestamps: true });

module.exports = Booking;
