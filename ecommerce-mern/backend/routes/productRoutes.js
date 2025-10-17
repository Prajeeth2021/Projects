const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/products
// @desc    Add a new product
// @access  Public (or Protected later)
router.post("/", async (req, res) => {
    const { name, description, price, countInStock, imageUrl } = req.body;

    if (!name || !price) {
        return res.status(400).json({ message: "Name and price are required" });
    }

    try {
        const product = new Product({
            name,
            description,
            price,
            countInStock: countInStock || 0,
            imageUrl,
        });

        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
