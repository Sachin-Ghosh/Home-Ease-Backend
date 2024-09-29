const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');

// Vendor routes
router.post('/', vendorController.createVendor);
router.get('/', vendorController.getAllVendors);
router.get('/:id', vendorController.getVendorById);
router.put('/:id', vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);
router.get('/available', vendorController.getVendorsByAvailability); // Get available vendors

module.exports = router;