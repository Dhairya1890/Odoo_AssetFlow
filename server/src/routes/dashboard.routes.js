const express = require('express');
const { getDashboardKPIs } = require('../controllers/dashboard.controller');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/kpis', authenticate, getDashboardKPIs);

module.exports = router;
