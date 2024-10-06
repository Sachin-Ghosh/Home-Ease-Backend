const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// Schedule routes
// Normal booking slots
router.post("/normal", scheduleController.createOrUpdateNormalSchedule);

// Special service slots
router.post("/special", scheduleController.createOrUpdateSpecialService);

// Toggle special service availability
router.patch("/special-service/toggle", scheduleController.toggleSpecialServiceAvailability);

router.get('/', scheduleController.getAllSchedules); // Get all schedules
router.get('/:id', scheduleController.getScheduleById); // Get a schedule by ID
router.delete('/:id', scheduleController.deleteSchedule); // Delete a schedule
router.get('/schedule/filter', scheduleController.filterSchedules); // Filter schedules
router.get('/vendor/:vendorId', scheduleController.getVendorSlots); // Get available slots for a vendor
router.post('/request', scheduleController.requestSpecialTimeSlot); // Request a time slot

module.exports = router;