const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const multer = require('multer');
// Set up multer for file uploads
// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Create a unique filename
    },
});
const upload = multer({ storage });

// Customer routes
router.post('/', customerController.createCustomer); // Create a new customer
router.get('/', customerController.getAllCustomers); // Get all customers
router.get('/:id', customerController.getCustomerById); // Get a customer by ID
router.put('/:id', customerController.updateCustomer); // Update a customer
router.delete('/:id', customerController.deleteCustomer); // Delete a customer
router.get('/profile', customerController.getProfile); // Get customer profile
router.get('/filter', customerController.filterCustomersByAddress); // Filter customers by address
router.get('/user/:userId', customerController.getCustomerByUserId); // Get a customer by user ID
router.post('/upload-profile-pic', upload.single('profilePicture'), customerController.uploadProfilePicture); // Upload profile picture

module.exports = router;