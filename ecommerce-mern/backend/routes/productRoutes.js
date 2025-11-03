const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// @route   GET /api/products
// @desc    Get all products with pagination, filtering, and sorting
// @access  Public
router.get("/", async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            search,
            category,
            minPrice = 0,
            maxPrice = 10000,
            sort = 'createdAt:desc',
            featured
        } = req.query;

        // Build query
        let query = { isActive: true };

        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Price range filter
        query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };

        // Featured filter
        if (featured === 'true') {
            query.featured = true;
        }

        // Sorting
        const [sortBy, sortOrder] = sort.split(':');
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query
        const products = await Product.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (!product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not available"
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error("Get product error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get("/featured/list", async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        const products = await Product.find({ featured: true, isActive: true })
            .sort({ rating: -1, createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error("Get featured products error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get("/categories/list", async (req, res) => {
    try {
        const categories = await Product.distinct('category', { isActive: true });

        res.json({
            success: true,
            categories: categories.sort()
        });
    } catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   GET /api/products/search
// @desc    Search products with advanced filters
// @access  Public
router.get("/search/query", async (req, res) => {
    try {
        const {
            q,
            category,
            minPrice = 0,
            maxPrice = 10000,
            sortBy = 'name',
            sortOrder = 'asc',
            page = 1,
            limit = 12
        } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const products = await Product.searchProducts(q, category, sortBy, sortOrder)
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const total = await Product.countDocuments({
            isActive: true,
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } },
                { brand: { $regex: q, $options: 'i' } }
            ],
            ...(category && { category })
        });

        res.json({
            success: true,
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            query: q
        });
    } catch (error) {
        console.error("Search products error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Admin only - for now)
router.post("/", async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            countInStock = 0,
            imageUrl,
            images,
            tags,
            brand,
            weight,
            dimensions,
            featured = false
        } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({
                success: false,
                message: "Name, price, and category are required"
            });
        }

        const product = new Product({
            name,
            description,
            price,
            category,
            countInStock,
            imageUrl,
            images,
            tags,
            brand,
            weight,
            dimensions,
            featured
        });

        const savedProduct = await product.save();

        res.status(201).json({
            success: true,
            product: savedProduct
        });
    } catch (error) {
        console.error("Create product error:", error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Product with this SKU already exists"
            });
        }
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Admin only - for now)
router.put("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            product: updatedProduct
        });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (soft delete by setting isActive to false)
// @access  Private (Admin only - for now)
router.delete("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        product.isActive = false;
        await product.save();

        res.json({
            success: true,
            message: "Product deactivated successfully"
        });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

module.exports = router;
