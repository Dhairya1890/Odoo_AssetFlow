'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      type: {
        type: Sequelize.ENUM(
          'asset_assigned', 'maintenance_approved', 'maintenance_rejected',
          'booking_confirmed', 'booking_cancelled', 'booking_reminder',
          'transfer_approved', 'transfer_rejected', 'overdue_return', 'audit_discrepancy'
        ),
        allowNull: false,
      },
      message: { type: Sequelize.TEXT, allowNull: false },
      metadata: { type: Sequelize.JSON, allowNull: true },
      isRead: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('Notifications'); },
};
