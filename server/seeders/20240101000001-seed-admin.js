'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    const now = new Date();
    await queryInterface.bulkInsert('Users', [{
      name: 'System Admin',
      email: 'admin@assetflow.com',
      passwordHash,
      role: 'admin',
      departmentId: null,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }], {});
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('Users', { email: 'admin@assetflow.com' }, {});
  },
};
