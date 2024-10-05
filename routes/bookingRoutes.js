const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Booking routes
router.post('/', bookingController.createBooking); // Create a new booking
router.get('/', bookingController.getAllBookings); // Get all bookings
router.get('/:id', bookingController.getBookingById); // Get a booking by ID
router.put('/:id', bookingController.updateBooking); // Update a booking
router.delete('/:id', bookingController.deleteBooking); // Delete a booking
router.get('/customer/:customerId', bookingController.getBookingsByCustomerId); // Get bookings by customer ID
router.get('/vendor/:vendorId', bookingController.getBookingsByVendorId); // Get bookings by vendor ID
router.get('/booking/filter', bookingController.filterBookings); // Filter bookings

module.exports = router;