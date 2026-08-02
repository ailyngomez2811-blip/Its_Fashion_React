const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getReportAnalytics,
  exportPdf,
  exportExcel
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardStats);
router.get('/analytics', protect, authorize('Administrador'), getReportAnalytics);
router.get('/export/pdf', protect, authorize('Administrador'), exportPdf);
router.get('/export/excel', protect, authorize('Administrador'), exportExcel);

module.exports = router;
