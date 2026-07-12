'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MaintenanceRequests', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      assetId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Assets', key: 'id' } },
      raisedById: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
      priority: { type: Sequelize.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'medium' },
      issueDescription: { type: Sequelize.TEXT, allowNull: false },
      photoUrl: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.ENUM('pending', 'approved', 'rejected', 'assigned', 'in_progress', 'resolved'), defaultValue: 'pending' },
      approvedById: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Users', key: 'id' } },
      technicianId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Users', key: 'id' } },
      resolutionNotes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('MaintenanceRequests'); },
};
