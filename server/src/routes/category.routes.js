const router = require('express').Router();
const ctrl = require('../controllers/category.controller');
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

router.use(auth);
router.get('/', ctrl.listCategories);
router.post('/', requireRole('admin', 'asset_manager'), ctrl.createCategory);
router.patch('/:id', requireRole('admin', 'asset_manager'), ctrl.updateCategory);

module.exports = router;
