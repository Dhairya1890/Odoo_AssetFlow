const express = require('express');
const { getLogs } = require('../controllers/activity.controller');
const requireAuth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

const router = express.Router();

router.get('/', requireAuth, requireRole('admin', 'asset_manager'), getLogs);

module.exports = router;
