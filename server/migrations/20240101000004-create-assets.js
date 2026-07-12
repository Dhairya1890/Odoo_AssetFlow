'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Assets', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      assetTag: { type: Sequelize.STRING, allowNull: false, unique: true },
      name: { type: Sequelize.STRING, allowNull: false },
      categoryId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'AssetCategories', key: 'id' } },
      serialNumber: { type: Sequelize.STRING, allowNull: true },
      acquisitionDate: { type: Sequelize.DATEONLY, allowNull: true },
      acquisitionCost: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      condition: { type: Sequelize.ENUM('new', 'good', 'fair', 'poor'), defaultValue: 'good' },
      location: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.ENUM('available', 'allocated', 'reserved', 'under_maintenance', 'lost', 'retired', 'disposed'), defaultValue: 'available' },
      isBookable: { type: Sequelize.BOOLEAN, defaultValue: false },
      photoUrl: { type: Sequelize.STRING, allowNull: true },
      documentUrl: { type: Sequelize.STRING, allowNull: true },
      departmentId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Departments', key: 'id' }, onDelete: 'SET NULL' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('Assets'); },
};
