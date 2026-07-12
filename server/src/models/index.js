const sequelize = require('../config/db');

const Department = require('./Department');
const User = require('./User');
const AssetCategory = require('./AssetCategory');
const Asset = require('./Asset');
const Allocation = require('./Allocation');
const TransferRequest = require('./TransferRequest');
const Booking = require('./Booking');
const MaintenanceRequest = require('./MaintenanceRequest');
const AuditCycle = require('./AuditCycle');
const AuditItem = require('./AuditItem');
const AuditCycleAuditor = require('./AuditCycleAuditor');
const Notification = require('./Notification');
const ActivityLog = require('./ActivityLog');

// ── Department self-reference ──────────────────────────────────
Department.belongsTo(Department, { as: 'parent', foreignKey: 'parentId' });
Department.hasMany(Department, { as: 'children', foreignKey: 'parentId' });

// ── Department ↔ User (head) ───────────────────────────────────
Department.belongsTo(User, { as: 'head', foreignKey: 'headId' });
User.hasMany(Department, { as: 'ledDepartments', foreignKey: 'headId' });

// ── User ↔ Department (membership) ────────────────────────────
User.belongsTo(Department, { as: 'department', foreignKey: 'departmentId' });
Department.hasMany(User, { as: 'members', foreignKey: 'departmentId' });

// ── Asset ↔ AssetCategory ──────────────────────────────────────
Asset.belongsTo(AssetCategory, { as: 'category', foreignKey: 'categoryId' });
AssetCategory.hasMany(Asset, { as: 'assets', foreignKey: 'categoryId' });

// ── Asset ↔ Department (owning) ───────────────────────────────
Asset.belongsTo(Department, { as: 'department', foreignKey: 'departmentId' });
Department.hasMany(Asset, { as: 'assets', foreignKey: 'departmentId' });

// ── Allocation ─────────────────────────────────────────────────
Allocation.belongsTo(Asset, { as: 'asset', foreignKey: 'assetId' });
Asset.hasMany(Allocation, { as: 'allocations', foreignKey: 'assetId' });

Allocation.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(Allocation, { as: 'allocations', foreignKey: 'userId' });

Allocation.belongsTo(User, { as: 'allocatedBy', foreignKey: 'allocatedById' });
Allocation.belongsTo(Department, { as: 'department', foreignKey: 'departmentId' });

// ── TransferRequest ────────────────────────────────────────────
TransferRequest.belongsTo(Asset, { as: 'asset', foreignKey: 'assetId' });
Asset.hasMany(TransferRequest, { as: 'transferRequests', foreignKey: 'assetId' });

TransferRequest.belongsTo(User, { as: 'fromUser', foreignKey: 'fromUserId' });
TransferRequest.belongsTo(User, { as: 'toUser', foreignKey: 'toUserId' });
TransferRequest.belongsTo(User, { as: 'requestedBy', foreignKey: 'requestedById' });
TransferRequest.belongsTo(User, { as: 'approvedBy', foreignKey: 'approvedById' });

// ── Booking ────────────────────────────────────────────────────
Booking.belongsTo(Asset, { as: 'asset', foreignKey: 'assetId' });
Asset.hasMany(Booking, { as: 'bookings', foreignKey: 'assetId' });

Booking.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(Booking, { as: 'bookings', foreignKey: 'userId' });

// ── MaintenanceRequest ─────────────────────────────────────────
MaintenanceRequest.belongsTo(Asset, { as: 'asset', foreignKey: 'assetId' });
Asset.hasMany(MaintenanceRequest, { as: 'maintenanceRequests', foreignKey: 'assetId' });

MaintenanceRequest.belongsTo(User, { as: 'raisedBy', foreignKey: 'raisedById' });
MaintenanceRequest.belongsTo(User, { as: 'approvedBy', foreignKey: 'approvedById' });
MaintenanceRequest.belongsTo(User, { as: 'technician', foreignKey: 'technicianId' });

// ── AuditCycle ─────────────────────────────────────────────────
AuditCycle.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });
AuditCycle.belongsToMany(User, { through: AuditCycleAuditor, as: 'auditors', foreignKey: 'auditCycleId' });
User.belongsToMany(AuditCycle, { through: AuditCycleAuditor, as: 'auditCycles', foreignKey: 'userId' });

// ── AuditItem ──────────────────────────────────────────────────
AuditItem.belongsTo(AuditCycle, { as: 'auditCycle', foreignKey: 'auditCycleId' });
AuditCycle.hasMany(AuditItem, { as: 'items', foreignKey: 'auditCycleId' });

AuditItem.belongsTo(Asset, { as: 'asset', foreignKey: 'assetId' });
Asset.hasMany(AuditItem, { as: 'auditItems', foreignKey: 'assetId' });

AuditItem.belongsTo(User, { as: 'auditor', foreignKey: 'auditorId' });

// ── Notification ───────────────────────────────────────────────
Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(Notification, { as: 'notifications', foreignKey: 'userId' });

// ── ActivityLog ────────────────────────────────────────────────
ActivityLog.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(ActivityLog, { as: 'activityLogs', foreignKey: 'userId' });

module.exports = {
  sequelize,
  Department,
  User,
  AssetCategory,
  Asset,
  Allocation,
  TransferRequest,
  Booking,
  MaintenanceRequest,
  AuditCycle,
  AuditItem,
  AuditCycleAuditor,
  Notification,
  ActivityLog,
};
