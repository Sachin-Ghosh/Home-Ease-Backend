// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/initialize', chatController.initializeChat);
router.get('/vendor/:vendorId', chatController.getVendorChats);
router.get('/customer/:customerId', chatController.getCustomerChats);
router.put('/:id/message', chatController.addMessageToChat);

module.exports = router;