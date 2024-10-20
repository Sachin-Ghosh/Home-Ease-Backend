const Vendor = require('../models/vendorModel'); // Ensure Vendor model is imported
const Service = require('../models/serviceModel');
const Category = require('../models/categoryModel'); // Import Category model
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

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
// Create a new service
// exports.createService = async (req, res) => {
//     try {
//         // const photos = req.files.map(file => file.path);
//         const serviceData = {
//             ...req.body,
//             photos: req.body.photos || [],
//         };

//         // Check if category exists
//         const categoryExists = await Category.findById(req.body.category);
//         if (!categoryExists) return res.status(404).json({ message: "Category not found" });

//         // Check if subcategory exists in the specified category
//         const subCategoryExists = categoryExists.subCategories.id(req.body.subcategory);
//         if (!subCategoryExists) return res.status(404).json({ message: "Subcategory not found in the specified category" });

//         // Create the service
//         const service = await Service.create(serviceData);

//         // Update the vendor's services array
//         await Vendor.findByIdAndUpdate(
//             req.body.vendor,
//             { $push: { services: service._id } },
//             { new: true }
//         );

//         res.status(201).json(service);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };


// Create a new service
exports.createService = [
    upload.array('photos', 5), // Allow up to 5 photos
    async (req, res) => {
        try {
            const photos = req.files.map(file => file.path);
            const serviceData = {
                ...req.body,
                photos,
            };

            // Check if category exists
            const categoryExists = await Category.findById(req.body.category);
            if (!categoryExists) return res.status(404).json({ message: "Category not found" });

            // Check if subcategory exists in the specified category
            const subCategoryExists = categoryExists.subCategories.id(req.body.subcategory);
            if (!subCategoryExists) return res.status(404).json({ message: "Subcategory not found in the specified category" });

            // Create the service
            const service = await Service.create(serviceData);

            // Update the vendor's services array
            await Vendor.findByIdAndUpdate(
                req.body.vendor,
                { $push: { services: service._id } },
                { new: true }
            );

            res.status(201).json(service);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
];


// Create a new service
// exports.createService = async (req, res) => {
//     try {
//         const { vendor, ...serviceData } = req.body; // Extract vendor ID from request body

//         // Check if vendor exists
//         const vendorExists = await Vendor.findById(vendor);
//         if (!vendorExists) {
//             return res.status(404).json({ message: 'Vendor not found' });
//         }

//         const service = await Service.create(serviceData); // Create the service

//         // Update the vendor's services array
//         const updatedVendor = await Vendor.findByIdAndUpdate(vendor, { $addToSet: { services: service._id } }, { new: true });
//         console.log('Updated Vendor:', updatedVendor); // Log the updated vendor

//         res.status(201).json(service);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

// Get all services with populated data
exports.getAllServices = async (req, res) => {
    try {
      const services = await Service.find()
        .populate('vendor')
        .populate({
            path: 'category',
            populate: { path: 'subCategories' }, // Populate all subcategories in the category
        })
        .populate('subcategory'); 
    
  
      res.status(200).json(services);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  

// Get a service by ID
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('vendor') // Populate vendor details
            .populate({
                path: 'category',
                // populate: { path: 'subCategories' }, // Populate all subcategories in the category
            })
            .populate('subcategory'); // Populate specific subcategory by its ID in the service
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.status(200).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a service
// exports.updateService = async (req, res) => {
//     try {
//         const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true })
//             .populate('vendor') // Populate vendor details
//             .populate({
//                 path: 'category',
//                 populate: { path: 'subCategories' }, // Populate all subcategories in the category
//             })
//             .populate('subcategory'); // Populate specific subcategory by its ID in the service
//         if (!service) return res.status(404).json({ message: 'Service not found' });
//         res.status(200).json(service);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };
exports.updateService = [
    upload.array('photos', 5), // Allow up to 5 photos
    async (req, res) => {
        try {
            // console.log('Updating service with ID:', req.params.id);
            // console.log('Request body:', req.body);
            // console.log('Files:', req.files);

            const serviceId = req.params.id;
            const updateData = {};

            // Only include fields that are present in the request body
            const fieldsToUpdate = ['name', 'description', 'price', 'duration', 'category', 'subcategory'];
            fieldsToUpdate.forEach(field => {
                if (req.body[field] !== undefined) {
                    updateData[field] = req.body[field];
                }
            });

            // Handle existing photos
            const existingPhotos = req.body.existingPhotos || [];
            updateData.photos = Array.isArray(existingPhotos) ? existingPhotos : [existingPhotos];

            // Handle new photos
            if (req.files && req.files.length > 0) {
                const newPhotos = req.files.map(file => file.path);
                updateData.photos = [...updateData.photos, ...newPhotos];
            }

            // Remove photos that are no longer in the list
            const service = await Service.findById(serviceId);
            if (service) {
                const photosToRemove = service.photos.filter(photo => !updateData.photos.includes(photo));
                for (const photo of photosToRemove) {
                    await fs.unlink(photo).catch(err => console.error('Error deleting file:', err));
                }
            }

            const updatedService = await Service.findByIdAndUpdate(serviceId, updateData, { new: true, runValidators: true })
                .populate('vendor')
                .populate({
                    path: 'category',
                    populate: { path: 'subCategories' },
                })
                .populate('subcategory');

            if (!updatedService) return res.status(404).json({ message: 'Service not found' });
            
            // console.log('Updated service:', updatedService);
            res.status(200).json(updatedService);
        } catch (error) {
            console.error('Error updating service:', error);
            res.status(400).json({ message: error.message });
        }
    }
];


// Delete a service
// exports.deleteService = async (req, res) => {
//     try {
//         const service = await Service.findByIdAndDelete(req.params.id);
//         if (!service) return res.status(404).json({ message: 'Service not found' });
//         res.status(204).send(); 
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) return res.status(404).json({ message: 'Service not found' });

        // Remove service reference from vendor
        await Vendor.findByIdAndUpdate(service.vendor, {
            $pull: { services: service._id }
        });

        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};




// // Filter services by category and subcategory
// exports.filterServices = async (req, res) => {
//     try {
//         const { category, subcategory, minPrice, maxPrice, vendor } = req.query;

//         // Build the filter object
//         const filter = {};
//         if (category) filter.category = category; // Filter by category
//         if (subcategory) filter.subcategory = subcategory; // Filter by subcategory
//         if (minPrice) filter.price = { $gte: minPrice }; // Filter by minimum price
//         if (maxPrice) filter.price = { ...filter.price, $lte: maxPrice }; // Filter by maximum price
//         if (vendor) filter.vendor = vendor; // Filter by vendor

//         const services = await Service.find(filter)
//             .populate('vendor')
//             .populate('category')
//             .populate({ path: 'subcategory', select: 'name description' }); // Populate subcategory details
//         res.status(200).json(services);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };
// Filter services by category and subcategory
// exports.filterServices = async (req, res) => {
//     try {
//         // console.log("Query Parameters:", req.query); // Log query parameters

//         const { category, subcategory, minPrice, maxPrice, vendor } = req.query;

//         // Build the filter object
//         const filter = {};
//         if (category) {
//             if (mongoose.isValidObjectId(category)) {
//                 filter.category = new mongoose.Types.ObjectId(category); // Use 'new' keyword
//             } else {
//                 return res.status(400).json({ message: 'Invalid category ID' });
//             }
//         }
//         if (subcategory) {
//             if (mongoose.isValidObjectId(subcategory)) {
//                 filter.subcategory = new mongoose.Types.ObjectId(subcategory); // Use 'new' keyword
//             } else {
//                 return res.status(400).json({ message: 'Invalid subcategory ID' });
//             }
//         }
//         if (minPrice) filter.price = { $gte: minPrice }; // Filter by minimum price
//         if (maxPrice) {
//             filter.price = { ...filter.price, $lte: maxPrice }; // Filter by maximum price
//         }
//         if (vendor) {
//             if (mongoose.isValidObjectId(vendor)) {
//                 filter.vendor = new mongoose.Types.ObjectId(vendor); // Use 'new' keyword
//             } else {
//                 return res.status(400).json({ message: 'Invalid vendor ID' });
//             }
//         }

//         const services = await Service.find(filter)
//             .populate('vendor')
//             .populate('category')
//             .populate({ path: 'subcategory', select: 'name description' }); // Populate subcategory details

//         res.status(200).json(services);
//     } catch (error) {
//         console.error("Error:", error); // Log the error for debugging
//         res.status(400).json({ message: error.message });
//     }
// };

// Filter services by category, subcategory, price range, vendor, and location
exports.filterServices = async (req, res) => {
    try {
        const { category, subcategory, minPrice, maxPrice, vendor, lat, lng, maxDistance } = req.query;

        // Build the filter object
        const filter = {};

        // Category and subcategory filters
        if (category) {
            if (mongoose.isValidObjectId(category)) {
                filter.category = new mongoose.Types.ObjectId(category);
            } else {
                return res.status(400).json({ message: 'Invalid category ID' });
            }
        }

        if (subcategory) {
            if (mongoose.isValidObjectId(subcategory)) {
                filter.subcategory = new mongoose.Types.ObjectId(subcategory);
            } else {
                return res.status(400).json({ message: 'Invalid subcategory ID' });
            }
        }

        // Price range filter
        if (minPrice) filter.price = { $gte: minPrice };
        if (maxPrice) filter.price = { ...filter.price, $lte: maxPrice };

        // Vendor filter
        if (vendor) {
            if (mongoose.isValidObjectId(vendor)) {
                filter.vendor = new mongoose.Types.ObjectId(vendor);
            } else {
                return res.status(400).json({ message: 'Invalid vendor ID' });
            }
        }

        // Location-based filter
        if (lat && lng) {
            // Validate latitude and longitude inputs
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);
            if (isNaN(latitude) || isNaN(longitude)) {
                return res.status(400).json({ message: 'Invalid latitude or longitude' });
            }

            // Find vendors within the specified location range
            const distance = maxDistance ? parseFloat(maxDistance) : 5000; // Default max distance to 5km
            if (isNaN(distance)) {
                return res.status(400).json({ message: 'Invalid maxDistance value' });
            }

            // Use $geoWithin to find vendors within a certain radius
            const vendors = await Vendor.find({
                location: {
                    $geoWithin: {
                        $centerSphere: [[longitude, latitude], distance / 6378.1] // Convert distance to radians
                    }
                }
            }).select('_id'); // Only select vendor IDs

            // Add vendor IDs to the service filter
            const vendorIds = vendors.map(v => v._id);
            filter.vendor = { $in: vendorIds };
        }

        // Find services based on the constructed filter object
        const services = await Service.find(filter)
            .populate('vendor')
            .populate('category')
            .populate({ path: 'subcategory', select: 'name description' });

        res.status(200).json(services);
    } catch (error) {
        console.error("Error:", error); // Log the error for debugging
        res.status(400).json({ message: error.message });
    }
};


// Create a new category
// exports.createCategory = upload.single('image'), async (req, res) => {
//     try {
//         const categoryData = {
//             name: req.body.name,
//             description: req.body.description,
//             image: req.file.path, // Get the uploaded file path
//         };
//         const category = await Category.create(categoryData);
//         res.status(201).json(category);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };
exports.createCategory = [
    upload.single('image'),
    async (req, res) => {
        try {
            // console.log("Request Body:", req.body);
            // console.log("Request File:", req.file);

            if (!req.body.name || !req.body.description) {
                return res.status(400).json({ message: 'Name and Description are required fields.' });
            }

            const categoryData = {
                name: req.body.name,
                description: req.body.description,
                image: req.file ? req.file.path : undefined,
            };
            const category = await Category.create(categoryData);
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
];


// exports.createCategory = async (req, res) => {
//     try {
//         const { name, description, image } = req.body;
//         const category = await Category.create({ name, description, image });
//         res.status(201).json(category);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

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
// exports.addSubCategory = upload.single('image'), async (req, res) => {
//     try {
//         const { categoryId, name, description } = req.body;
//         const subCategoryData = {
//             name,
//             description,
//             image: req.file.path, // Get the uploaded file path for subcategory image
//         };
//         const category = await Category.findByIdAndUpdate(
//             categoryId,
//             { $push: { subCategories: subCategoryData } },
//             { new: true }
//         );
//         if (!category) return res.status(404).json({ message: 'Category not found' });
//         res.status(200).json(category);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };
   // In controllers/serviceController.js
   exports.addSubCategory = [
    upload.single('image'),
    async (req, res) => {
        try {
            const { name, description } = req.body;
            const categoryId = req.params.id;

            const subCategoryData = {
                name,
                description,
                image: req.file ? req.file.path : undefined,
            };

            const category = await Category.findByIdAndUpdate(
                categoryId,
                { $push: { subCategories: subCategoryData } },
                { new: true }
            );

            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }

            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
];

// // Controller function to get services by vendorId
// exports.getServicesByVendor = async (req, res) => {
//     const { vendorId } = req.params; // Get vendorId from the request parameters
  
//     try {
//       // Find services that match the vendorId
//       const services = await Service.find({ vendor: vendorId });
  
//       if (!services || services.length === 0) {
//         return res.status(404).json({ message: 'No services found for this vendor' });
//       }
  
//       res.status(200).json(services);
//     } catch (error) {
//       console.error('Error fetching services by vendor:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   };

  // Get services by vendor ID
exports.getServicesByVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;
        
        // if (!mongoose.isValidObjectId(vendorId)) {
        //     return res.status(400).json({ message: 'Invalid vendor ID' });
        // }

        const services = await Service.find({ vendor: vendorId })
            .populate('category')
            .populate('subcategory');

        // No error if no services found, return an empty array
        res.status(200).json(services);
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
