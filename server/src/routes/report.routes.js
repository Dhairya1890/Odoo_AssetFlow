const router = require('express').Router();
const ctrl = require('../controllers/report.controller');
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

router.use(auth);
router.get('/utilization', requireRole('admin', 'asset_manager', 'department_head'), ctrl.utilization);
router.get('/maintenance-frequency', requireRole('admin', 'asset_manager'), ctrl.maintenanceFrequency);
router.get('/department-summary', requireRole('admin', 'asset_manager', 'department_head'), ctrl.departmentSummary);
router.get('/booking-heatmap', requireRole('admin', 'asset_manager', 'department_head'), ctrl.bookingHeatmap);
router.get('/overdue-assets', requireRole('admin', 'asset_manager'), ctrl.overdueAssets);
router.get('/export', requireRole('admin', 'asset_manager'), ctrl.exportReport);

module.exports = router;
