const Shipment = require("../models/Shipment");

// Create Shipment
const createShipment = async (req, res) => {
  try {
    const {
      pickup,
      delivery,
      packageType,
      weight,
      vehicle
    } = req.body;

    if (
      !pickup ||
      !delivery ||
      !packageType ||
      !weight ||
      !vehicle
    ) {
      return res.status(400).json({
        message: "Please fill all shipment details"
      });
    }

    const shipment = await Shipment.create({
      sender: req.user.id,
      pickup,
      delivery,
      packageType,
      weight,
      vehicle
    });

    res.status(201).json({
      message: "Shipment created successfully",
      shipment
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// Get My Shipments
const getMyShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find({
      sender: req.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      shipments
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


module.exports = {
  createShipment,
  getMyShipments
};