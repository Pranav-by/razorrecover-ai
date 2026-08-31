const express = require('express');
const router = express.Router();
const RecoveryController = require('../controllers/recovery.controller');

router.get('/recoveries', RecoveryController.listAll);
router.get('/recoveries/:id', RecoveryController.getById);
router.get('/test-cases', RecoveryController.listTestCases);
router.post('/recovery/run-batch', RecoveryController.runBatch);
router.get('/recovery/latest-batch', RecoveryController.getLatestBatch);
router.get('/recovery/batch/:batchId', RecoveryController.getBatchResult);
router.get('/recovery/batch/:batchId/export', RecoveryController.exportBatch);

module.exports = router;
