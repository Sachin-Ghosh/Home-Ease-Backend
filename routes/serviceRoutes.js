const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
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

// Service routes
router.post('/',upload.array('photos'), serviceController.createService);
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.put('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);
router.get('/services/filter', serviceController.filterServices); // Filter services by category, subcategory, etc.

// Category routes
router.post('/services/category', serviceController.createCategory); // Create a new category
router.get('/services/categorys', serviceController.getAllCategories); // Get all categories
router.get('/services/category/:id', serviceController.getCategoryById); // Get a category by ID
router.post('/services/category/:id/subcategory', serviceController.addSubCategory); // Add a subcategory to a category
router.get('/services/subcategory/:id', serviceController.getSubCategoryById); // Get a subcategory by ID

router.get('/vendor/:vendorId', serviceController.getServicesByVendor);

module.exports = router;