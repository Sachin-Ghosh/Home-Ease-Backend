// models/chatModel.js
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  imageUrl: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: false },
  },
});

const ChatSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [MessageSchema],
  lastMessage: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'archived'], default: 'active' }
});

// Add index for better query performance
ChatSchema.index({ vendorId: 1, lastMessage: -1 });
ChatSchema.index({ customerId: 1, lastMessage: -1 });

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;