'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Departments', [
      { name: 'Engineering', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Human Resources', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sales', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Marketing', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Operations', createdAt: new Date(), updatedAt: new Date() }
    ], {});

    await queryInterface.bulkInsert('AssetCategories', [
      { name: 'Hardware', customFields: JSON.stringify([{name: 'Model', type: 'text'}]), createdAt: new Date(), updatedAt: new Date() },
      { name: 'Software', customFields: JSON.stringify([{name: 'License Key', type: 'text'}]), createdAt: new Date(), updatedAt: new Date() },
      { name: 'Furniture', customFields: JSON.stringify([]), createdAt: new Date(), updatedAt: new Date() },
      { name: 'Vehicles', customFields: JSON.stringify([]), createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('AssetCategories', null, {});
    await queryInterface.bulkDelete('Departments', null, {});
  }
};
