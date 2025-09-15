const express = require("express");
const Delivery = require("../models/Delivery");
const router = express.Router();

router.get("/:customerId/:year/:month", async (req, res) => {
  try {
    const { customerId, year, month } = req.params;
    const pricePerDay = 50; // fixed price

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const deliveries = await Delivery.find({
      customer: customerId,
      date: { $gte: start, $lte: end },
    });

    const delivered = deliveries.filter(d => d.status === "delivered").length;
    const missed = deliveries.filter(d => d.status === "missed").length;
    const totalAmount = delivered * pricePerDay;

    res.json({ delivered, missed, totalDays: deliveries.length, totalAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
