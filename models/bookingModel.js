const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  status: { type: String, default: "Pending" }, // Pending, Completed, Cancelled
  payment_status: { type: String, default: "Unpaid" },
  scheduleTime: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", BookingSchema);
module.exports = Booking
