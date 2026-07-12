const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Asset = sequelize.define('Asset', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  assetTag: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  categoryId: { type: DataTypes.INTEGER, allowNull: false },
  serialNumber: { type: DataTypes.STRING, allowNull: true },
  acquisitionDate: { type: DataTypes.DATEONLY, allowNull: true },
  acquisitionCost: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  condition: {
    type: DataTypes.ENUM('new', 'good', 'fair', 'poor'),
    defaultValue: 'good',
  },
  location: { type: DataTypes.STRING, allowNull: true },
  status: {
    type: DataTypes.ENUM('available', 'allocated', 'reserved', 'under_maintenance', 'lost', 'retired', 'disposed', 'missing', 'damaged'),
    defaultValue: 'available',
  },
  isBookable: { type: DataTypes.BOOLEAN, defaultValue: false },
  photoUrl: { type: DataTypes.STRING, allowNull: true },
  documentUrl: { type: DataTypes.STRING, allowNull: true },
  departmentId: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'Assets', timestamps: true });

module.exports = Asset;
