const express = require('express');
const { getLogs } = require('../controllers/activity.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Admin only, or Asset Manager if needed. Let's restrict to admin & asset_manager for now.
router.get('/', requireAuth, requireRole(['admin', 'asset_manager']), getLogs);

module.exports = router;
