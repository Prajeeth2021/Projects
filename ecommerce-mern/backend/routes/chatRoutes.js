const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// In-memory conversation history (in production, use Redis or database)
const conversationHistory = new Map();

// @route   POST /api/chat/message
// @desc    Send message to AI assistant
// @access  Private
router.post("/message", auth, async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        const userId = req.user.id;
        const userMessage = message.trim().toLowerCase();

        // Get conversation history
        if (!conversationHistory.has(userId)) {
            conversationHistory.set(userId, []);
        }
        const history = conversationHistory.get(userId);

        // Add user message to history
        history.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });

        // Keep only last 10 messages in history
        if (history.length > 10) {
            history.shift();
        }

        // Generate AI response
        const aiResponse = await generateAIResponse(userMessage, context, history);

        // Add AI response to history
        history.push({
            role: 'assistant',
            content: aiResponse.text,
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: aiResponse.text,
            actions: aiResponse.actions || []
        });

    } catch (error) {
        console.error("Chat message error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   POST /api/chat/context
// @desc    Update chat context (current page, cart contents, etc.)
// @access  Private
router.post("/context", auth, async (req, res) => {
    try {
        const { currentPage, cartItems, additionalData } = req.body;

        // Store context for the user (in production, use Redis or database)
        const contextKey = `context_${req.user.id}`;
        conversationHistory.set(contextKey, {
            currentPage,
            cartItems,
            additionalData,
            updatedAt: new Date()
        });

        res.json({
            success: true,
            message: "Context updated successfully"
        });

    } catch (error) {
        console.error("Update context error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   GET /api/chat/suggestions
// @desc    Get quick action suggestions based on context
// @access  Private
router.get("/suggestions", auth, async (req, res) => {
    try {
        const { page } = req.query;
        const userId = req.user.id;

        // Get user context if available
        const contextKey = `context_${userId}`;
        const userContext = conversationHistory.get(contextKey) || {};
        const currentPage = page || userContext.currentPage || '/';

        // Generate context-aware suggestions
        const suggestions = generateSuggestions(currentPage, userContext);

        res.json({
            success: true,
            suggestions
        });

    } catch (error) {
        console.error("Get suggestions error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   POST /api/chat/feedback
// @desc    Submit feedback on chatbot responses
// @access  Private
router.post("/feedback", auth, async (req, res) => {
    try {
        const { messageId, rating, comment } = req.body;

        // In production, store feedback in database
        console.log(`User ${req.user.id} feedback for message ${messageId}:`, { rating, comment });

        res.json({
            success: true,
            message: "Thank you for your feedback!"
        });

    } catch (error) {
        console.error("Submit feedback error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   DELETE /api/chat/history
// @desc    Clear conversation history
// @access  Private
router.delete("/history", auth, async (req, res) => {
    try {
        conversationHistory.delete(req.user.id);
        conversationHistory.delete(`context_${req.user.id}`);

        res.json({
            success: true,
            message: "Conversation history cleared"
        });

    } catch (error) {
        console.error("Clear history error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// Helper function to generate AI responses
async function generateAIResponse(message, context, history) {
    // Check for greetings
    if (message.match(/^(hi|hello|hey|good morning|good afternoon)/)) {
        return {
            text: "Hello! I'm your AI shopping assistant. I can help you find products, answer questions about your order, or guide you through the website. How can I help you today?",
            actions: [
                { type: "navigate", payload: "/products", text: "Browse Products" },
                { type: "help", text: "How can I help?" }
            ]
        };
    }

    // Product search queries
    if (message.includes('find') || message.includes('looking for') || message.includes('search')) {
        const productType = extractProductType(message);
        if (productType) {
            return {
                text: `I can help you find ${productType}! Let me search for those products.`,
                actions: [
                    { type: "search", payload: productType, text: `Search ${productType}` },
                    { type: "navigate", payload: "/products", text: "Browse All Products" }
                ]
            };
        } else {
            return {
                text: "I can help you find products! What type of product are you looking for? For example, 'electronics', 'clothing', or 'headphones'.",
                actions: [
                    { type: "navigate", payload: "/products", text: "Browse Products" },
                    { type: "search", payload: "electronics", text: "Electronics" }
                ]
            };
        }
    }

    // Navigation help
    if (message.includes('how do i') || message.includes('where is') || message.includes('navigate')) {
        return {
            text: "I can help you navigate! Use the menu at the top to browse products, view your cart, or access your profile. The search bar helps you find specific items quickly.",
            actions: [
                { type: "navigate", payload: "/products", text: "Go to Products" },
                { type: "navigate", payload: "/cart", text: "View Cart" }
            ]
        };
    }

    // Order tracking
    if (message.includes('order') || message.includes('track') || message.includes('delivery')) {
        return {
            text: "To track your order, you can visit your profile page and view your order history. If you need help with a specific order, please have your order number ready.",
            actions: [
                { type: "navigate", payload: "/profile", text: "View Orders" },
                { type: "support", text: "Contact Support" }
            ]
        };
    }

    // Returns and refunds
    if (message.includes('return') || message.includes('refund')) {
        return {
            text: "We offer a 30-day return policy for most items. Products must be in their original condition. To start a return, visit your order history and click 'Return Item' next to the order.",
            actions: [
                { type: "navigate", payload: "/profile", text: "View Orders" }
            ]
        };
    }

    // Shipping information
    if (message.includes('shipping') || message.includes('delivery')) {
        return {
            text: "We offer standard shipping (5-7 business days) and express shipping (2-3 business days). Free shipping is available for orders over $50. International shipping is also available.",
            actions: [
                { type: "navigate", payload: "/products", text: "Shop Now" }
            ]
        };
    }

    // Payment methods
    if (message.includes('payment') || message.includes('pay')) {
        return {
            text: "We accept all major credit cards, debit cards, PayPal, and Apple Pay. All payments are processed securely using SSL encryption.",
            actions: [
                { type: "navigate", payload: "/cart", text: "Go to Checkout" }
            ]
        };
    }

    // Cart related questions
    if (message.includes('cart') || message.includes('checkout')) {
        return {
            text: "Your cart shows all items you've added. You can adjust quantities, remove items, and apply promo codes. When ready, click 'Proceed to Checkout' to complete your purchase.",
            actions: [
                { type: "navigate", payload: "/cart", text: "View Cart" },
                { type: "checkout", text: "Checkout Now" }
            ]
        };
    }

    // Product recommendations based on context
    if (message.includes('recommend') || message.includes('suggest')) {
        return {
            text: "Based on your interests, I'd recommend checking out our featured products. You can also tell me what type of products you're interested in for more personalized recommendations!",
            actions: [
                { type: "navigate", payload: "/products?featured=true", text: "View Featured" },
                { type: "search", payload: "popular", text: "Popular Items" }
            ]
        };
    }

    // Help and support
    if (message.includes('help') || message.includes('support')) {
        return {
            text: "I'm here to help! I can assist you with finding products, tracking orders, shipping information, returns, or navigating the website. What would you like help with?",
            actions: [
                { type: "navigate", payload: "/products", text: "Browse Products" },
                { type: "navigate", payload: "/profile", text: "My Account" }
            ]
        };
    }

    // Default response
    return {
        text: "I'm here to help with your shopping experience! I can assist you with finding products, tracking orders, shipping information, returns, or navigating the website. What would you like to know?",
        actions: [
            { type: "navigate", payload: "/products", text: "Browse Products" },
            { type: "help", text: "Get Help" }
        ]
    };
}

// Helper function to extract product type from message
function extractProductType(message) {
    const productTypes = [
        'electronics', 'phones', 'laptops', 'headphones', 'speakers',
        'clothing', 'shoes', 'shirts', 'pants', 'dresses',
        'books', 'kindle', 'novels', 'textbooks',
        'home', 'furniture', 'decor', 'kitchen',
        'sports', 'exercise', 'fitness', 'equipment',
        'toys', 'games', 'lego', 'puzzles'
    ];

    for (const type of productTypes) {
        if (message.includes(type)) {
            return type;
        }
    }

    return null;
}

// Helper function to generate context-aware suggestions
function generateSuggestions(currentPage, context) {
    const suggestions = [];

    if (currentPage === '/' || currentPage === '/home') {
        suggestions.push(
            { type: "navigate", payload: "/products", text: "Show me products" },
            { type: "help", text: "How does this work?" }
        );
    }

    if (currentPage === '/products') {
        suggestions.push(
            { type: "search", payload: "electronics", text: "Find electronics" },
            { type: "search", payload: "deals", text: "Show deals" }
        );
    }

    if (currentPage.includes('/product/')) {
        suggestions.push(
            { type: "add_to_cart", text: "Add to cart" },
            { type: "similar", text: "Similar products" }
        );
    }

    if (currentPage === '/cart') {
        suggestions.push(
            { type: "checkout", text: "Checkout now" },
            { type: "discount", text: "Apply discount" }
        );
    }

    // Always include these
    suggestions.push(
        { type: "track_order", text: "Track order" },
        { type: "support", text: "Contact support" }
    );

    return suggestions.slice(0, 6);
}

module.exports = router;