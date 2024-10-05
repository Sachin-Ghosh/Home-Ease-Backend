const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  price: { type: Number, required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  availability: { type: Boolean, default: true }, // New field for service availability
  photos: [{ type: String }], // New field for service photos (array of URLs)
  createdAt: { type: Date, default: Date.now },
});

const Service = mongoose.model("Service", ServiceSchema);
module.exports = Service;