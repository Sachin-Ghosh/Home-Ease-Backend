const Schedule = require("../models/scheduleModel");
const Booking = require("../models/bookingModel");
const Service = require("../models/serviceModel");

// @desc    Create or update vendor's normal schedule
// @route   POST /api/schedules/normal
exports.createOrUpdateNormalSchedule = async (req, res) => {
    const { vendor, availableDates } = req.body;

    try {
        let schedule = await Schedule.findOne({ vendor });

        const updatedAvailableDates = availableDates.map(dateObj => {
            const { date, timeSlots } = dateObj;
            return {
                date: new Date(date),
                timeSlots: timeSlots.map(slot => ({
                    startTime: new Date(slot.startTime),
                    endTime: new Date(slot.endTime),
                    isBooked: false
                }))
            };
        });

        if (schedule) {
            // Merge new dates with existing ones
            const existingDates = schedule.availableDates.map(d => d.date.toISOString().split('T')[0]);
            updatedAvailableDates.forEach(newDate => {
                const dateStr = new Date(newDate.date).toISOString().split('T')[0];
                const existingIndex = existingDates.indexOf(dateStr);
                if (existingIndex > -1) {
                    schedule.availableDates[existingIndex] = newDate;
                } else {
                    schedule.availableDates.push(newDate);
                }
            });
        } else {
            schedule = new Schedule({
                vendor,
                availableDates: updatedAvailableDates
            });
        }

        await schedule.save();
        res.status(200).json({
            success: true,
            message: "Normal schedule created/updated successfully",
            schedule
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};


exports.createOrUpdateSpecialService = async (req, res) => {
    const { vendor, isAvailable } = req.body; // Removed serviceId and availableTimeSlots

    try {
        // Check if the vendor exists in the Schedule collection
        let schedule = await Schedule.findOne({ vendor });

        // If the vendor has no schedule, create a new one
        if (!schedule) {
            schedule = new Schedule({
                vendor,
                specialServiceAvailability: {
                    isAvailable,
                },
            });
        } else {
            // Update the special service availability
            schedule.specialServiceAvailability.isAvailable = isAvailable;
        }

        await schedule.save();

        res.status(200).json({
            success: true,
            message: "Special service availability updated successfully",
            schedule,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};


// @desc    Toggle special service availability
// @route   PATCH /api/schedules/special/toggle
exports.toggleSpecialServiceAvailability = async (req, res) => {
    const { vendor, isAvailable } = req.body;

    try {
        let schedule = await Schedule.findOne({ vendor });
        
        if (!schedule) {
            schedule = new Schedule({
                vendor,
                specialServiceAvailability: {
                    isAvailable
                }
            });
        } else {
            schedule.specialServiceAvailability.isAvailable = isAvailable;
        }

        await schedule.save();

        res.status(200).json({
            success: true,
            message: `Special service availability ${isAvailable ? 'enabled' : 'disabled'} successfully`,
            schedule
        });
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

        await Booking.updateMany(
            { scheduleId: schedule._id },
            { $unset: { scheduleId: "" } }
        );

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// @desc    Filter schedules based on vendor, date availability, and slot type (normal/special)
// @route   GET /api/schedules/filter
exports.filterSchedules = async (req, res) => {
    const { vendorId, date, type } = req.query;

    try {
        const schedule = await Schedule.findOne({ vendor: vendorId }).populate("vendor");
        if (!schedule) {
            return res.status(404).json({ success: false, message: "No schedule found for the given vendor." });
        }

        const filteredResult = { normalSlots: [], specialSlots: [] };

        if (!type || type === "normal") {
            const availableDate = schedule.availableDates.find((d) => d.date.toISOString() === new Date(date).toISOString());
            if (availableDate) {
                filteredResult.normalSlots = availableDate.timeSlots.filter((slot) => !slot.isBooked);
            }
        }

        if (!type || type === "special") {
            if (schedule.specialServiceAvailability.isAvailable) {
                filteredResult.specialSlots = schedule.specialServiceAvailability.serviceSlots.filter((slot) => !slot.isBooked);
            }
        }

        res.status(200).json({
            success: true,
            message: "Filtered schedules fetched successfully",
            schedule: filteredResult,
        });
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
        const schedule = await Schedule.findOne({ vendor: vendorId, 'availableDates.date': new Date(date) }).populate("vendor");
        if (!schedule) {
            return res.status(404).json({ success: false, message: "No slots available for the given date." });
        }

        res.status(200).json({ success: true, schedule });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};


// @desc    Request a time slot calculation for special service
// @route   POST /api/schedules/request-special-slot
exports.requestSpecialTimeSlot = async (req, res) => {
    const { vendor, serviceId, startTime, customerId } = req.body; // Added customerId to the request

    try {
        // Check if vendor has special service availability
        const schedule = await Schedule.findOne({ vendor: vendor });
        
        // console.log("Schedule found: ", schedule); // Debugging line
        
        if (!schedule) {
            return res.status(400).json({ 
                success: false, 
                message: "Schedule not found for this vendor." 
            });
        }

        // Check availability
        // console.log("Is Special Service Available: ", schedule.specialServiceAvailability.isAvailable); // Debugging line
        
        if (!schedule.specialServiceAvailability.isAvailable) {
            return res.status(400).json({ 
                success: false, 
                message: "Special service is not available for this vendor." 
            });
        }

        // Find the service to get duration
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ 
                success: false, 
                message: "Service not found." 
            });
        }

        // Calculate time slot
        const startDateTime = new Date(startTime);
        const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000);

        // Check if the calculated slot overlaps with any existing slots
        const isOverlapping = schedule.specialServiceAvailability.serviceSlots.some(slot => {
            const existingStart = new Date(slot.startTime);
            const existingEnd = new Date(slot.endTime);
            return (startDateTime < existingEnd && endDateTime > existingStart);
        });

        if (isOverlapping) {
            return res.status(400).json({
                success: false,
                message: "This time slot overlaps with an existing booking."
            });
        }

        // Create the new service slot with bookedBy set to the customerId
        const newSlot = {
            duration: service.duration,
            startTime: startDateTime,
            endTime: endDateTime,
            isBooked: true, // Mark the slot as booked
            bookedBy: customerId // Set to the customer ID passed in the request
        };

        // Push the new service slot into the serviceSlots array
        schedule.specialServiceAvailability.serviceSlots.push(newSlot);

        // Save the updated schedule
        await schedule.save();

        // Prepare response
        const calculatedSlot = {
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            duration: service.duration
        };

        res.status(200).json({
            success: true,
            message: "Time slot calculated and saved successfully",
            timeSlot: calculatedSlot
        });

    } catch (err) {
        console.error("Error occurred: ", err); // Log error details
        res.status(500).json({ 
            success: false, 
            message: "Server Error", 
            error: err.message 
        });
    }
};

