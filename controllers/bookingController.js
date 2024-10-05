const Booking = require('../models/bookingModel');
const Customer = require('../models/customerModel'); // Import the Customer model
const Vendor = require('../models/vendorModel'); // Import the Vendor model

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        // Create the booking
        const booking = await Booking.create(req.body);

        // Update the customer's booking history
        await Customer.findByIdAndUpdate(
            req.body.customer, // Assuming the customer ID is passed in the request body
            { $push: { booking_history: booking._id } }, // Add the new booking ID to the customer's booking history
            { new: true }
        );

        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('customer service vendor');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('customer service vendor');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.status(200).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a booking
exports.updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Update the customer's booking history if the customer ID has changed
        if (req.body.customer) {
            await Customer.findByIdAndUpdate(
                req.body.customer,
                { $addToSet: { booking_history: booking._id } }, // Add the booking ID to the new customer's booking history
                { new: true }
            );
        }

        res.status(200).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Remove the booking ID from the customer's booking history
        await Customer.findByIdAndUpdate(
            booking.customer,
            { $pull: { booking_history: booking._id } }, // Remove the booking ID from the customer's booking history
            { new: true }
        );

        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get bookings by customer ID
exports.getBookingsByCustomerId = async (req, res) => {
    try {
        const bookings = await Booking.find({ customer: req.params.customerId }).populate('service vendor');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get bookings by vendor ID
exports.getBookingsByVendorId = async (req, res) => {
    try {
        const bookings = await Booking.find({ vendor: req.params.vendorId }).populate('customer service');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Filter bookings based on status and date
exports.filterBookings = async (req, res) => {
    const { status, startDate, endDate } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (startDate && endDate) {
        filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    try {
        const bookings = await Booking.find(filter).populate('customer service vendor');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 