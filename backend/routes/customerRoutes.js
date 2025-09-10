const express = require("express");
const Customer = require("../models/Customer");
const Delivery = require("../models/Delivery"); // Make sure this exists

const router = express.Router();

// @desc    Get all customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// @desc    Get single customer
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: "Error fetching customer", error: err.message });
  }
});

// @desc    Update customer and recalc calendar
router.put("/:id", async (req, res) => {
  try {
    const { status, ...otherFields } = req.body;
    const customerId = req.params.id;

    // 1️⃣ Update customer fields
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { ...otherFields, status },
      { new: true }
    );

    if (!updatedCustomer)
      return res.status(404).json({ message: "Customer not found" });

    // 2️⃣ Recalculate delivery calendar for current month
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    let updatedCalendar = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month - 1, day)
        .toISOString()
        .split("T")[0];
      const weekDay = new Date(year, month - 1, day).getDay(); // 0 = Sunday

      if (status === "Holiday" || weekDay === 0) {
        // Automatically mark as missed
        updatedCalendar[dateStr] = { marked: true, dotColor: "red" };
      } else {
        // Check if a delivery exists for this day
        const delivery = await Delivery.findOne({
          customer: customerId,
          date: dateStr,
        });

        updatedCalendar[dateStr] = {
          marked: true,
          dotColor: delivery?.status === "delivered" ? "green" : "red",
        };
      }
    }

    // 3️⃣ Return updated customer & calendar
    res.json({ customer: updatedCustomer, calendar: updatedCalendar });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error updating customer", error: err.message });
  }
});

// @desc    Delete customer
router.delete("/:id", async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting customer", error: err.message });
  }
});

// @desc    Add new customer
router.post("/", async (req, res) => {
  try {
    const { name, phone, address, status = "Working", active = true } = req.body;
    const newCustomer = new Customer({ name, phone, address, status, active });
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: "Error adding customer", error: err.message });
  }
});

module.exports = router;
