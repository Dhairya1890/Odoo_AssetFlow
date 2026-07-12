'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Allocations', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      assetId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Assets', key: 'id' } },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
      allocatedById: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
      departmentId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Departments', key: 'id' }, onDelete: 'SET NULL' },
      expectedReturnDate: { type: Sequelize.DATEONLY, allowNull: true },
      actualReturnDate: { type: Sequelize.DATEONLY, allowNull: true },
      status: { type: Sequelize.ENUM('active', 'returned', 'overdue', 'transfer_requested'), defaultValue: 'active' },
      conditionOnReturn: { type: Sequelize.STRING, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('Allocations'); },
};
