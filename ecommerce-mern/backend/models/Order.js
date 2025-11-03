const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String
    }
});

const shippingAddressSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    }
});

const paymentResultSchema = new mongoose.Schema({
    id: {
        type: String
    },
    status: {
        type: String
    },
    update_time: {
        type: String
    },
    email_address: {
        type: String
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
        type: String,
        required: true,
        enum: ['credit_card', 'debit_card', 'paypal', 'apple_pay']
    },
    paymentResult: paymentResultSchema,
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    trackingNumber: {
        type: String
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to generate order number and calculate totals
orderSchema.pre('save', function(next) {
    // Generate order number if not present
    if (!this.orderNumber) {
        const date = new Date();
        const timestamp = date.getTime();
        const random = Math.floor(Math.random() * 10000);
        this.orderNumber = `ORD-${timestamp}-${random}`;
    }

    // Calculate total price
    const itemsTotal = this.orderItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    this.totalPrice = itemsTotal + this.taxPrice + this.shippingPrice;
    this.updatedAt = Date.now();

    next();
});

// Static methods
orderSchema.statics.findByUserId = function(userId) {
    return this.find({ user: userId }).sort({ createdAt: -1 });
};

orderSchema.statics.findByOrderNumber = function(orderNumber) {
    return this.findOne({ orderNumber }).populate('user orderItems.productId');
};

// Instance methods
orderSchema.methods.updateStatus = function(status) {
    this.orderStatus = status;

    if (status === 'delivered') {
        this.isDelivered = true;
        this.deliveredAt = Date.now();
    }

    return this.save();
};

orderSchema.methods.updatePaymentStatus = function(status, paymentResult = null) {
    this.paymentStatus = status;

    if (paymentResult) {
        this.paymentResult = paymentResult;
    }

    return this.save();
};

orderSchema.methods.addTrackingNumber = function(trackingNumber) {
    this.trackingNumber = trackingNumber;
    if (this.orderStatus === 'pending') {
        this.orderStatus = 'processing';
    }
    return this.save();
};

module.exports = mongoose.model("Order", orderSchema);