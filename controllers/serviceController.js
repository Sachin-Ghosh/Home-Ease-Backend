const Vendor = require('../models/vendorModel'); // Ensure Vendor model is imported
const Service = require('../models/serviceModel');
const Category = require('../models/categoryModel'); // Import Category model
const multer = require('multer');

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
        const services = await Service.find().populate('vendor category'); // Populate category
        res.status(200).json(services);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a service by ID
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate('vendor category'); // Populate category
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

// Filter services by category and subcategory
exports.filterServices = async (req, res) => {
    try {
        const { category, subcategory, minPrice, maxPrice, vendor } = req.query;

        // Build the filter object
        const filter = {};
        if (category) filter.category = category; // Filter by category
        if (subcategory) filter.subcategory = subcategory; // Filter by subcategory
        if (minPrice) filter.price = { $gte: minPrice }; // Filter by minimum price
        if (maxPrice) filter.price = { $lte: maxPrice }; // Filter by maximum price
        if (vendor) filter.vendor = vendor; // Filter by vendor

        const services = await Service.find(filter).populate('vendor category'); // Populate category
        res.status(200).json(services);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Create a new category
exports.createCategory = upload.single('image'), async (req, res) => {
    try {
        const categoryData = {
            name: req.body.name,
            description: req.body.description,
            image: req.file.path, // Get the uploaded file path
        };
        const category = await Category.create(categoryData);
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a subcategory by ID
exports.getSubCategoryById = async (req, res) => {
    try {
        const category = await Category.findOne({ 'subCategories._id': req.params.id }, { 'subCategories.$': 1 });
        if (!category || category.subCategories.length === 0) return res.status(404).json({ message: 'Subcategory not found' });
        res.status(200).json(category.subCategories[0]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add a subcategory to a category
exports.addSubCategory = upload.single('image'), async (req, res) => {
    try {
        const { categoryId, name, description } = req.body;
        const subCategoryData = {
            name,
            description,
            image: req.file.path, // Get the uploaded file path for subcategory image
        };
        const category = await Category.findByIdAndUpdate(
            categoryId,
            { $push: { subCategories: subCategoryData } },
            { new: true }
        );
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};