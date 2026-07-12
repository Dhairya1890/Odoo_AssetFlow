const router = require('express').Router();
const ctrl = require('../controllers/asset.controller');
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

router.use(auth);
router.get('/', ctrl.listAssets);
router.get('/:id/qr', ctrl.getQRCode);
router.get('/:id', ctrl.getAsset);
router.post('/', requireRole('asset_manager', 'admin'),
  upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'document', maxCount: 1 }]),
  ctrl.createAsset
);
router.patch('/:id/status', requireRole('asset_manager', 'admin'), ctrl.updateAssetStatus);
router.patch('/:id', requireRole('asset_manager', 'admin'),
  upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'document', maxCount: 1 }]),
  ctrl.updateAsset
);

module.exports = router;
