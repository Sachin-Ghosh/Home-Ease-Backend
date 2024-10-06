const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  service: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true }],
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule", required: true },
  slot: {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  payment_type: { type: String, enum: ["Cash On Delivery", "UPI", "Other"] },
  payment_status: { type: String, default: "Unpaid" },
  status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled" },
  createdAt: { type: Date, default: Date.now },
});



const Booking = mongoose.model("Booking", BookingSchema);
module.exports = Booking
