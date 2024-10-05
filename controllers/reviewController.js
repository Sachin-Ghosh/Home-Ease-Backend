const Review = require('../models/reviewModel');

// Create a new review
exports.createReview = async (req, res) => {
    try {
        const review = await Review.create(req.body);
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add a comment to a review
exports.addComment = async (req, res) => {
    const { reviewId } = req.params;
    const { customerId, comment } = req.body;

    try {
        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        review.comments.push({ customerId, comment });
        await review.save();

        res.status(200).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add a reply to a comment
exports.addReply = async (req, res) => {
    const { reviewId, commentId } = req.params;
    const { vendorId, reply } = req.body;

    try {
        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        const comment = review.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        comment.replies.push({ vendorId, reply });
        await review.save();

        res.status(200).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().populate('customerId vendorId');
        res.status(200).json(reviews);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a review by ID
exports.getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id).populate('customerId vendorId');
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.status(200).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a review
exports.updateReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.status(200).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a review
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get reviews by vendor ID
exports.getReviewsByVendorId = async (req, res) => {
    try {
        const reviews = await Review.find({ vendorId: req.params.vendorId }).populate('customerId');
        res.status(200).json(reviews);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};