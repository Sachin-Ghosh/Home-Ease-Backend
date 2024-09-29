const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Review routes
router.post('/', reviewController.createReview);
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReviewById);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.get('/vendor/:vendorId', reviewController.getReviewsByVendorId); // Get reviews by vendor ID

module.exports = router;