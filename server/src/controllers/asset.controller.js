const QRCode = require('qrcode');
const { Op } = require('sequelize');
const { Asset, AssetCategory, Department, Allocation, MaintenanceRequest, User } = require('../models');
const { generateAssetTag } = require('../services/assetTag.service');
const { ok, created, error } = require('../utils/response');
const { log } = require('../utils/activityLogger');
const path = require('path');

exports.listAssets = async (req, res) => {
  try {
    const { status, categoryId, departmentId, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (departmentId) where.departmentId = departmentId;
    if (search) {
      where[Op.or] = [
        { assetTag: { [Op.like]: `%${search}%` } },
        { serialNumber: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
      ];
    }

    const assets = await Asset.findAll({
      where,
      include: [
        { model: AssetCategory, as: 'category', attributes: ['id', 'name'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
      ],
      order: [['id', 'DESC']],
    });

    return ok(res, 'Assets fetched', { assets });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getAsset = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        { model: AssetCategory, as: 'category' },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        {
          model: Allocation,
          as: 'allocations',
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
            { model: User, as: 'allocatedBy', attributes: ['id', 'name'] },
          ],
          order: [['createdAt', 'DESC']],
        },
        {
          model: MaintenanceRequest,
          as: 'maintenanceRequests',
          include: [{ model: User, as: 'raisedBy', attributes: ['id', 'name'] }],
          order: [['createdAt', 'DESC']],
        },
      ],
    });
    if (!asset) return error(res, 'Asset not found', 404);
    return ok(res, 'Asset fetched', { asset });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createAsset = async (req, res) => {
  try {
    const {
      name, categoryId, serialNumber, acquisitionDate, acquisitionCost,
      condition, location, status, isBookable, departmentId,
    } = req.body;

    if (!name || !categoryId) return error(res, 'Name and categoryId are required', 400);

    const assetTag = await generateAssetTag();
    const photoUrl = req.files?.photo ? `/uploads/${req.files.photo[0].filename}` : null;
    const documentUrl = req.files?.document ? `/uploads/${req.files.document[0].filename}` : null;

    const asset = await Asset.create({
      assetTag, name, categoryId, serialNumber, acquisitionDate,
      acquisitionCost, condition, location, status, isBookable,
      photoUrl, documentUrl, departmentId,
    });

    await log(req.user.id, 'ASSET_REGISTERED', 'Asset', asset.id, { assetTag, name });
    return created(res, 'Asset registered', { asset });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return error(res, 'Asset not found', 404);

    const photoUrl = req.files?.photo ? `/uploads/${req.files.photo[0].filename}` : undefined;
    const documentUrl = req.files?.document ? `/uploads/${req.files.document[0].filename}` : undefined;

    const updates = { ...req.body };
    if (photoUrl) updates.photoUrl = photoUrl;
    if (documentUrl) updates.documentUrl = documentUrl;
    delete updates.assetTag; // Never allow manual tag change

    await asset.update(updates);
    return ok(res, 'Asset updated', { asset });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateAssetStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'allocated', 'reserved', 'under_maintenance', 'lost', 'retired', 'disposed'];
    if (!validStatuses.includes(status)) return error(res, 'Invalid status', 400);

    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return error(res, 'Asset not found', 404);

    await asset.update({ status });
    await log(req.user.id, 'ASSET_STATUS_CHANGED', 'Asset', asset.id, { status });
    return ok(res, 'Asset status updated', { asset });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getQRCode = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, { attributes: ['id', 'assetTag', 'name'] });
    if (!asset) return error(res, 'Asset not found', 404);

    const qrData = JSON.stringify({ id: asset.id, tag: asset.assetTag, name: asset.name });
    const buffer = await QRCode.toBuffer(qrData, { type: 'png', width: 300 });

    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    return error(res, err.message);
  }
};
