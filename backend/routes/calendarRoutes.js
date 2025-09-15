const express = require("express");
const Delivery = require("../models/Delivery");
const router = express.Router();

router.get("/:customerId/:year/:month", async (req, res) => {
  try {
    const { customerId, year, month } = req.params;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const deliveries = await Delivery.find({
      customer: customerId,
      date: { $gte: start, $lte: end },
    });

    let markedDates = {};
    deliveries.forEach(d => {
      const dateKey = d.date.toISOString().split("T")[0];
      markedDates[dateKey] = {
        marked: true,
        dotColor: d.status === "delivered" ? "green" : "red",
      };
    });

    res.json(markedDates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
