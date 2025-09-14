const express = require("express");
const Delivery = require("../models/Delivery");
// const Holiday = require("../models/Holiday");
const Bill = require("../models/Bill");

const router = express.Router();

/**
 * API: GET /api/calendar/:customerId/:year/:month
 * Returns marked dates in format:
 * {
 *   "2025-09-01": { marked: true, dotColor: "green" },
 *   "2025-09-02": { marked: true, dotColor: "red" }
 * }
 */
router.get("/:customerId/:year/:month", async (req, res) => {
  try {
    const { customerId, year, month } = req.params;

    // Build date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // last day of month

    // Fetch deliveries for this customer & month
    const deliveries = await Delivery.find({
      customer: customerId,
      date: { $gte: startDate, $lte: endDate },
    });

    // Fetch holidays (optional, if you want to mark them differently)
    const holidays = await Holiday.find({
      date: { $gte: startDate, $lte: endDate },
    });

    let markedDates = {};

    // ✅ Mark deliveries
    deliveries.forEach((d) => {
      const dateKey = d.date.toISOString().split("T")[0]; // YYYY-MM-DD
      markedDates[dateKey] = {
        marked: true,
        dotColor: d.status === "delivered" ? "green" : "red",
      };
    });

    // ✅ Mark holidays (yellow dots for example)
    holidays.forEach((h) => {
      const dateKey = h.date.toISOString().split("T")[0];
      markedDates[dateKey] = {
        marked: true,
        dotColor: "red", // or maybe "yellow" if you add to frontend
      };
    });

    res.json(markedDates);
  } catch (err) {
    console.error("Error fetching calendar:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
