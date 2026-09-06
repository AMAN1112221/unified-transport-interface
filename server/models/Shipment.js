const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    pickup: {
      type: String,
      required: true,
      trim: true
    },

    delivery: {
      type: String,
      required: true,
      trim: true
    },

    packageType: {
      type: String,
      required: true,
      trim: true
    },

    weight: {
      type: Number,
      required: true
    },

    vehicle: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Picked Up",
        "In Transit",
        "Delivered",
        "Cancelled"
      ],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Shipment", shipmentSchema);