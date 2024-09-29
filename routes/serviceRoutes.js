const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// Service routes
router.post('/', serviceController.createService);
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.put('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);
router.get('/category', serviceController.filterServicesByCategory); // Filter services by category

module.exports = router;