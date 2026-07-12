const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AssetCategory = sequelize.define('AssetCategory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  customFields: { type: DataTypes.JSON, allowNull: true },
}, { tableName: 'AssetCategories', timestamps: true });

module.exports = AssetCategory;
