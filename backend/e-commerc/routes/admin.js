const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const User = require("../models/User");

const router = express.Router();

// Example: Admin can view all users
// router.get("/users", protect, admin, (req, res) => {
//   // This could be a function that fetches users from the database
//   res.json({ message: "Fetching all users" });
// });

// Admin route to fetch all users
router.get("/users", protect, admin, async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    // Send the list of users as the response
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Example: Admin can delete a product
router.delete("/product/:id", protect, admin, (req, res) => {
  const productId = req.params.id;
  // This could be a function that deletes a product from the database
  res.json({ message: `Product ${productId} deleted` });
});

// Add more admin-specific routes here

module.exports = router;
