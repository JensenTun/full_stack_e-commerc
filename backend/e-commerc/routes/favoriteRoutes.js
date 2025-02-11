const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  addFavorite,
  removeFavorite,
  getFavorites,
} = require("../controllers/favoriteController");

const router = express.Router();

router.post("/add", protect, addFavorite);
router.post("/remove", protect, removeFavorite);
router.get("/", protect, getFavorites);

module.exports = router;
