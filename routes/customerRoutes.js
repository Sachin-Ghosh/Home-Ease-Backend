const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Customer routes
router.post('/', customerController.createCustomer); // Create a new customer
router.get('/', customerController.getAllCustomers); // Get all customers
router.get('/:id', customerController.getCustomerById); // Get a customer by ID
router.put('/:id', customerController.updateCustomer); // Update a customer
router.delete('/:id', customerController.deleteCustomer); // Delete a customer
router.get('/profile', customerController.getProfile); // Get customer profile
router.get('/filter', customerController.filterCustomersByAddress); // Filter customers by address

module.exports = router;