const express = require('express');
const { getLogs } = require('../controllers/activity.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

const router = express.Router();

// Admin only, or Asset Manager if needed. Let's restrict to admin & asset_manager for now.
router.get('/', authenticate, requireRole('admin', 'asset_manager'), getLogs);

module.exports = router;
