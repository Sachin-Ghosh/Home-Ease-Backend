const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// Service routes
router.post('/', serviceController.createService);
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

module.exports = router;