const Vendor = require('../models/vendorModel');
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

// @desc    Create or update a vendor profile
// @route   POST /api/vendors
exports.createOrUpdateVendor = async (req, res) => {
    const { userId, services, bio, location } = req.body; // Adjusted to 'location'
  
    try {
      // Ensure geolocation is correctly formatted
      if (!location || !location.coordinates || !location.coordinates[0] || !location.coordinates[1]) {
        return res.status(400).json({ success: false, message: "Geolocation data is required." });
      }
  
      const vendorLocation = {
        type: 'Point',
        coordinates: [location.coordinates[0], location.coordinates[1]] // Adjusted to match your frontend structure
      };
  
      let vendor = await Vendor.findOne({ userId });
  
      if (vendor) {
        // Update existing vendor
        vendor.services = services;
        vendor.bio = bio;
        vendor.location = vendorLocation;
      } else {
        // Create a new vendor
        vendor = new Vendor({
          userId,
          services,
          bio,
          location: vendorLocation
        });
      }
  
      await vendor.save();
      res.status(200).json({ success: true, message: "Vendor profile updated successfully", vendor });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ success: false, message: "Server error" });
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
exports.getVendorByUserId = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ userId: req.params.userId }).populate('userId', 'name email');
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
        res.status(200).json(vendor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//  Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    try {
        const vendorId = req.body.vendorId; // Get vendor ID from request body
        const imageUrl = req.file.path; // Get the uploaded file path

        // Update the vendor with the new profile picture URL
        const vendor = await Vendor.findByIdAndUpdate(vendorId, { profilePicture: imageUrl }, { new: true });

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.status(200).json({ message: 'Profile picture uploaded successfully', imageUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading profile picture', error: error.message });
    }
};