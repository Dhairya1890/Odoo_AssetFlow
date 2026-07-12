'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TransferRequests', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      assetId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Assets', key: 'id' } },
      fromUserId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
      toUserId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
      requestedById: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
      status: { type: Sequelize.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
      approvedById: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Users', key: 'id' } },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('TransferRequests'); },
};
