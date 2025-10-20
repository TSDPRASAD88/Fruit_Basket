const express = require("express");
const Customer = require("../models/Customer");
const Delivery = require("../models/Delivery"); // 👈 Import Delivery model
const router = express.Router();

// ... [Existing CRUD routes (GET /, GET /:id, POST /, PUT /:id, DELETE /:id) remain here] ...

// -----------------------------------------------------
// 📌 NEW: Get a Customer's Full Delivery History & Stats
// -----------------------------------------------------
router.get("/:id/history", async (req, res) => {
  try {
    const customerId = req.params.id;

    // 1. Validate Customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // 2. Fetch all delivery records for this customer
    const deliveries = await Delivery.find({ customer: customerId }).sort({
      date: 1,
    });

    // 3. Calculate statistics
    const totalDays = deliveries.length;
    const deliveredCount = deliveries.filter(
      (d) => d.status === "delivered"
    ).length;
    const absentCount = totalDays - deliveredCount;

    // 4. Respond with data
    res.json({
      customer,
      deliveries, // Array of {date, status} for the calendar view
      stats: {
        totalDays: totalDays,
        deliveredCount: deliveredCount, // 'No of days delivered'
        absentCount: absentCount, // 'No of days absent'
      },
    });
  } catch (err) {
    res.status(500).json({
      error: "Error fetching customer history",
      details: err.message,
    });
  }
});

module.exports = router;