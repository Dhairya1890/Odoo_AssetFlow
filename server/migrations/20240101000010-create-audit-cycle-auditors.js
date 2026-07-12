'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AuditCycleAuditors', {
      auditCycleId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'AuditCycles', key: 'id' }, onDelete: 'CASCADE' },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('AuditCycleAuditors'); },
};
