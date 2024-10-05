const Vendor = require('../models/vendorModel');

// Create a new vendor
exports.createVendor = async (req, res) => {
    try {
        const vendor = await Vendor.create(req.body);
        res.status(201).json(vendor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all vendors
exports.getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().populate('userId services');
        res.status(200).json(vendors);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a vendor by ID
exports.getVendorById = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id).populate('userId services');
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
        res.status(200).json(vendor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a vendor
exports.updateVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
        res.status(200).json(vendor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a vendor
exports.deleteVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndDelete(req.params.id);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get vendors by availability
exports.getVendorsByAvailability = async (req, res) => {
    try {
        const vendors = await Vendor.find({ availability: true }).populate('userId services');
        res.status(200).json(vendors);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get nearby vendors by category
   // Get nearby vendors by category
   exports.getNearbyVendors = async (req, res) => {
    const { lat, lng, categoryId } = req.query; // Get latitude, longitude, and category from query

    try {
        const vendors = await Vendor.find({
            services: categoryId, // Filter by category
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)], // Ensure these are numbers
                    },
                    $maxDistance: 5000 // Distance in meters (e.g., 5000 meters = 5 km)
                }
            }
        }).populate('userId services');

        res.status(200).json(vendors);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};