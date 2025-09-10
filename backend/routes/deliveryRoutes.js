const express = require("express");
const Delivery = require("../models/Delivery");
const Customer = require("../models/Customer");

const router = express.Router();

// -----------------------------
// Add new delivery
// -----------------------------
router.post("/", async (req, res) => {
  try {
    const { customer, date, status, notes } = req.body;
    const delivery = new Delivery({ customer, date, status, notes });
    await delivery.save();
    res.status(201).json(delivery);
  } catch (err) {
    res.status(400).json({ message: "Error adding delivery", error: err.message });
  }
});

// -----------------------------
// Get deliveries by date (with automatic Sunday handling)
// -----------------------------
router.get("/by-date/:date", async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const day = date.getDay(); // 0 = Sunday

    const customers = await Customer.find({ active: true });

    if (day === 0) {
      // Automatically mark all active customers as missed on Sunday
      const bulkOps = customers.map(c => ({
        updateOne: {
          filter: { customer: c._id, date },
          update: { status: "missed" },
          upsert: true,
        },
      }));
      await Delivery.bulkWrite(bulkOps);

      const deliveries = await Delivery.find({ date }).populate("customer");
      return res.json(deliveries);
    }

    // Normal day
    const deliveries = await Delivery.find({ date }).populate("customer");
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// -----------------------------
// Update delivery
// -----------------------------
router.put("/:id", async (req, res) => {
  try {
    const updatedDelivery = await Delivery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedDelivery);
  } catch (err) {
    res.status(400).json({ message: "Error updating delivery", error: err.message });
  }
});

// -----------------------------
// Delete delivery
// -----------------------------
router.delete("/:id", async (req, res) => {
  try {
    await Delivery.findByIdAndDelete(req.params.id);
    res.json({ message: "Delivery deleted" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting delivery", error: err.message });
  }
});

// -----------------------------
// Get delivery stats for a customer for a specific month
// -----------------------------
router.get("/stats/:customerId/:year/:month", async (req, res) => {
  try {
    const { customerId, year, month } = req.params;

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const deliveries = await Delivery.find({
      customer: customerId,
      date: { $gte: startDate, $lte: endDate },
    });

    const deliveredDays = deliveries.filter(d => d.status === "delivered").length;
    const missedDays = deliveries.filter(d => d.status === "missed").length;

    res.json({ deliveredDays, missedDays, totalDays: deliveries.length });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
});

module.exports = router;
