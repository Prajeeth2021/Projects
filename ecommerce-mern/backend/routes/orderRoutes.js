const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const auth = require("../middleware/auth");

// @route   POST /api/orders/create
// @desc    Create new order from cart
// @access  Private
router.post("/create", auth, async (req, res) => {
    try {
        const {
            shippingAddress,
            paymentMethod,
            orderItems,
            taxPrice,
            shippingPrice,
            notes
        } = req.body;

        // Validate required fields
        if (!shippingAddress || !paymentMethod || !orderItems || orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Shipping address, payment method, and order items are required"
            });
        }

        // Validate shipping address
        const { address, city, postalCode, country } = shippingAddress;
        if (!address || !city || !postalCode || !country) {
            return res.status(400).json({
                success: false,
                message: "Complete shipping address is required"
            });
        }

        // Calculate total price
        const itemsTotal = orderItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        const totalPrice = itemsTotal + (taxPrice || 0) + (shippingPrice || 0);

        // Create order
        const order = new Order({
            user: req.user.id,
            orderItems,
            shippingAddress,
            paymentMethod,
            taxPrice: taxPrice || 0,
            shippingPrice: shippingPrice || 0,
            totalPrice,
            notes,
            orderStatus: 'pending',
            paymentStatus: 'pending'
        });

        const savedOrder = await order.save();

        // Clear user's cart
        const cart = await Cart.findByUserId(req.user.id);
        if (cart) {
            await cart.clearCart();
        }

        res.status(201).json({
            success: true,
            order: savedOrder,
            message: "Order created successfully"
        });

    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   GET /api/orders/user/:userId
// @desc    Get user's order history
// @access  Private
router.get("/user/:userId", auth, async (req, res) => {
    try {
        const { userId } = req.params;

        // Users can only view their own orders
        if (userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('orderItems.productId', 'name imageUrl');

        res.json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("Get user orders error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   GET /api/orders/:id
// @desc    Get specific order details
// @access  Private
router.get("/:id", auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('orderItems.productId', 'name imageUrl description price');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Users can only view their own orders
        if (order.user._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        res.json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Get order error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin only for now)
// @access  Private
router.put("/:id/status", auth, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        await order.updateStatus(status);

        res.json({
            success: true,
            order,
            message: "Order status updated successfully"
        });

    } catch (error) {
        console.error("Update order status error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   PUT /api/orders/:id/payment
// @desc    Update payment status
// @access  Private
router.put("/:id/payment", auth, async (req, res) => {
    try {
        const { status, paymentResult } = req.body;

        if (!['pending', 'paid', 'failed', 'refunded'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment status"
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Users can only update their own orders
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        await order.updatePaymentStatus(status, paymentResult);

        res.json({
            success: true,
            order,
            message: "Payment status updated successfully"
        });

    } catch (error) {
        console.error("Update payment status error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   PUT /api/orders/:id/tracking
// @desc    Add tracking number to order
// @access  Private
router.put("/:id/tracking", auth, async (req, res) => {
    try {
        const { trackingNumber } = req.body;

        if (!trackingNumber) {
            return res.status(400).json({
                success: false,
                message: "Tracking number is required"
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        await order.addTrackingNumber(trackingNumber);

        res.json({
            success: true,
            order,
            message: "Tracking number added successfully"
        });

    } catch (error) {
        console.error("Add tracking number error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   GET /api/orders/number/:orderNumber
// @desc    Get order by order number
// @access  Private
router.get("/number/:orderNumber", auth, async (req, res) => {
    try {
        const order = await Order.findByOrderNumber(req.params.orderNumber);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Users can only view their own orders
        if (order.user._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        res.json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Get order by number error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

module.exports = router;