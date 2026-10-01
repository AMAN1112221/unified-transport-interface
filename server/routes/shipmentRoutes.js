const express = require("express");
const shipmentController = require("../controllers/shipmentController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
const authorizeRoles = protect.authorizeRoles;

router.post("/", protect, authorizeRoles("sender"), shipmentController.createShipment);
router.get("/my", protect, authorizeRoles("sender"), shipmentController.getMyShipments);
router.patch("/:id/cancel", protect, authorizeRoles("sender"), shipmentController.cancelShipment);

router.get("/receiver", protect, authorizeRoles("receiver"), shipmentController.getReceiverShipments);

router.get("/driver/available", protect, authorizeRoles("driver"), shipmentController.getAvailableShipments);
router.get("/driver/assigned", protect, authorizeRoles("driver"), shipmentController.getDriverShipments);
router.post("/:id/accept", protect, authorizeRoles("driver"), shipmentController.acceptShipment);
router.patch("/:id/status", protect, authorizeRoles("driver"), shipmentController.updateShipmentStatus);

router.get("/owner/shipments", protect, authorizeRoles("truck_owner"), shipmentController.listOwnerShipments);
router.patch("/owner/shipments/:id/truck", protect, authorizeRoles("truck_owner"), shipmentController.assignTruck);

module.exports = router;