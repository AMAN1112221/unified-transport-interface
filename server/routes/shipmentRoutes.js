const express = require("express");

const router = express.Router();

const {
  createShipment,
  getMyShipments
} = require("../controllers/shipmentController");

const protect = require("../middleware/authMiddleware");


// Create Shipment
router.post(
  "/",
  protect,
  createShipment
);


// Get My Shipments
router.get(
  "/my",
  protect,
  getMyShipments
);


module.exports = router;