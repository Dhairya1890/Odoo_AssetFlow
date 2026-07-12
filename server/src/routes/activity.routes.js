const express = require('express');
const { getLogs } = require('../controllers/activity.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

const router = express.Router();

// All authenticated users can access logs, but controller will scope the data
router.get('/', authenticate, getLogs);

module.exports = router;
