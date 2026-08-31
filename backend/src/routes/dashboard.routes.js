const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');

router.get('/summary', DashboardController.getSummary);
router.get('/breakdown', DashboardController.getBreakdown);
router.get('/batch-history', DashboardController.getBatchHistory);

module.exports = router;
