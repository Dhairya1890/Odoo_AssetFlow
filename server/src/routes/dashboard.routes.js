const express = require('express');
const { getDashboardKPIs } = require('../controllers/dashboard.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/kpis', requireAuth, getDashboardKPIs);

module.exports = router;
