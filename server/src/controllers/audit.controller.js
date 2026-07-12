const { AuditCycle, AuditItem, AuditCycleAuditor, Asset, User } = require('../models');
const { Op } = require('sequelize');
const { ok, created, error } = require('../utils/response');
const { log } = require('../utils/activityLogger');

exports.listCycles = async (req, res) => {
  try {
    const cycles = await AuditCycle.findAll({
      include: [{ model: User, as: 'createdBy', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    return ok(res, 'Audit cycles fetched', { cycles });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createCycle = async (req, res) => {
  try {
    const { name, scope, scopeValue, startDate, endDate, auditorIds } = req.body;
    if (!name || !scope || !scopeValue || !startDate || !endDate)
      return error(res, 'name, scope, scopeValue, startDate, endDate are required', 400);

    const cycle = await AuditCycle.create({ name, scope, scopeValue, startDate, endDate, createdById: req.user.id });

    // Assign auditors
    if (auditorIds && auditorIds.length > 0) {
      await AuditCycleAuditor.bulkCreate(auditorIds.map(uid => ({ auditCycleId: cycle.id, userId: uid })));
    }

    // Auto-generate AuditItems for assets in scope
    let assetWhere = {};
    if (scope === 'department') assetWhere.departmentId = scopeValue;
    else if (scope === 'location') assetWhere.location = scopeValue;

    const assets = await Asset.findAll({ where: assetWhere, attributes: ['id'] });
    const defaultAuditorId = (auditorIds && auditorIds[0]) || req.user.id;
    const items = assets.map(a => ({ auditCycleId: cycle.id, assetId: a.id, auditorId: defaultAuditorId }));
    if (items.length > 0) await AuditItem.bulkCreate(items);

    await log(req.user.id, 'AUDIT_CREATED', 'AuditCycle', cycle.id, { name, scope });
    return created(res, 'Audit cycle created', { cycle, itemsCreated: items.length });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getCycle = async (req, res) => {
  try {
    const cycle = await AuditCycle.findByPk(req.params.id, {
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'name'] },
        { model: User, as: 'auditors', attributes: ['id', 'name', 'email'] },
        {
          model: AuditItem, as: 'items',
          include: [
            { model: Asset, as: 'asset', attributes: ['id', 'assetTag', 'name'] },
            { model: User, as: 'auditor', attributes: ['id', 'name'] },
          ],
        },
      ],
    });
    if (!cycle) return error(res, 'Audit cycle not found', 404);
    return ok(res, 'Audit cycle fetched', { cycle });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.markItem = async (req, res) => {
  try {
    const { id: cycleId, itemId } = req.params;
    const { status, notes } = req.body;

    const cycle = await AuditCycle.findByPk(cycleId);
    if (!cycle) return error(res, 'Cycle not found', 404);
    if (cycle.status === 'closed') return error(res, 'Cannot modify a closed audit cycle', 403);

    const item = await AuditItem.findOne({ where: { id: itemId, auditCycleId: cycleId } });
    if (!item) return error(res, 'Audit item not found', 404);

    await item.update({ status, notes });
    return ok(res, 'Audit item updated', { item });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getReport = async (req, res) => {
  try {
    const items = await AuditItem.findAll({
      where: { auditCycleId: req.params.id, status: { [Op.ne]: 'pending' } },
      include: [{ model: Asset, as: 'asset', attributes: ['id', 'assetTag', 'name'] }],
    });

    const grouped = items.reduce((acc, item) => {
      if (!acc[item.status]) acc[item.status] = [];
      acc[item.status].push(item);
      return acc;
    }, {});

    return ok(res, 'Audit report generated', { report: grouped });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.closeCycle = async (req, res) => {
  try {
    const cycle = await AuditCycle.findByPk(req.params.id, {
      include: [{ model: AuditItem, as: 'items', include: [{ model: Asset, as: 'asset' }] }],
    });
    if (!cycle) return error(res, 'Audit cycle not found', 404);
    if (cycle.status === 'closed') return error(res, 'Cycle already closed', 400);

    await cycle.update({ status: 'closed' });

    // Update missing items → asset status 'lost'
    const missingItems = cycle.items.filter(i => i.status === 'missing');
    for (const item of missingItems) {
      if (item.asset) await item.asset.update({ status: 'lost' });
    }

    await log(req.user.id, 'AUDIT_CLOSED', 'AuditCycle', cycle.id, { missingCount: missingItems.length });
    return ok(res, 'Audit cycle closed', { cycle, missingAssetsUpdated: missingItems.length });
  } catch (err) {
    return error(res, err.message);
  }
};
