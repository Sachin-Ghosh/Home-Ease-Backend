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
  payment_status: { type: String, default: "Unpaid", enum: ["Unpaid", "Paid", "Pending", "Refunded"] },
  status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled" },
  createdAt: { type: Date, default: Date.now },
  vendorLocation: {
    type: {
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [0, 0]
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    },
    select: false // This field won't be returned by default in queries
  },
  customerLocation: {
    type: {
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [0, 0]
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    },
    select: false // This field won't be returned by default in queries
  },
  // Track location history for both vendor and customer
  locationHistory: {
    type: [{
      actor: { type: String, enum: ['vendor', 'customer'] },
      coordinates: [Number],
      timestamp: { type: Date, default: Date.now }
    }],
    select: false
  }
});

// Add index for location-based queries if needed
BookingSchema.index({ 'vendorLocation.coordinates': '2dsphere' });
BookingSchema.index({ 'customerLocation.coordinates': '2dsphere' });


const Booking = mongoose.model("Booking", BookingSchema);
module.exports = Booking
