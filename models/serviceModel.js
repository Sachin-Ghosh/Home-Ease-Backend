const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  createdAt: { type: Date, default: Date.now },
});


const Service = mongoose.model("Service", ServiceSchema);
module.exports = Service
