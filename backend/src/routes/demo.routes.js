const express = require('express');
const router = express.Router();
const DemoController = require('../controllers/demo.controller');

router.post('/seed', DemoController.seed);
router.post('/reset', DemoController.reset);
router.post('/full-reset', DemoController.fullReset);

module.exports = router;
