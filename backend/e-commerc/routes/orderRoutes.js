const express = require("express");
const {
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  createPaymentIntent,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const router = express.Router();

router.post("/", protect, placeOrder); // Place an order

router.post("/create-payment-intent", protect, createPaymentIntent); // Create payment intent route

router.get("/get-order", protect, getUserOrders); // Get user's orders
router.get("/all", protect, admin, getAllOrders); // Get all orders (Admin)
router.put("/:orderId", protect, admin, updateOrderStatus); // Update order status (Admin)

module.exports = router;
