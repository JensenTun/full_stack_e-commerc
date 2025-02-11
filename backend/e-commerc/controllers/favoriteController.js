const User = require("../models/User");
const Product = require("../models/Product");

// Add product to favorites
const addFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { productId } = req.body;
    console.log("productId" + productId);

    if (user.favorites.includes(productId)) {
      return res.status(400).json({ message: "Product already in favorites" });
    }

    user.favorites.push(productId);
    await user.save();

    res.status(200).json({ message: "Product added to favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove product from favorites
const removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { productId } = req.body;

    user.favorites = user.favorites.filter((id) => id.toString() !== productId);

    await user.save();

    res.status(200).json({ message: "Product removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "favorites",
      model: "Product",
      populate: { path: "category", model: "Category" }, // Populate category as well
    });
    res.status(200).json(user.favorites); // Ensure this is an array
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addFavorite, removeFavorite, getFavorites };
