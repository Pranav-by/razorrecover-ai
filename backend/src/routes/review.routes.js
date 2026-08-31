const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/review.controller');

router.get('/', ReviewController.getQueue);
router.post('/:id/approve', ReviewController.approve);
router.post('/:id/reject', ReviewController.reject);

module.exports = router;
