const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

router.use(auth);
router.get('/', requireRole('admin'), ctrl.listUsers);
router.get('/:id', ctrl.getUser);
router.patch('/:id/role', requireRole('admin'), ctrl.updateRole);
router.patch('/:id/status', requireRole('admin'), ctrl.updateStatus);
router.patch('/:id', ctrl.updateSelf);

module.exports = router;
