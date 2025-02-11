const express = require("express");
const {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  getCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const router = express.Router();

// Add to cart
router.post("/add", protect, addToCart);
router.get("/", protect, getCart);

router.put("/increment/:productId", protect, incrementQuantity);
router.put("/decrement/:productId", protect, decrementQuantity);
router.delete("/remove/:productId", protect, removeFromCart);

module.exports = router;
