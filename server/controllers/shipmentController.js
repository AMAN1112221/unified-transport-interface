const mongoose = require("mongoose");
const Shipment = require("../models/Shipment");
const Truck = require("../models/Truck");
const User = require("../models/User");

const shipmentStatuses = ["Pending", "Accepted", "Picked Up", "In Transit", "Delivered", "Cancelled"];
const validVehicles = ["Truck", "Mini Truck", "Tempo", "Container"];

const isValidId = (id) => mongoose.isValidObjectId(id);
const cleanString = (value) => typeof value === "string" ? value.trim() : "";
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createShipment = async (req, res) => {
  try {
    const body = req.body || {};
    const pickup = cleanString(body.pickup);
    const delivery = cleanString(body.delivery);
    const packageType = cleanString(body.packageType);
    const vehicle = cleanString(body.vehicle);
    const weight = Number(body.weight);
    const receiverEmail = cleanString(body.receiverEmail).toLowerCase();

    if (!pickup || !delivery || !packageType || !receiverEmail || !Number.isFinite(weight) || weight <= 0 || !validVehicles.includes(vehicle)) {
      return res.status(400).json({ message: "Provide valid shipment details and a registered receiver email" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiverEmail)) {
      return res.status(400).json({ message: "Enter a valid receiver email address" });
    }

    const receiver = await User.findOne({ email: receiverEmail, role: "receiver" }).select("_id");
    if (!receiver) return res.status(404).json({ message: "No registered receiver was found for that email" });

    const shipment = await Shipment.create({
      sender: req.user.id,
      receiver: receiver._id,
      pickup,
      delivery,
      packageType,
      weight,
      vehicle,
      status: "Pending",
      statusHistory: [{ status: "Pending", updatedBy: req.user.id }]
    });

    return res.status(201).json({ message: "Shipment created successfully", shipment });
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ message: "Shipment details are invalid" });
    return res.status(500).json({ message: "Unable to create shipment" });
  }
};

const getMyShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find({ sender: req.user.id })
      .populate("receiver", "name email phone")
      .populate("assignedDriver", "name phone email")
      .populate("truck", "registrationNumber vehicleType")
      .sort({ createdAt: -1 });
    return res.status(200).json({ shipments });
  } catch {
    return res.status(500).json({ message: "Unable to fetch shipments" });
  }
};

const cancelShipment = async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid shipment identifier" });
  try {
    const shipment = await Shipment.findOneAndUpdate(
      { _id: req.params.id, sender: req.user.id, status: { $in: ["Pending", "Accepted"] } },
      {
        $set: { status: "Cancelled", cancelledAt: new Date(), cancelledBy: req.user.id },
        $push: { statusHistory: { status: "Cancelled", updatedBy: req.user.id } }
      },
      { returnDocument: "after" }
    );
    if (!shipment) {
      const ownedShipment = await Shipment.exists({ _id: req.params.id, sender: req.user.id });
      return ownedShipment
        ? res.status(409).json({ message: "This shipment can no longer be cancelled" })
        : res.status(404).json({ message: "Shipment not found" });
    }
    if (shipment.truck) {
      await Truck.findOneAndUpdate(
        { _id: shipment.truck, activeShipment: shipment._id },
        { $set: { available: true, activeShipment: null } }
      );
    }
    return res.status(200).json({ message: "Shipment cancelled", shipment });
  } catch {
    return res.status(500).json({ message: "Unable to cancel shipment" });
  }
};

const getReceiverShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find({ receiver: req.user.id })
      .populate("sender", "name email phone companyName")
      .populate("assignedDriver", "name email phone")
      .populate("truck", "registrationNumber vehicleType")
      .sort({ createdAt: -1 });
    return res.status(200).json({ shipments });
  } catch {
    return res.status(500).json({ message: "Unable to fetch receiver shipments" });
  }
};

const getAvailableShipments = async (req, res) => {
  try {
    const filter = { status: "Pending", assignedDriver: null };
    for (const field of ["pickup", "delivery"]) {
      if (req.query[field]) filter[field] = { $regex: escapeRegex(cleanString(req.query[field])), $options: "i" };
    }
    if (req.query.vehicle) {
      filter.vehicle = { $regex: `^${escapeRegex(cleanString(req.query.vehicle))}$`, $options: "i" };
    }
    const shipments = await Shipment.find(filter)
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort({ createdAt: -1 });
    return res.status(200).json({ shipments });
  } catch {
    return res.status(500).json({ message: "Unable to fetch available shipments" });
  }
};

const getDriverShipments = async (req, res) => {
  try {
    const filter = { assignedDriver: req.user.id };
    for (const field of ["pickup", "delivery"]) {
      if (req.query[field]) filter[field] = { $regex: escapeRegex(cleanString(req.query[field])), $options: "i" };
    }
    if (req.query.vehicle) {
      filter.vehicle = { $regex: `^${escapeRegex(cleanString(req.query.vehicle))}$`, $options: "i" };
    }
    if (shipmentStatuses.includes(req.query.status)) filter.status = req.query.status;
    if (req.query.truckNumber) {
      const trucks = await Truck.find({
        registrationNumber: { $regex: escapeRegex(cleanString(req.query.truckNumber)), $options: "i" }
      }).select("_id");
      filter.truck = { $in: trucks.map((truck) => truck._id) };
    }
    const shipments = await Shipment.find(filter)
      .populate("sender", "name email phone")
      .populate("receiver", "name email phone")
      .populate("truck", "registrationNumber vehicleType capacity")
      .sort({ updatedAt: -1 });
    return res.status(200).json({ shipments });
  } catch {
    return res.status(500).json({ message: "Unable to fetch assigned shipments" });
  }
};

const acceptShipment = async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid shipment identifier" });
  try {
    const shipment = await Shipment.findOneAndUpdate(
      { _id: req.params.id, status: "Pending", assignedDriver: null },
      {
        $set: { status: "Accepted", assignedDriver: req.user.id },
        $push: { statusHistory: { status: "Accepted", updatedBy: req.user.id } }
      },
      { returnDocument: "after" }
    );
    if (!shipment) return res.status(409).json({ message: "Shipment is no longer available for acceptance" });
    return res.status(200).json({ message: "Shipment accepted", shipment });
  } catch {
    return res.status(500).json({ message: "Unable to accept shipment" });
  }
};

const updateShipmentStatus = async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid shipment identifier" });
  const transitions = { Accepted: "Picked Up", "Picked Up": "In Transit", "In Transit": "Delivered" };
  const requestedStatus = req.body?.status;
  if (!shipmentStatuses.includes(requestedStatus) || !Object.values(transitions).includes(requestedStatus)) {
    return res.status(400).json({ message: "Invalid shipment status transition" });
  }
  try {
    const currentStatus = Object.keys(transitions).find((status) => transitions[status] === requestedStatus);
    const shipment = await Shipment.findOneAndUpdate(
      { _id: req.params.id, assignedDriver: req.user.id, status: currentStatus },
      { $set: { status: requestedStatus }, $push: { statusHistory: { status: requestedStatus, updatedBy: req.user.id } } },
      { returnDocument: "after" }
    );
    if (!shipment) return res.status(409).json({ message: "Shipment is not assigned to you or cannot make that transition" });
    if (requestedStatus === "Delivered" && shipment.truck) {
      await Truck.findOneAndUpdate(
        { _id: shipment.truck, activeShipment: shipment._id },
        { $set: { available: true, activeShipment: null } }
      );
    }
    return res.status(200).json({ message: "Shipment status updated", shipment });
  } catch {
    return res.status(500).json({ message: "Unable to update shipment status" });
  }
};

const listOwnerShipments = async (req, res) => {
  try {
    const trucks = await Truck.find({ owner: req.user.id }).select("_id");
    const truckIds = trucks.map((truck) => truck._id);
    const [shipments, availableShipments] = await Promise.all([
      Shipment.find({ truck: { $in: truckIds } })
        .populate("sender", "name email phone")
        .populate("receiver", "name email phone")
        .populate("assignedDriver", "name email phone truckNumber")
        .populate("truck", "registrationNumber vehicleType capacity")
        .sort({ updatedAt: -1 }),
      Shipment.find({ status: "Accepted", truck: null })
        .populate("sender", "name")
        .populate("receiver", "name")
        .populate("assignedDriver", "name truckNumber")
        .sort({ createdAt: -1 })
    ]);
    return res.status(200).json({ shipments, availableShipments });
  } catch {
    return res.status(500).json({ message: "Unable to fetch owner shipments" });
  }
};

const assignTruck = async (req, res) => {
  if (!isValidId(req.params.id) || !isValidId(req.body?.truckId)) {
    return res.status(400).json({ message: "Invalid shipment or truck identifier" });
  }
  try {
    const eligibleShipment = await Shipment.findOne({
      _id: req.params.id,
      status: "Accepted",
      truck: null
    }).select("vehicle weight");
    if (!eligibleShipment) return res.status(409).json({ message: "Shipment is not eligible for truck assignment" });

    const truck = await Truck.findOneAndUpdate(
      {
        _id: req.body.truckId,
        owner: req.user.id,
        available: true,
        activeShipment: null,
        vehicleType: eligibleShipment.vehicle,
        capacity: { $gte: eligibleShipment.weight }
      },
      { $set: { available: false, activeShipment: req.params.id } },
      { returnDocument: "after" }
    );
    if (!truck) return res.status(409).json({ message: "Truck is unavailable, incompatible or does not belong to you" });

    const shipment = await Shipment.findOneAndUpdate(
      { _id: req.params.id, status: "Accepted", truck: null },
      { $set: { truck: truck._id } },
      { returnDocument: "after" }
    );
    if (!shipment) {
      await Truck.findOneAndUpdate(
        { _id: truck._id, activeShipment: req.params.id },
        { $set: { available: true, activeShipment: null } }
      );
      return res.status(409).json({ message: "Shipment is not eligible for truck assignment" });
    }
    return res.status(200).json({ message: "Truck assigned", shipment });
  } catch {
    return res.status(500).json({ message: "Unable to assign truck" });
  }
};

module.exports = {
  createShipment,
  getMyShipments,
  cancelShipment,
  getReceiverShipments,
  getAvailableShipments,
  getDriverShipments,
  acceptShipment,
  updateShipmentStatus,
  listOwnerShipments,
  assignTruck
};