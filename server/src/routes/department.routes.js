const router = require('express').Router();
const ctrl = require('../controllers/department.controller');
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

router.use(auth);
router.get('/', ctrl.listDepartments);
router.post('/', requireRole('admin'), ctrl.createDepartment);
router.patch('/:id/status', requireRole('admin'), ctrl.updateDepartmentStatus);
router.patch('/:id', requireRole('admin'), ctrl.updateDepartment);

module.exports = router;
