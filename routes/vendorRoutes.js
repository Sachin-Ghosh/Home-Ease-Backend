const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Create a unique filename
    },
});
const upload = multer({ storage });

// Vendor routes
router.post('/', vendorController.createOrUpdateVendor);
router.get('/', vendorController.getAllVendors);
router.get('/available', vendorController.getVendorsByAvailability); // Get available vendors
router.get('/nearby', vendorController.getNearbyVendors); // Get nearby vendors
router.get('/:id', vendorController.getVendorById); // Get vendor by ID
router.put('/:id', vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);
router.get('/vendor/user/:userId', vendorController.getVendorByUserId); // Get a customer by user ID
router.post('/upload-profile-pic', upload.single('profilePicture'), vendorController.uploadProfilePicture); // Upload profile picture


module.exports = router;