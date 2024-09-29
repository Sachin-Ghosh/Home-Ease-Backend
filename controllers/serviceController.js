const Vendor = require('../models/vendorModel'); // Ensure Vendor model is imported
const Service = require('../models/serviceModel');

// Create a new service
exports.createService = async (req, res) => {
    try {
        // Create the service
        const service = await Service.create(req.body);

        // Update the vendor's services array
        await Vendor.findByIdAndUpdate(
            req.body.vendor, // Assuming the vendor ID is passed in the request body
            { $push: { services: service._id } }, // Add the new service ID to the vendor's services array
            { new: true }
        );

        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all services
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find().populate('vendor');
        res.status(200).json(services);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a service by ID
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate('vendor');
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.status(200).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a service
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.status(200).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a service
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Filter services by category
exports.filterServicesByCategory = async (req, res) => {
    try {
        const services = await Service.find({ category: req.query.category }).populate('vendor');
        res.status(200).json(services);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};