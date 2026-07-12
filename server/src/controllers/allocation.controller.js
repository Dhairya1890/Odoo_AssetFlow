const { Op } = require('sequelize');
const {
  Allocation, Asset, User, Department, TransferRequest,
} = require('../models');
const { checkAllocationConflict } = require('../services/allocation.service');
const notificationService = require('../services/notification.service');
const { ok, created, error } = require('../utils/response');
const { log } = require('../utils/activityLogger');

// ── Allocations ────────────────────────────────────────────────

exports.listAllocations = async (req, res) => {
  try {
    const { status, userId, assetId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (assetId) where.assetId = assetId;

    // Department heads only see allocations for assets in their department
    const assetWhere = {};
    if (req.user.role === 'department_head') {
      if (!req.user.departmentId) return error(res, 'Your account has no department assigned', 403);
      assetWhere.departmentId = req.user.departmentId;
    }

    const allocations = await Allocation.findAll({
      where,
      include: [
        { model: Asset, as: 'asset', attributes: ['id', 'assetTag', 'name', 'departmentId'], where: Object.keys(assetWhere).length ? assetWhere : undefined },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'allocatedBy', attributes: ['id', 'name'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return ok(res, 'Allocations fetched', { allocations });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.myAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.findAll({
      where: { userId: req.user.id, status: ['active', 'overdue'] },
      include: [{ model: Asset, as: 'asset' }],
      order: [['createdAt', 'DESC']],
    });
    return ok(res, 'My allocations fetched', { allocations });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.allocateAsset = async (req, res) => {
  try {
    const { assetId, userId, departmentId, expectedReturnDate, notes } = req.body;
    if (!assetId || !userId) return error(res, 'assetId and userId are required', 400);

    const asset = await Asset.findByPk(assetId);
    if (!asset) return error(res, 'Asset not found', 404);

    // Business rule: conflict check
    const conflict = await checkAllocationConflict(assetId);
    if (conflict) return error(res, 'Asset is already allocated', 409, [conflict]);

    const allocation = await Allocation.create({
      assetId, userId, allocatedById: req.user.id,
      departmentId, expectedReturnDate, notes, status: 'active',
    });
    await asset.update({ status: 'allocated' });

    await notificationService.notify(
      userId, 'asset_assigned',
      `Asset ${asset.assetTag} (${asset.name}) has been allocated to you.`,
      { assetId, allocationId: allocation.id }
    );

    await log(req.user.id, 'ASSET_ALLOCATED', 'Allocation', allocation.id, { assetId, userId });
    return created(res, 'Asset allocated', { allocation });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.returnAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { conditionOnReturn, notes } = req.body;

    const allocation = await Allocation.findByPk(id, {
      include: [{ model: Asset, as: 'asset' }],
    });
    if (!allocation) return error(res, 'Allocation not found', 404);
    
    // Ensure employees can only return their own assets
    if (req.user.role === 'employee' && allocation.userId !== req.user.id) {
      return error(res, 'Forbidden', 403);
    }
    
    if (allocation.status === 'returned') return error(res, 'Already returned', 400);

    await allocation.update({
      status: 'returned',
      actualReturnDate: new Date(),
      conditionOnReturn,
      notes,
    });
    await allocation.asset.update({ status: 'available' });

    await log(req.user.id, 'ASSET_RETURNED', 'Allocation', allocation.id, { assetId: allocation.assetId });
    return ok(res, 'Asset returned', { allocation });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.overdueAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.findAll({
      where: { status: 'overdue' },
      include: [
        { model: Asset, as: 'asset', attributes: ['id', 'assetTag', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['expectedReturnDate', 'ASC']],
    });
    return ok(res, 'Overdue allocations fetched', { allocations });
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Transfer Requests ──────────────────────────────────────────

exports.raiseTransfer = async (req, res) => {
  try {
    const { assetId, toUserId, notes } = req.body;
    if (!assetId || !toUserId) return error(res, 'assetId and toUserId are required', 400);

    const asset = await Asset.findByPk(assetId);
    if (!asset) return error(res, 'Asset not found', 404);

    const activeAllocation = await Allocation.findOne({
      where: { assetId, status: ['active', 'overdue'] },
    });
    const fromUserId = activeAllocation ? activeAllocation.userId : null;

    let initialStatus = 'pending';
    if (['admin', 'asset_manager', 'department_head'].includes(req.user.role)) {
      initialStatus = 'approved';
    }

    const transfer = await TransferRequest.create({
      assetId,
      fromUserId,
      toUserId,
      requestedById: req.user.id,
      notes,
      status: initialStatus,
      approvedById: initialStatus === 'approved' ? req.user.id : null,
    });

    await log(req.user.id, 'TRANSFER_REQUESTED', 'TransferRequest', transfer.id, { assetId, toUserId });
    return created(res, 'Transfer request raised', { transfer });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.listTransfers = async (req, res) => {
  try {
    // Department heads only see transfers for their department's assets
    const assetWhere = {};
    if (req.user.role === 'department_head') {
      if (!req.user.departmentId) return error(res, 'Your account has no department assigned', 403);
      assetWhere.departmentId = req.user.departmentId;
    }

    const transfers = await TransferRequest.findAll({
      include: [
        { model: Asset, as: 'asset', attributes: ['id', 'assetTag', 'name', 'departmentId'], where: Object.keys(assetWhere).length ? assetWhere : undefined },
        { model: User, as: 'fromUser', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'toUser', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'requestedBy', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return ok(res, 'Transfer requests fetched', { transfers });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.approveTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const transfer = await TransferRequest.findByPk(id, {
      include: [{ model: Asset, as: 'asset', attributes: ['id', 'departmentId'] }],
    });
    if (!transfer) return error(res, 'Transfer not found', 404);
    if (transfer.status !== 'pending') return error(res, 'Transfer already processed', 400);

    // Dept head can only approve transfers for assets in their department
    if (req.user.role === 'department_head') {
      if (!req.user.departmentId || transfer.asset?.departmentId !== req.user.departmentId) {
        return error(res, 'Forbidden: asset does not belong to your department', 403);
      }
    }

    await transfer.update({ status: 'approved', approvedById: req.user.id });

    await notificationService.notify(transfer.requestedById, 'transfer_approved',
      `Your asset request has been approved.`, { transferId: transfer.id });

    await log(req.user.id, 'TRANSFER_APPROVED', 'TransferRequest', transfer.id, { assetId: transfer.assetId });
    return ok(res, 'Transfer approved', { transfer });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.allocateTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const transfer = await TransferRequest.findByPk(id);
    if (!transfer) return error(res, 'Transfer not found', 404);
    if (transfer.status !== 'approved') return error(res, 'Transfer must be approved before allocation', 400);

    // Only Admin or Asset Manager can allocate
    if (!['admin', 'asset_manager'].includes(req.user.role)) {
      return error(res, 'Forbidden. Only Asset Managers can allocate.', 403);
    }

    // Re-allocate: mark old allocation returned, create new one
    await Allocation.update(
      { status: 'returned', actualReturnDate: new Date() },
      { where: { assetId: transfer.assetId, status: ['active', 'overdue', 'transfer_requested'] } }
    );

    const newAllocation = await Allocation.create({
      assetId: transfer.assetId,
      userId: transfer.toUserId,
      allocatedById: req.user.id,
      status: 'active',
    });
    await Asset.update({ status: 'allocated' }, { where: { id: transfer.assetId } });

    await transfer.update({ status: 'allocated' });

    if (transfer.fromUserId) {
      await notificationService.notify(transfer.fromUserId, 'transfer_approved',
        `Your asset has been transferred.`, { transferId: transfer.id });
    }
    await notificationService.notify(transfer.toUserId, 'asset_assigned',
      `Asset ID ${transfer.assetId} has been allocated to you.`, { transferId: transfer.id });

    await log(req.user.id, 'TRANSFER_ALLOCATED', 'TransferRequest', transfer.id, { assetId: transfer.assetId });
    return ok(res, 'Transfer allocated', { transfer, newAllocation });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.rejectTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const transfer = await TransferRequest.findByPk(id, {
      include: [{ model: Asset, as: 'asset', attributes: ['id', 'departmentId'] }],
    });
    if (!transfer) return error(res, 'Transfer not found', 404);
    if (transfer.status !== 'pending') return error(res, 'Transfer already processed', 400);

    // Dept head can only reject transfers for assets in their department
    if (req.user.role === 'department_head') {
      if (!req.user.departmentId || transfer.asset?.departmentId !== req.user.departmentId) {
        return error(res, 'Forbidden: asset does not belong to your department', 403);
      }
    }

    await transfer.update({ status: 'rejected', approvedById: req.user.id });

    await notificationService.notify(transfer.requestedById, 'transfer_rejected',
      `Your transfer request for asset ID ${transfer.assetId} was rejected.`,
      { transferId: transfer.id }
    );

    await log(req.user.id, 'TRANSFER_REJECTED', 'TransferRequest', transfer.id, {});
    return ok(res, 'Transfer rejected', { transfer });
  } catch (err) {
    return error(res, err.message);
  }
};
