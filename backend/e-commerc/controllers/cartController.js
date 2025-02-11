const Order = require("../models/Order");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    console.log("Authenticated User:", req.user);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    } else {
      cart = new Cart({
        user: req.user.id,
        items: [{ product: productId, quantity }],
      });
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    console.error("Error adding to cart:", error); // ✅ Log the full error
    res.status(500).json({ message: "Server error", error });
  }
};

// Increment quantity handler
const incrementQuantity = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product in the cart
    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Increment the quantity
    item.quantity += 1;

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: "Quantity incremented", cart });
  } catch (error) {
    console.error("Error incrementing quantity:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Decrement quantity handler
const decrementQuantity = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product in the cart
    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Decrement the quantity, ensuring it doesn't go below 1
    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      return res.status(400).json({ message: "Quantity can't be less than 1" });
    }

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: "Quantity decremented", cart });
  } catch (error) {
    console.error("Error decrementing quantity:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  const { productId } = req.params; // Get productId from URL parameter
  const userId = req.user.id; // Get the authenticated user's ID

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product index in the cart's items
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Remove the product from the cart
    cart.items.splice(itemIndex, 1);

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getCart = async (req, res) => {
  const userId = req.user.id; // Assuming you're using JWT authentication

  try {
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      populate: { path: "category" }, // Populating the category inside product
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Calculate total price for each item and overall total
    const cartItems = cart.items.map((item) => {
      const totalPrice = item.product.price * item.quantity;
      return {
        ...item.toObject(),
        totalPrice, // Add the calculated totalPrice for the item
      };
    });

    // Calculate overall total price of the cart
    const totalCartPrice = cartItems.reduce(
      (total, item) => total + item.totalPrice,
      0
    );

    res.status(200).json({ cartItems, totalCartPrice });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  addToCart,

  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  getCart,
};
