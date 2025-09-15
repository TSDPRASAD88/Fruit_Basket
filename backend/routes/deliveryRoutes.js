// routes/deliveryRoutes.js
const express = require("express");
const Delivery = require("../models/Delivery");
const Customer = require("../models/Customer");

const router = express.Router();

/**
 * 📌 Add a single delivery (default = today)
 * Body: { customerId, status?, notes?, date? }
 */
router.post("/", async (req, res) => {
  try {
    const { customerId, status = "delivered", notes, date } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const deliveryDate = date ? new Date(date) : new Date();
    deliveryDate.setHours(0, 0, 0, 0);

    // Prevent duplicates for the same customer + date
    const existing = await Delivery.findOne({ customer: customerId, date: deliveryDate });
    if (existing) {
      return res.status(400).json({ success: false, message: "Delivery already exists for this customer today" });
    }

    const delivery = new Delivery({
      customer: customerId,
      status,
      notes,
      date: deliveryDate,
    });

    await delivery.save();
    res.status(201).json({ success: true, delivery });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error saving delivery", error: err.message });
  }
});

/**
 * 📌 Add multiple deliveries at once (bulk for today)
 * Body: { customerIds: [], status?, date? }
 */
router.post("/bulk", async (req, res) => {
  try {
    const { customerIds = [], status = "delivered", date } = req.body;

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ success: false, message: "No customerIds provided" });
    }

    const deliveryDate = date ? new Date(date) : new Date();
    deliveryDate.setHours(0, 0, 0, 0);

    // Filter out customers who already have a delivery for that date
    const existingDeliveries = await Delivery.find({
      customer: { $in: customerIds },
      date: deliveryDate,
    }).select("customer");

    const existingIds = existingDeliveries.map(d => d.customer.toString());
    const newDeliveries = customerIds
      .filter(id => !existingIds.includes(id))
      .map(id => ({
        customer: id,
        status,
        date: deliveryDate,
      }));

    if (newDeliveries.length === 0) {
      return res.status(400).json({ success: false, message: "All customers already have deliveries on this date" });
    }

    const saved = await Delivery.insertMany(newDeliveries);
    res.status(201).json({ success: true, deliveries: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error saving bulk deliveries", error: err.message });
  }
});

/**
 * 📌 Get deliveries for a given date (or today if not provided)
 * Example: GET /api/deliveries?date=YYYY-MM-DD
 */
router.get("/", async (req, res) => {
  try {
    let { date } = req.query;
    let target = date ? new Date(date) : new Date();
    target.setHours(0, 0, 0, 0);

    let nextDay = new Date(target);
    nextDay.setDate(target.getDate() + 1);

    const deliveries = await Delivery.find({
      date: { $gte: target, $lt: nextDay },
    }).populate("customer", "name phone address");

    res.json({ success: true, deliveries });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching deliveries", error: err.message });
  }
});

/**
 * 📌 Get a specific delivery by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id).populate("customer");
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
    res.json({ success: true, delivery });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching delivery", error: err.message });
  }
});

/**
 * 📌 Update a delivery
 * Body: { status?, notes? }
 */
router.put("/:id", async (req, res) => {
  try {
    const { status, notes } = req.body;

    const updated = await Delivery.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Delivery not found" });
    res.json({ success: true, delivery: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating delivery", error: err.message });
  }
});

/**
 * 📌 Delete a delivery
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Delivery.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Delivery not found" });
    res.json({ success: true, message: "Delivery deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting delivery", error: err.message });
  }
});

module.exports = router;
