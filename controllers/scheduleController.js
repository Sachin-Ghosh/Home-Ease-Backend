const Schedule = require("../models/scheduleModel");
const Booking = require("../models/bookingModel"); // Import the Booking model

// @desc    Create or update vendor's available slots for a date
// @route   POST /api/schedules
exports.createOrUpdateSchedule = async (req, res) => {
    const { vendor, date, timeSlots } = req.body;

    try {
        let schedule = await Schedule.findOne({ vendor, date });

        if (schedule) {
            // Update existing schedule
            schedule.timeSlots = timeSlots;
        } else {
            // Create a new schedule
            schedule = new Schedule({ vendor, date, timeSlots });
        }

        await schedule.save();

        // Update bookings with the new scheduleId
        await Booking.updateMany(
            { scheduleId: schedule._id },
            { $set: { scheduleId: schedule._id } } // Ensure the scheduleId is updated in bookings
        );

        res.status(200).json({ success: true, message: "Schedule updated successfully", schedule });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// @desc    Get all schedules
// @route   GET /api/schedules
exports.getAllSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find().populate('vendor');
        res.status(200).json({ success: true, schedules });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// @desc    Get a schedule by ID
// @route   GET /api/schedules/:id
exports.getScheduleById = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id).populate('vendor');
        if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
        res.status(200).json({ success: true, schedule });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// @desc    Delete a schedule
// @route   DELETE /api/schedules/:id
exports.deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findByIdAndDelete(req.params.id);
        if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

        // Remove the scheduleId from bookings associated with this schedule
        await Booking.updateMany(
            { scheduleId: schedule._id },
            { $unset: { scheduleId: "" } } // Remove the scheduleId from bookings
        );

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// @desc    Filter schedules based on vendor, date, and booking status
// @route   GET /api/schedules/filter
exports.filterSchedules = async (req, res) => {
    const { vendor, date, isBooked } = req.query;

    const filter = {};
    if (vendor) filter.vendor = vendor;
    if (date) filter.date = date;
    if (isBooked !== undefined) {
        filter["timeSlots.isBooked"] = isBooked === "true";
    }

    try {
        const schedules = await Schedule.find(filter);
        res.status(200).json({ success: true, schedules });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// @desc    Get vendor's available slots for a given date
// @route   GET /api/schedules/:vendorId?date=YYYY-MM-DD
exports.getVendorSlots = async (req, res) => {
    const { vendorId } = req.params;
    const { date } = req.query;

    try {
        const schedule = await Schedule.findOne({ vendor: vendorId, date });

        if (!schedule) {
            return res.status(404).json({ success: false, message: "No slots available for the given date." });
        }

        res.status(200).json({ success: true, schedule });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// @desc    Request a time slot from a vendor (customer requests slot)
// @route   POST /api/schedules/request
exports.requestSlot = async (req, res) => {
    const { customer, vendor, date, startTime, endTime } = req.body;

    try {
        const schedule = await Schedule.findOne({ vendor, date });

        if (!schedule) {
            return res.status(404).json({ success: false, message: "No slots available for the given date." });
        }

        const slot = schedule.timeSlots.find(
            (slot) => slot.startTime === startTime && slot.endTime === endTime && !slot.isBooked
        );

        if (!slot) {
            return res.status(404).json({ success: false, message: "Requested slot is not available." });
        }

        // Mark the slot as booked and assign it to the customer
        slot.isBooked = true;
        slot.bookedBy = customer;

        await schedule.save();

        // Create a booking with the new scheduleId
        const booking = await Booking.create({
            customer,
            vendor,
            scheduleId: schedule._id,
            slot: { startTime, endTime },
            status: 'Scheduled',
            payment_status: 'Unpaid'
        });

        res.status(200).json({ success: true, message: "Slot requested successfully", booking });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};