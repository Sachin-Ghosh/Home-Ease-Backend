const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    // Updated to allow multiple dates
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
    createdAt: { type: Date, default: Date.now },
});

const Schedule = mongoose.model("Schedule", ScheduleSchema);
module.exports = Schedule;
