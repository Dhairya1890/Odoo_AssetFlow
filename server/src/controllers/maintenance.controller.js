const { MaintenanceRequest, Asset, User } = require('../models');
const notificationService = require('../services/notification.service');
const { ok, created, error } = require('../utils/response');
const { log } = require('../utils/activityLogger');

exports.listRequests = async (req, res) => {
  try {
    const { status, priority, assetId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assetId) where.assetId = assetId;

    const requests = await MaintenanceRequest.findAll({
      where,
      include: [
        { model: Asset, as: 'asset', attributes: ['id', 'assetTag', 'name'] },
        { model: User, as: 'raisedBy', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'technician', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return ok(res, 'Maintenance requests fetched', { requests });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.myRequests = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.findAll({
      where: { raisedById: req.user.id },
      include: [{ model: Asset, as: 'asset', attributes: ['id', 'assetTag', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    return ok(res, 'My maintenance requests fetched', { requests });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createRequest = async (req, res) => {
  try {
    const { assetId, issueDescription, priority } = req.body;
    if (!assetId || !issueDescription) return error(res, 'assetId and issueDescription are required', 400);
    const asset = await Asset.findByPk(assetId);
    if (!asset) return error(res, 'Asset not found', 404);
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const request = await MaintenanceRequest.create({ assetId, raisedById: req.user.id, priority, issueDescription, photoUrl });
    await log(req.user.id, 'MAINTENANCE_RAISED', 'MaintenanceRequest', request.id, { assetId });
    return created(res, 'Maintenance request raised', { request });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findByPk(req.params.id, { include: [{ model: Asset, as: 'asset' }] });
    if (!request) return error(res, 'Request not found', 404);
    if (request.status !== 'pending') return error(res, 'Only pending requests can be approved', 400);
    await request.update({ status: 'approved', approvedById: req.user.id });
    await request.asset.update({ status: 'under_maintenance' });
    await notificationService.notify(request.raisedById, 'maintenance_approved',
      `Your maintenance request for asset ${request.asset.assetTag} has been approved.`, { requestId: request.id });
    await log(req.user.id, 'MAINTENANCE_APPROVED', 'MaintenanceRequest', request.id, {});
    return ok(res, 'Maintenance request approved', { request });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    const request = await MaintenanceRequest.findByPk(req.params.id);
    if (!request) return error(res, 'Request not found', 404);
    if (request.status !== 'pending') return error(res, 'Only pending requests can be rejected', 400);
    await request.update({ status: 'rejected', approvedById: req.user.id, resolutionNotes });
    await notificationService.notify(request.raisedById, 'maintenance_rejected',
      `Your maintenance request has been rejected.`, { requestId: request.id });
    await log(req.user.id, 'MAINTENANCE_REJECTED', 'MaintenanceRequest', request.id, {});
    return ok(res, 'Maintenance request rejected', { request });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.assignTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;
    const request = await MaintenanceRequest.findByPk(req.params.id);
    if (!request) return error(res, 'Request not found', 404);
    if (request.status !== 'approved') return error(res, 'Request must be approved before assigning', 400);
    await request.update({ status: 'assigned', technicianId });
    return ok(res, 'Technician assigned', { request });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.setInProgress = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findByPk(req.params.id);
    if (!request) return error(res, 'Request not found', 404);
    if (request.status !== 'assigned') return error(res, 'Request must be assigned first', 400);
    await request.update({ status: 'in_progress' });
    return ok(res, 'Maintenance in progress', { request });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.resolveRequest = async (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    const request = await MaintenanceRequest.findByPk(req.params.id, { include: [{ model: Asset, as: 'asset' }] });
    if (!request) return error(res, 'Request not found', 404);
    if (!['in_progress', 'assigned'].includes(request.status))
      return error(res, 'Request must be in progress or assigned to resolve', 400);
    await request.update({ status: 'resolved', resolutionNotes });
    await request.asset.update({ status: 'available' });
    await notificationService.notify(request.raisedById, 'maintenance_approved',
      `Maintenance for asset ${request.asset.assetTag} has been resolved.`, { requestId: request.id });
    await log(req.user.id, 'MAINTENANCE_RESOLVED', 'MaintenanceRequest', request.id, {});
    return ok(res, 'Maintenance resolved', { request });
  } catch (err) {
    return error(res, err.message);
  }
};
