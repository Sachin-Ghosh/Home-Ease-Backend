const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  bio: { type: String },
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' }, // GeoJSON format
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  profilePicture: { type: String }
});

// Create a 2dsphere index for geolocation queries
VendorSchema.index({ location: '2dsphere' });

const Vendor = mongoose.model('Vendor', VendorSchema);
module.exports = Vendor;
