const router = require('express').Router();
const ctrl = require('../controllers/maintenance.controller');
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

router.use(auth);
router.get('/my', ctrl.myRequests);
router.get('/', requireRole('asset_manager', 'admin'), ctrl.listRequests);
router.post('/', requireRole('employee', 'department_head', 'asset_manager', 'admin'), upload.single('photo'), ctrl.createRequest);
router.patch('/:id/approve', requireRole('asset_manager', 'admin'), ctrl.approveRequest);
router.patch('/:id/reject', requireRole('asset_manager', 'admin'), ctrl.rejectRequest);
router.patch('/:id/assign', requireRole('asset_manager', 'admin'), ctrl.assignTechnician);
router.patch('/:id/progress', requireRole('asset_manager', 'admin'), ctrl.setInProgress);
router.patch('/:id/resolve', requireRole('asset_manager', 'admin'), ctrl.resolveRequest);

module.exports = router;
