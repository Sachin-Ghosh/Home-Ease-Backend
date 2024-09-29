const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Chat routes
router.post('/', chatController.createChat);
router.get('/booking/:bookingId', chatController.getChatByBookingId);
router.put('/:id/message', chatController.addMessageToChat); // Add message to chat

module.exports = router;