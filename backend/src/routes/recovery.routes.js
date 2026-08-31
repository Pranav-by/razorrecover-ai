const express = require('express');
const router = express.Router();
const RecoveryController = require('../controllers/recovery.controller');

router.get('/recoveries', RecoveryController.listAll);
router.get('/recoveries/:id', RecoveryController.getById);
router.get('/test-cases', RecoveryController.listTestCases);
router.post('/test-cases', RecoveryController.createTestCase);
router.post('/test-cases/:id/execute', RecoveryController.executeTestCase);
router.delete('/test-cases/:id', RecoveryController.deleteTestCase);
router.delete('/recoveries/:id', RecoveryController.deleteTestCase);
router.post('/recovery/run-batch', RecoveryController.runBatch);
router.get('/recovery/latest-batch', RecoveryController.getLatestBatch);
router.get('/recovery/batch/:batchId', RecoveryController.getBatchResult);
router.get('/recovery/batch/:batchId/export', RecoveryController.exportBatch);

module.exports = router;
