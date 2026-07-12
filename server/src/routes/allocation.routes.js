const router = require('express').Router();
const ctrl = require('../controllers/allocation.controller');
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

router.use(auth);

// Transfer sub-routes (before /:id to avoid conflicts)
router.post('/transfer', requireRole('employee', 'department_head', 'asset_manager', 'admin'), ctrl.raiseTransfer);
router.get('/transfers', requireRole('asset_manager', 'department_head', 'admin'), ctrl.listTransfers);
router.patch('/transfers/:id/approve', requireRole('asset_manager', 'department_head', 'admin'), ctrl.approveTransfer);
router.patch('/transfers/:id/reject', requireRole('asset_manager', 'department_head', 'admin'), ctrl.rejectTransfer);

// Allocation routes
router.get('/overdue', requireRole('asset_manager', 'admin'), ctrl.overdueAllocations);
router.get('/my', ctrl.myAllocations);
router.get('/', requireRole('asset_manager', 'admin'), ctrl.listAllocations);
router.post('/', requireRole('asset_manager', 'admin'), ctrl.allocateAsset);
router.post('/:id/return', ctrl.returnAsset);

module.exports = router;
