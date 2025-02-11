const Order = require("../models/Order");
const Cart = require("../models/Cart");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body; // Amount in cents (e.g., $10 = 1000 cents)

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret, // Send this to the frontend
      paymentIntentId: paymentIntent.id, // Include this
    });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ message: "Payment failed", error });
  }
};

const placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentIntentId } = req.body;
    console.log("Order items:", items);
    console.log("PaymentIntentId:", paymentIntentId);

    // Validate items: Ensure each item has a product ID and valid quantity/price
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items cannot be empty" });
    }

    for (let item of items) {
      if (!item.product) {
        return res
          .status(400)
          .json({ message: "Product ID is required for each item" });
      }
      if (!item.quantity || item.quantity <= 0) {
        return res
          .status(400)
          .json({ message: "Quantity must be greater than zero" });
      }
      if (!item.price || item.price <= 0) {
        return res
          .status(400)
          .json({ message: "Price must be greater than zero" });
      }
      item.totalPrice = item.price * item.quantity; // Calculate total price per item
    }

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.country
    ) {
      return res
        .status(400)
        .json({ message: "Shipping address is incomplete" });
    }

    // Process payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment failed" });
    }

    // Calculate total price
    const totalPrice = items.reduce(
      (total, item) => total + item.totalPrice,
      0
    );

    // Create and save the order
    const newOrder = new Order({
      user: req.user.id, // Assuming user ID is available in req.user
      items,
      shippingAddress,
      totalPrice,
      paymentIntentId,
      status: "paid", // Order is marked as paid after successful payment
    });
    console.log("New Order Object:", newOrder);
    await newOrder.save();

    // Populate the product details for each item in the order
    await newOrder.populate("items.product"); // No .execPopulate() needed

    // Respond with order success
    res
      .status(200)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Error placing order", error: error.message });
    }
  }
};

// Fetch orders for a user
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id; // Ensure req.user contains the user's ID
    console.log("Fetching orders for user:", userId);

    // Fetch orders for the user and populate the items.product field
    const orders = await Order.find({ user: userId }).populate("items.product");

    console.log("Orders fetched:", orders);

    // If no orders found, send a message
    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin: Fetch all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user")
      .populate("items.product");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  createPaymentIntent,
};
