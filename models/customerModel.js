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
  return this.populate({
    path: 'userId',        // Populating userId field from User model
    select: 'name email',  // Select specific fields from the User model if needed
  }).populate('booking_history');// Add other fields as necessary
     // Add other fields as necessary
};

const Customer = mongoose.model('Customer', CustomerSchema);
module.exports = Customer;