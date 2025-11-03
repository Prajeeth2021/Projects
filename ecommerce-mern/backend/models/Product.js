const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        category: { type: String, required: true },
        tags: [{ type: String }],
        rating: { type: Number, default: 0, min: 0, max: 5 },
        numReviews: { type: Number, default: 0 },
        countInStock: { type: Number, default: 0, min: 0 },
        imageUrl: { type: String },
        images: [{ type: String }],
        isActive: { type: Boolean, default: true },
        featured: { type: Boolean, default: false },
        brand: { type: String },
        sku: { type: String, unique: true },
        weight: { type: Number, default: 0 },
        dimensions: {
            length: { type: Number, default: 0 },
            width: { type: Number, default: 0 },
            height: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

// Create indexes for better search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ featured: 1, isActive: 1 });
productSchema.index({ tags: 1 });

// Pre-save middleware to generate SKU if not provided
productSchema.pre('save', function(next) {
    if (!this.sku) {
        const categoryPrefix = this.category ? this.category.substring(0, 3).toUpperCase() : 'GEN';
        const timestamp = Date.now().toString().slice(-6);
        this.sku = `${categoryPrefix}-${timestamp}`;
    }
    next();
});

// Static methods
productSchema.statics.findActive = function() {
    return this.find({ isActive: true });
};

productSchema.statics.findFeatured = function() {
    return this.find({ featured: true, isActive: true });
};

productSchema.statics.findByCategory = function(category) {
    return this.find({ category, isActive: true });
};

productSchema.statics.searchProducts = function(searchTerm, category = null, sortBy = 'name', sortOrder = 'asc') {
    const query = {
        isActive: true,
        $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
    };

    if (category) {
        query.category = category;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    return this.find(query).sort(sort);
};

// Instance methods
productSchema.methods.updateRating = function(newRating) {
    this.rating = newRating;
    return this.save();
};

productSchema.methods.incrementReviews = function() {
    this.numReviews += 1;
    return this.save();
};

productSchema.methods.isInStock = function() {
    return this.countInStock > 0;
};

module.exports = mongoose.model("Product", productSchema);
