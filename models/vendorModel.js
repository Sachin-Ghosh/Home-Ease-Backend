const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    bio: { type: String },
    location: {
        type: { type: String, enum: ['Point'], required: true }, // 'Point' for 2dsphere
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    availability: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
});

VendorSchema.methods.populateData = function() {
    return this.populate('services'); // Add other fields as necessary
};
// Create a 2dsphere index on the location field
VendorSchema.index({ location: '2dsphere' });

const Vendor = mongoose.model('Vendor', VendorSchema);
module.exports = Vendor;