const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    priceAtTime: {
        type: Number,
        required: true
    }
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0
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

// Pre-save middleware to calculate total amount
cartSchema.pre('save', function(next) {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.priceAtTime * item.quantity);
    }, 0);
    this.updatedAt = Date.now();
    next();
});

// Static methods
cartSchema.statics.findByUserId = function(userId) {
    return this.findOne({ userId }).populate('items.productId');
};

// Instance methods
cartSchema.methods.addItem = function(productId, quantity, price) {
    const existingItem = this.items.find(item =>
        item.productId.toString() === productId.toString()
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.items.push({
            productId,
            quantity,
            priceAtTime: price
        });
    }

    return this.save();
};

cartSchema.methods.updateItemQuantity = function(productId, quantity) {
    const item = this.items.find(item =>
        item.productId.toString() === productId.toString()
    );

    if (item) {
        if (quantity <= 0) {
            this.items = this.items.filter(item =>
                item.productId.toString() !== productId.toString()
            );
        } else {
            item.quantity = quantity;
        }
        return this.save();
    }

    throw new Error('Item not found in cart');
};

cartSchema.methods.removeItem = function(productId) {
    this.items = this.items.filter(item =>
        item.productId.toString() !== productId.toString()
    );
    return this.save();
};

cartSchema.methods.clearCart = function() {
    this.items = [];
    return this.save();
};

module.exports = mongoose.model("Cart", cartSchema);