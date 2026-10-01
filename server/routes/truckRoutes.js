const express = require("express");
const protect = require("../middleware/authMiddleware");
const truckController = require("../controllers/truckController");

const router = express.Router();
const authorizeRoles = protect.authorizeRoles;

router.get("/", protect, authorizeRoles("truck_owner"), truckController.listMyTrucks);
router.post("/", protect, authorizeRoles("truck_owner"), truckController.registerTruck);
router.patch("/:id", protect, authorizeRoles("truck_owner"), truckController.updateTruck);
router.get("/trips/history", protect, authorizeRoles("truck_owner"), truckController.getOwnerTripHistory);

module.exports = router;