const Customer = require('../models/customerModel');
const User = require('../models/userModel');
const multer = require('multer');
const path = require('path');

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

// Create a new customer
exports.createCustomer = async (req, res) => {
    try {
        const customer = await Customer.create(req.body);
        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all customers
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().populate('userId', 'name email');
        res.status(200).json(customers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a customer by ID
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id).populate('userId', 'name email');
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.status(200).json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a customer
exports.updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.status(200).json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get customer profile
exports.getProfile = async (req, res) => {
    try {
        const customer = await Customer.findOne({ userId: req.user.id }).populate('userId', '-password');
        if (!customer) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Filter customers by address
exports.filterCustomersByAddress = async (req, res) => {
    try {
        const customers = await Customer.find({ address: { $regex: req.query.address, $options: 'i' } });
        res.status(200).json(customers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.getCustomerByUserId = async (req, res) => {
    try {
        const customer = await Customer.findOne({ userId: req.params.userId }).populate('userId', 'name email');
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.status(200).json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
//  Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    try {
        const customerId = req.body.customerId; // Get customer ID from request body
        const imageUrl = req.file.path; // Get the uploaded file path

        // Update the customer with the new profile picture URL
        const customer = await Customer.findByIdAndUpdate(customerId, { profilePicture: imageUrl }, { new: true });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json({ message: 'Profile picture uploaded successfully', imageUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading profile picture', error: error.message });
    }
};