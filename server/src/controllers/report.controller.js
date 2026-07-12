const { sequelize, Asset, Allocation, MaintenanceRequest, Department, AssetCategory, Booking } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const { ok, error } = require('../utils/response');

exports.utilization = async (req, res) => {
  try {
    const rows = await Asset.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('Asset.id')), 'count'],
      ],
      include: [{ model: AssetCategory, as: 'category', attributes: ['id', 'name'] }],
      group: ['status', 'category.id', 'category.name'],
      raw: true,
    });
    return ok(res, 'Utilization report', { rows });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.maintenanceFrequency = async (req, res) => {
  try {
    const rows = await MaintenanceRequest.findAll({
      attributes: [
        'assetId',
        [sequelize.fn('COUNT', sequelize.col('MaintenanceRequest.id')), 'count'],
      ],
      include: [{ model: Asset, as: 'asset', attributes: ['id', 'assetTag', 'name'] }],
      group: ['assetId', 'asset.id'],
      order: [[sequelize.literal('count'), 'DESC']],
      raw: false,
    });
    return ok(res, 'Maintenance frequency report', { rows });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.departmentSummary = async (req, res) => {
  try {
    const rows = await Asset.findAll({
      attributes: [
        'departmentId',
        'status',
        [sequelize.fn('COUNT', sequelize.col('Asset.id')), 'count'],
      ],
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
      group: ['departmentId', 'status', 'department.id', 'department.name'],
      raw: false,
    });
    return ok(res, 'Department summary report', { rows });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.bookingHeatmap = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { status: { [Op.ne]: 'cancelled' } },
      attributes: ['startTime'],
      raw: true,
    });

    const heatmap = {};
    for (const b of bookings) {
      const d = new Date(b.startTime);
      const day = d.getDay();   // 0=Sun..6=Sat
      const hour = d.getHours();
      const key = `${day}_${hour}`;
      heatmap[key] = (heatmap[key] || 0) + 1;
    }
    return ok(res, 'Booking heatmap', { heatmap });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.overdueAssets = async (req, res) => {
  try {
    const allocations = await Allocation.findAll({
      where: {
        status: { [Op.in]: ['active', 'overdue'] },
        expectedReturnDate: { [Op.lt]: new Date() },
      },
      include: [
        { model: Asset, as: 'asset', attributes: ['id', 'assetTag', 'name'] },
      ],
      order: [['expectedReturnDate', 'ASC']],
    });
    return ok(res, 'Overdue assets report', { allocations });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.exportReport = async (req, res) => {
  try {
    const { type } = req.query;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');

    if (type === 'utilization') {
      const rows = await Asset.findAll({ attributes: ['assetTag', 'name', 'status'], raw: true });
      sheet.columns = [
        { header: 'Asset Tag', key: 'assetTag', width: 15 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Status', key: 'status', width: 20 },
      ];
      sheet.addRows(rows);
    } else if (type === 'department-summary') {
      const rows = await Asset.findAll({
        attributes: ['assetTag', 'name', 'status', 'departmentId'],
        include: [{ model: Department, as: 'department', attributes: ['name'] }],
        raw: true,
      });
      sheet.columns = [
        { header: 'Asset Tag', key: 'assetTag', width: 15 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Status', key: 'status', width: 20 },
        { header: 'Department', key: 'department.name', width: 25 },
      ];
      sheet.addRows(rows.map(r => ({ ...r, 'department.name': r['department.name'] })));
    } else {
      return error(res, 'Invalid export type. Use: utilization | department-summary', 400);
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-report.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    return error(res, err.message);
  }
};
