const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  vehicleType: {
    type: String,
    required: true,
    trim: true,
    enum: ["Truck", "Mini Truck", "Tempo", "Container"]
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  available: {
    type: Boolean,
    default: true
  },
  activeShipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shipment",
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Truck", truckSchema);