const express = require("express");
const Customer = require("../models/Customer");
const Delivery = require("../models/Delivery"); // Import Delivery model
const router = express.Router();

// =======================================================
// 1. GET ALL CUSTOMERS (Fixes the 404 error on /api/customers)/
// =======================================================
router.get("/", async (req, res) => {
    try {
        // Fetch all customers, excluding the Mongoose version key
        const customers = await Customer.find().select('-__v'); 
        res.json(customers);
    } catch (err) {
        console.error("Error fetching all customers:", err);
        res.status(500).json({ error: 'Server error fetching customer list.' });
    }
});

// =======================================================
// 2. GET SINGLE CUSTOMER (For editing/viewing details)
// =======================================================
router.get("/:id", async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id).select('-__v');
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.json(customer);
    } catch (err) {
        console.error("Error fetching single customer:", err);
        res.status(500).json({ error: 'Error fetching customer details.' });
    }
});

// =======================================================
// 3. CREATE NEW CUSTOMER
// =======================================================
router.post("/", async (req, res) => {
    try {
        // Assuming your Customer model handles fields like name, phone, address
        const newCustomer = new Customer(req.body);
        const savedCustomer = await newCustomer.save();
        res.status(201).json(savedCustomer);
    } catch (err) {
        console.error("Error creating customer:", err);
        // Use status 400 for validation errors or bad input
        res.status(400).json({ error: 'Failed to create customer.', details: err.message });
    }
});

// =======================================================
// 4. UPDATE EXISTING CUSTOMER
// =======================================================
router.put("/:id", async (req, res) => {
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // Return the new document and run validation
        ).select('-__v');

        if (!updatedCustomer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.json(updatedCustomer);
    } catch (err) {
        console.error("Error updating customer:", err);
        res.status(400).json({ error: 'Failed to update customer.', details: err.message });
    }
});

// =======================================================
// 5. DELETE CUSTOMER
// =======================================================
router.delete("/:id", async (req, res) => {
    try {
        const result = await Customer.findByIdAndDelete(req.params.id);
        
        if (!result) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Optional: Also delete related deliveries
        await Delivery.deleteMany({ customer: req.params.id });

        res.status(200).json({ message: "Customer and related deliveries deleted successfully" });
    } catch (err) {
        console.error("Error deleting customer:", err);
        res.status(500).json({ error: 'Failed to delete customer.' });
    }
});


// =======================================================
// 6. GET CUSTOMER DELIVERY HISTORY & STATS (Your original route)
// =======================================================
router.get("/:id/history", async (req, res) => {
  try {
    const customerId = req.params.id;

    // 1. Validate Customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // 2. Fetch all delivery records for this customer
    // The Delivery model is correctly imported and used.
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
        deliveredCount: deliveredCount, 
        absentCount: absentCount,
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