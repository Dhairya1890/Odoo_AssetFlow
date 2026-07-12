const { sequelize, User, Department, AssetCategory, Asset, Allocation, MaintenanceRequest, Booking, ActivityLog } = require('../src/models');
const bcrypt = require('bcryptjs');

const run = async () => {
  try {
    console.log('Syncing database & truncating...');
    
    // Grab existing categories and departments
    let dept = await Department.findOne();
    let cat = await AssetCategory.findOne();

    if (!dept || !cat) {
      console.log('Running teammate seeder first for depts and cats...');
      await Department.bulkCreate([
        { name: 'Engineering' }, { name: 'HR' }, { name: 'Sales' }
      ]);
      await AssetCategory.bulkCreate([
        { name: 'Electronics' }, { name: 'Furniture' }, { name: 'Vehicles' }
      ]);
      dept = await Department.findOne();
      cat = await AssetCategory.findOne();
    }

    console.log('Creating users...');
    const hash = await bcrypt.hash('Password@123', 10);
    const users = await User.bulkCreate([
      { name: 'John Doe', email: 'john@assetflow.com', passwordHash: hash, role: 'employee', departmentId: dept.id },
      { name: 'Jane Smith', email: 'jane@assetflow.com', passwordHash: hash, role: 'asset_manager', departmentId: dept.id },
      { name: 'Mark Wilson', email: 'mark@assetflow.com', passwordHash: hash, role: 'department_head', departmentId: dept.id }
    ]);
    const emp = users[0];

    console.log('Creating assets...');
    const assets = [];
    for (let i = 1; i <= 30; i++) {
      let status = 'available';
      if (i <= 10) status = 'allocated';
      if (i > 10 && i <= 15) status = 'under_maintenance';

      assets.push({
        assetTag: `AST-100${i}`,
        name: i <= 15 ? `MacBook Pro 16" - ${i}` : (i <= 25 ? `Ergonomic Chair - ${i}` : `Company Car - ${i}`),
        categoryId: cat.id,
        departmentId: i % 2 === 0 ? dept.id : null,
        status: status,
        condition: i % 5 === 0 ? 'fair' : 'good',
        location: 'HQ Building A',
        isBookable: i > 25
      });
    }
    const createdAssets = await Asset.bulkCreate(assets);

    console.log('Creating allocations...');
    const allocations = [];
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const asset = createdAssets[i];
      const overdue = i < 3; // First 3 are overdue
      
      const expected = new Date();
      if (overdue) expected.setDate(today.getDate() - 5);
      else expected.setDate(today.getDate() + 10);

      allocations.push({
        assetId: asset.id,
        userId: emp.id,
        allocatedById: users[1].id,
        status: overdue ? 'overdue' : 'active',
        expectedReturnDate: expected
      });
    }
    await Allocation.bulkCreate(allocations);

    console.log('Creating maintenance...');
    const maintenance = [];
    for (let i = 10; i < 15; i++) {
      const asset = createdAssets[i];
      maintenance.push({
        assetId: asset.id,
        raisedById: emp.id,
        priority: 'high',
        issueDescription: 'Screen flickering issue',
        status: i % 2 === 0 ? 'in_progress' : 'pending'
      });
    }
    await MaintenanceRequest.bulkCreate(maintenance);

    console.log('Creating bookings...');
    const bookings = [];
    for (let i = 25; i < 28; i++) {
      const asset = createdAssets[i];
      const start = new Date();
      start.setHours(start.getHours() + 1); // Starts in 1 hour
      const end = new Date();
      end.setHours(end.getHours() + 3);

      bookings.push({
        assetId: asset.id,
        userId: emp.id,
        startTime: start,
        endTime: end,
        status: 'upcoming'
      });
    }
    await Booking.bulkCreate(bookings);

    console.log('Creating activity logs...');
    await ActivityLog.bulkCreate([
      { userId: users[1].id, action: 'ASSET_REGISTERED', entityType: 'Asset', entityId: 1, metadata: {} },
      { userId: users[1].id, action: 'ASSET_ALLOCATED', entityType: 'Allocation', entityId: 1, metadata: {} },
      { userId: emp.id, action: 'MAINTENANCE_RAISED', entityType: 'MaintenanceRequest', entityId: 1, metadata: {} }
    ]);

    console.log('✅ Mock data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

run();
