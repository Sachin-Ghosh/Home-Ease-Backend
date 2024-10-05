const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  imageUrl: { type: String }, // Optional field for image URL
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' }, // Specify it as a GeoJSON Point
    coordinates: { type: [Number], required: false }, // [longitude, latitude]
  },
});

const ChatSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  messages: [MessageSchema],
});

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;
