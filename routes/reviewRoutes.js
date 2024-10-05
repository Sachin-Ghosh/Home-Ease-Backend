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

// Comment and reply routes
router.post('/:reviewId/comment', reviewController.addComment); // Add comment to review
router.post('/:reviewId/comment/:commentId/reply', reviewController.addReply); // Add reply to comment

module.exports = router;
