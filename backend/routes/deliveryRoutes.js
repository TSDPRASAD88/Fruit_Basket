// routes/deliveryRoutes.js
const express = require("express");
const Delivery = require("../models/Delivery");
const Customer = require("../models/Customer");

const router = express.Router();

/**
 * 📌 Add a single delivery (default = today)
 * NOTE: This relies on the unique compound index (customer + date) on the Delivery model
 * Body: { customerId, status?, notes?, date? }
 */
router.post("/", async (req, res) => {
  try {
    const { customerId, status = "delivered", notes, date } = req.body;

    // 1. Validate Customer existence
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    // 2. Normalize the date to midnight local time for date comparison
    const deliveryDate = date ? new Date(date) : new Date();
    deliveryDate.setHours(0, 0, 0, 0);

    // 3. Create and save the new delivery document
    const delivery = new Delivery({
      customer: customerId,
      status,
      notes,
      date: deliveryDate,
    });

    // Mongoose unique index will handle duplicate checks during save
    await delivery.save();
    res.status(201).json({ success: true, delivery });
  } catch (err) {
    // Check for Mongoose duplicate key error (E11000)
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Delivery already exists for this customer on this date",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error saving delivery",
      error: err.message,
    });
  }
});


/**
 * 📌 New bulk upsert endpoint
 * This endpoint will either create a new delivery or update an existing one.
 * Body: { deliveries: [{ customerId, status, date }] }
 */
router.post("/bulk-upsert", async (req, res) => {
  try {
    const { deliveries } = req.body;

    if (!Array.isArray(deliveries) || deliveries.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No deliveries provided" });
    }

    const operations = deliveries.map((d) => {
      // Normalize the date to midnight UTC to avoid timezone issues
      const deliveryDate = new Date(d.date);
      deliveryDate.setUTCHours(0, 0, 0, 0);

      // Define the date range for the day
      const nextDay = new Date(deliveryDate);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);

      return {
        updateOne: {
          filter: {
            customer: d.customerId,
            // Use date range query for safety, although the unique index should handle exact date matches
            date: { $gte: deliveryDate, $lt: nextDay }, 
          },
          update: {
            // Only update status and date
            $set: { status: d.status, date: deliveryDate },
          },
          upsert: true, // This is the key: it inserts if no document is found
        },
      };
    });

    const result = await Delivery.bulkWrite(operations);
    res.status(200).json({
      success: true,
      message: "Deliveries saved/updated",
      result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error saving bulk deliveries",
      error: err.message,
    });
  }
});


/**
 * 📌 Get deliveries for a given date (or today if not provided)
 * Used for the Main Dashboard's "Today's Deliveries" list.
 * Example: GET /api/deliveries?date=YYYY-MM-DD
 */
router.get("/", async (req, res) => {
  try {
    let { date } = req.query;
    let target = date ? new Date(date) : new Date();
    target.setHours(0, 0, 0, 0);

    let nextDay = new Date(target);
    nextDay.setDate(target.getDate() + 1);

    // Populate customer info to display name, phone, etc., on the dashboard
    const deliveries = await Delivery.find({
      date: { $gte: target, $lt: nextDay },
    }).populate("customer", "name phone address mealPlan"); // Included mealPlan for context

    res.json({ success: true, deliveries });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching deliveries",
      error: err.message,
    });
  }
});


/**
 * 📌 Get a specific delivery by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id).populate("customer");
    if (!delivery)
      return res
        .status(404)
        .json({ success: false, message: "Delivery not found" });
    res.json({ success: true, delivery });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching delivery",
      error: err.message,
    });
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
    ).populate("customer");

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Delivery not found" });
    res.json({ success: true, delivery: updated });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating delivery",
      error: err.message,
    });
  }
});


/**
 * 📌 Delete a delivery
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Delivery.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Delivery not found" });
    res.json({ success: true, message: "Delivery deleted" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting delivery",
      error: err.message,
    });
  }
});

module.exports = router;