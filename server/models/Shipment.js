const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    pickup: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },

    delivery: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },

    packageType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    weight: {
      type: Number,
      required: true,
      min: 0.01
    },

    vehicle: {
      type: String,
      required: true,
      trim: true
    },

    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      default: null
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
    },

    statusHistory: [{
      status: {
        type: String,
        enum: ["Pending", "Accepted", "Picked Up", "In Transit", "Delivered", "Cancelled"],
        required: true
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }],

    cancelledAt: {
      type: Date,
      default: null
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

shipmentSchema.index({ sender: 1, createdAt: -1 });
shipmentSchema.index({ receiver: 1, createdAt: -1 });
shipmentSchema.index({ assignedDriver: 1, status: 1 });

module.exports = mongoose.model("Shipment", shipmentSchema);