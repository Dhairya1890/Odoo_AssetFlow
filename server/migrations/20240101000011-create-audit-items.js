'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AuditItems', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      auditCycleId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'AuditCycles', key: 'id' }, onDelete: 'CASCADE' },
      assetId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Assets', key: 'id' } },
      auditorId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
      status: { type: Sequelize.ENUM('pending', 'verified', 'missing', 'damaged'), defaultValue: 'pending' },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('AuditItems'); },
};
