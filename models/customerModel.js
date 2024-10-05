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

CustomerSchema.methods.populateData = function() {
    return this.populate('booking_history').populate('profilePicture'); // Add other fields as necessary
};

const Customer = mongoose.model('Customer', CustomerSchema);
module.exports = Customer;