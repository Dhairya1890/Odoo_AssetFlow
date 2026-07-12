const router = require('express').Router();
const ctrl = require('../controllers/audit.controller');
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

router.use(auth);
router.get('/', requireRole('admin', 'asset_manager'), ctrl.listCycles);
router.post('/', requireRole('admin'), ctrl.createCycle);
router.get('/:id/report', requireRole('admin', 'asset_manager'), ctrl.getReport);
router.patch('/:id/close', requireRole('admin'), ctrl.closeCycle);
router.get('/:id', ctrl.getCycle);
router.patch('/:id/items/:itemId', ctrl.markItem);

module.exports = router;
