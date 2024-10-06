const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    
    // Normal Booking Slots
    availableDates: [
        {
            date: { type: Date, required: true }, // Date for which the schedule is defined
            timeSlots: [
                {
                    startTime: { type: Date, required: true },
                    endTime: { type: Date, required: true },
                    isBooked: { type: Boolean, default: false },
                    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" } // Optional: to track which customer booked the slot
                }
            ]
        }
    ],

    // Special Service Availability
    specialServiceAvailability: {
        isAvailable: { type: Boolean, default: false }, // Whether the vendor offers special services or not
        serviceSlots: [
            {
                duration: { type: Number, required: true }, // Duration in minutes (e.g., 45 for a 45-minute service)
                startTime: { type: Date, required: true }, // Start time of the special service slot
                endTime: { type: Date, required: true }, // End time of the special service slot
                isBooked: { type: Boolean, default: false },
                bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" } // Optional: to track which customer booked the slot
            }
        ]
    },

    createdAt: { type: Date, default: Date.now },
});

const Schedule = mongoose.model("Schedule", ScheduleSchema);
module.exports = Schedule;
