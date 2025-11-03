const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

// Middleware to authenticate user for all cart routes
router.use(auth);

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get("/", async (req, res) => {
    try {
        let cart = await Cart.findByUserId(req.user.id);

        if (!cart) {
            // Create empty cart for user
            cart = new Cart({
                userId: req.user.id,
                items: [],
                totalAmount: 0
            });
            await cart.save();
        }

        // Populate product details
        await cart.populate('items.productId');

        res.json({
            success: true,
            cart: {
                id: cart._id,
                items: cart.items.map(item => ({
                    id: item._id,
                    product: {
                        id: item.productId._id,
                        name: item.productId.name,
                        price: item.productId.price,
                        imageUrl: item.productId.imageUrl,
                        category: item.productId.category,
                        countInStock: item.productId.countInStock
                    },
                    quantity: item.quantity,
                    priceAtTime: item.priceAtTime,
                    subtotal: item.priceAtTime * item.quantity
                })),
                totalAmount: cart.totalAmount,
                itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
            }
        });
    } catch (error) {
        console.error("Get cart error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post("/add", async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Validate product exists and is in stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (!product.isActive) {
            return res.status(400).json({
                success: false,
                message: "Product is not available"
            });
        }

        if (product.countInStock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.countInStock} items available in stock`
            });
        }

        // Get or create user's cart
        let cart = await Cart.findByUserId(req.user.id);
        if (!cart) {
            cart = new Cart({
                userId: req.user.id,
                items: [],
                totalAmount: 0
            });
        }

        // Add item to cart
        await cart.addItem(productId, quantity, product.price);

        // Populate product details and return updated cart
        await cart.populate('items.productId');

        res.json({
            success: true,
            message: "Item added to cart",
            cart: {
                id: cart._id,
                items: cart.items.map(item => ({
                    id: item._id,
                    product: {
                        id: item.productId._id,
                        name: item.productId.name,
                        price: item.productId.price,
                        imageUrl: item.productId.imageUrl,
                        category: item.productId.category,
                        countInStock: item.productId.countInStock
                    },
                    quantity: item.quantity,
                    priceAtTime: item.priceAtTime,
                    subtotal: item.priceAtTime * item.quantity
                })),
                totalAmount: cart.totalAmount,
                itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
            }
        });
    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   PUT /api/cart/update
// @desc    Update item quantity in cart
// @access  Private
router.put("/update", async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (quantity < 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be non-negative"
            });
        }

        const cart = await Cart.findByUserId(req.user.id);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Check if product exists and has sufficient stock
        if (quantity > 0) {
            const product = await Product.findById(productId);
            if (!product || !product.isActive) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found or not available"
                });
            }

            if (product.countInStock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.countInStock} items available in stock`
                });
            }
        }

        await cart.updateItemQuantity(productId, quantity);
        await cart.populate('items.productId');

        res.json({
            success: true,
            message: "Cart updated",
            cart: {
                id: cart._id,
                items: cart.items.map(item => ({
                    id: item._id,
                    product: {
                        id: item.productId._id,
                        name: item.productId.name,
                        price: item.productId.price,
                        imageUrl: item.productId.imageUrl,
                        category: item.productId.category,
                        countInStock: item.productId.countInStock
                    },
                    quantity: item.quantity,
                    priceAtTime: item.priceAtTime,
                    subtotal: item.priceAtTime * item.quantity
                })),
                totalAmount: cart.totalAmount,
                itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
            }
        });
    } catch (error) {
        console.error("Update cart error:", error);
        if (error.message === 'Item not found in cart') {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   DELETE /api/cart/remove/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete("/remove/:itemId", async (req, res) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findByUserId(req.user.id);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        await cart.removeItem(itemId);
        await cart.populate('items.productId');

        res.json({
            success: true,
            message: "Item removed from cart",
            cart: {
                id: cart._id,
                items: cart.items.map(item => ({
                    id: item._id,
                    product: {
                        id: item.productId._id,
                        name: item.productId.name,
                        price: item.productId.price,
                        imageUrl: item.productId.imageUrl,
                        category: item.productId.category,
                        countInStock: item.productId.countInStock
                    },
                    quantity: item.quantity,
                    priceAtTime: item.priceAtTime,
                    subtotal: item.priceAtTime * item.quantity
                })),
                totalAmount: cart.totalAmount,
                itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
            }
        });
    } catch (error) {
        console.error("Remove from cart error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete("/clear", async (req, res) => {
    try {
        const cart = await Cart.findByUserId(req.user.id);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        await cart.clearCart();

        res.json({
            success: true,
            message: "Cart cleared",
            cart: {
                id: cart._id,
                items: [],
                totalAmount: 0,
                itemCount: 0
            }
        });
    } catch (error) {
        console.error("Clear cart error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

module.exports = router;