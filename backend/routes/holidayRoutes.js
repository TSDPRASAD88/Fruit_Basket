const express = require("express");
const Delivery = require("../models/Delivery");
const Customer = require("../models/Customer");

const router = express.Router();

// Mark a date as holiday
router.post("/", async (req, res) => {
  try {
    const { date } = req.body;

    const customers = await Customer.find({ active: true });

    // Bulk update deliveries for all active customers
    const bulkOps = customers.map(c => ({
      updateOne: {
        filter: { customer: c._id, date: new Date(date) },
        update: { status: "missed" },
        upsert: true, // create if doesn't exist
      },
    }));

    await Delivery.bulkWrite(bulkOps);

    res.json({ message: "Holiday set for all customers ✅" });
  } catch (err) {
    res.status(500).json({ message: "Error setting holiday", error: err.message });
  }
});

module.exports = router;
