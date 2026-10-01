const mongoose = require("mongoose");
const Truck = require("../models/Truck");
const Shipment = require("../models/Shipment");

const vehicleTypes = ["Truck", "Mini Truck", "Tempo", "Container"];

const listMyTrucks = async (req, res) => {
  try {
    const trucks = await Truck.find({ owner: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ trucks });
  } catch {
    return res.status(500).json({ message: "Unable to fetch trucks" });
  }
};

const registerTruck = async (req, res) => {
  const body = req.body || {};
  const registrationNumber = typeof body.registrationNumber === "string"
    ? body.registrationNumber.trim().toUpperCase()
    : "";
  const vehicleType = body.vehicleType;
  const capacity = Number(body.capacity);

  if (!registrationNumber || !vehicleTypes.includes(vehicleType) || !Number.isFinite(capacity) || capacity <= 0) {
    return res.status(400).json({ message: "Provide a registration number, valid vehicle type and positive capacity" });
  }
  try {
    const truck = await Truck.create({
      owner: req.user.id,
      registrationNumber,
      vehicleType,
      capacity
    });
    return res.status(201).json({ message: "Truck registered", truck });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Registration number is already in use" });
    if (error.name === "ValidationError") return res.status(400).json({ message: "Truck details are invalid" });
    return res.status(500).json({ message: "Unable to register truck" });
  }
};

const updateTruck = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid truck identifier" });
  const updates = {};
  const body = req.body || {};
  if (Object.hasOwn(body, "registrationNumber")) {
    if (typeof body.registrationNumber !== "string" || !body.registrationNumber.trim()) {
      return res.status(400).json({ message: "Registration number is required" });
    }
    updates.registrationNumber = body.registrationNumber.trim().toUpperCase();
  }
  if (Object.hasOwn(body, "vehicleType")) updates.vehicleType = body.vehicleType;
  if (Object.hasOwn(body, "capacity")) updates.capacity = Number(body.capacity);
  if (Object.hasOwn(body, "available")) {
    if (typeof body.available !== "boolean") return res.status(400).json({ message: "Availability must be true or false" });
    updates.available = body.available;
  }
  if (Object.keys(updates).length === 0) return res.status(400).json({ message: "No permitted truck fields provided" });
  if (updates.vehicleType && !vehicleTypes.includes(updates.vehicleType)) {
    return res.status(400).json({ message: "Invalid vehicle type" });
  }
  if (Object.hasOwn(updates, "capacity") && (!Number.isFinite(updates.capacity) || updates.capacity <= 0)) {
    return res.status(400).json({ message: "Capacity must be positive" });
  }

  try {
    const truck = await Truck.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id, activeShipment: null },
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    );
    if (!truck) {
      const ownedTruck = await Truck.exists({ _id: req.params.id, owner: req.user.id });
      return ownedTruck
        ? res.status(409).json({ message: "Truck details cannot be changed while it is assigned to an active shipment" })
        : res.status(404).json({ message: "Truck not found" });
    }
    return res.status(200).json({ message: "Truck updated", truck });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Registration number is already in use" });
    if (error.name === "ValidationError") return res.status(400).json({ message: "Truck details are invalid" });
    return res.status(500).json({ message: "Unable to update truck" });
  }
};

const getOwnerTripHistory = async (req, res) => {
  try {
    const trucks = await Truck.find({ owner: req.user.id }).select("_id");
    const shipments = await Shipment.find({
      truck: { $in: trucks.map((truck) => truck._id) },
      status: { $in: ["Delivered", "Cancelled"] }
    }).populate("assignedDriver", "name phone").populate("truck", "registrationNumber vehicleType")
      .sort({ updatedAt: -1 });
    return res.status(200).json({ shipments });
  } catch {
    return res.status(500).json({ message: "Unable to fetch trip history" });
  }
};

module.exports = { listMyTrucks, registerTruck, updateTruck, getOwnerTripHistory };