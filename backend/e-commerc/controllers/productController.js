const Product = require("../models/Product");

// Create a new product
const createProduct = async (req, res) => {
  const { name, price, category, isFeatured } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !price || !category || !image) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const product = new Product({
      name,
      price,
      category,
      image, // Store only the filename
      isFeatured,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a product
// Update a product
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    // Handle image update if an image file is uploaded
    if (req.file) {
      updateData.image = req.file.filename; // Save image filename
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      {
        new: true, // Return the updated product
        runValidators: true, // Ensure data validation
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a product
// Delete a product along with its image
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete the image file if it exists
    if (product.image) {
      const imagePath = path.join(__dirname, "../uploads/", product.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting image:", err);
        }
      });
    }

    // Delete the product from the database
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product and image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get products by category ID
const getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const products = await Product.find({ category: categoryId }).populate(
      "category",
      "name"
    );

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this category." });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
};
