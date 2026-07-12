'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      passwordHash: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.ENUM('admin', 'asset_manager', 'department_head', 'employee'), defaultValue: 'employee' },
      departmentId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Departments', key: 'id' }, onDelete: 'SET NULL' },
      status: { type: Sequelize.ENUM('active', 'inactive'), defaultValue: 'active' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
    // Add headId FK after Users exists
    await queryInterface.addConstraint('Departments', {
      fields: ['headId'],
      type: 'foreign key',
      name: 'fk_departments_headId',
      references: { table: 'Users', field: 'id' },
      onDelete: 'SET NULL',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('Departments', 'fk_departments_headId');
    await queryInterface.dropTable('Users');
  },
};
