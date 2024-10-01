const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bio: { type: String, default: "" },
  address: { type: String },
  phone: { type: String, required: true },
  geo_location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  booking_history: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  profilePicture: { type: String }
});


const Customer = mongoose.model('Customer', CustomerSchema);
module.exports = Customer;