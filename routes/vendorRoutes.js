const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');

// Vendor routes
router.post('/', vendorController.createVendor);
router.get('/', vendorController.getAllVendors);
router.get('/available', vendorController.getVendorsByAvailability); // Get available vendors
router.get('/nearby', vendorController.getNearbyVendors); // Get nearby vendors
router.get('/:id', vendorController.getVendorById); // Get vendor by ID
router.put('/:id', vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);

module.exports = router;