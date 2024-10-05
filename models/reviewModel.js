const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  replies: [
    {
      vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
      reply: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const ReviewSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true }, // Reference to the Service
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true }, // Reference to the Booking
  rating: { type: Number, required: true },
  comments: [CommentSchema], // Array of comments
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", ReviewSchema);
