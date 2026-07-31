const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getReportAnalytics
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardStats);
router.get('/analytics', protect, authorize('Administrador'), getReportAnalytics);

module.exports = router;
