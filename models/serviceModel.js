const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId }, // Reference to subcategory ID
  price: { type: Number, required: true },
  duration: {type: Number},
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  photos: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const Service = mongoose.model("Service", ServiceSchema);
module.exports = Service;
