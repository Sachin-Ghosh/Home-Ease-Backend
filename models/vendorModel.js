const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  bio: { type: String, default: "" },
  location: {
    type: { type: String, default: "Point" },
    coordinates: [{ type: Number }],
  },
  availability: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
});


const Vendor = mongoose.model('Vendor', VendorSchema);
module.exports = Vendor;
