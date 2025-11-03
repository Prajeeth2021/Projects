import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const useAIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      text: "Hi! I'm your AI shopping assistant. I can help you find products, answer questions about your order, or guide you through the website. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState({
    currentPage: window.location.pathname,
    cartItems: [],
    user: null
  });

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update context when page changes
  useEffect(() => {
    const updateContext = () => {
      setContext(prev => ({
        ...prev,
        currentPage: window.location.pathname
      }));
    };

    window.addEventListener('popstate', updateContext);
    return () => window.removeEventListener('popstate', updateContext);
  }, []);

  // Generate quick actions based on context
  const getQuickActions = () => {
    const actions = [];

    if (context.currentPage === '/') {
      actions.push(
        { text: 'Show me products', action: 'navigate', payload: '/products' },
        { text: 'How does this work?', action: 'help' }
      );
    }

    if (context.currentPage === '/products') {
      actions.push(
        { text: 'Find headphones', action: 'search', payload: 'headphones' },
        { text: 'Show deals', action: 'search', payload: 'deals' },
        { text: 'Electronics category', action: 'category', payload: 'Electronics' }
      );
    }

    if (context.currentPage.includes('/product/')) {
      actions.push(
        { text: 'Add to cart', action: 'add_to_cart' },
        { text: 'Similar products', action: 'similar' },
        { text: 'Product details', action: 'details' }
      );
    }

    if (context.currentPage === '/cart') {
      actions.push(
        { text: 'Checkout now', action: 'checkout' },
        { text: 'Apply discount', action: 'discount' },
        { text: 'Shipping info', action: 'shipping' }
      );
    }

    // Always include these
    actions.push(
      { text: 'Track order', action: 'track_order' },
      { text: 'Contact support', action: 'support' }
    );

    return actions.slice(0, 6); // Limit to 6 actions
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Send message to backend AI service
      const response = await axios.post('/api/chat/message', {
        message: text,
        context: {
          ...context,
          conversationHistory: messages.slice(-5) // Send last 5 messages for context
        }
      });

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.data.message,
        sender: 'bot',
        timestamp: new Date(),
        actions: response.data.actions || []
      };

      setMessages(prev => [...prev, botMessage]);

      // Handle any actions from the bot
      if (response.data.actions) {
        response.data.actions.forEach(action => {
          handleAction(action);
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);

      // Fallback to rule-based responses
      const fallbackResponse = generateRuleBasedResponse(text);
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        actions: fallbackResponse.actions || []
      };

      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleAction = (action) => {
    switch (action.type) {
      case 'navigate':
        window.location.href = action.payload;
        break;
      case 'add_to_cart':
        // Emit custom event for cart functionality
        window.dispatchEvent(new CustomEvent('addToCart', { detail: action.payload }));
        break;
      case 'search':
        window.location.href = `/products?q=${encodeURIComponent(action.payload)}`;
        break;
      case 'open_url':
        window.open(action.payload, '_blank');
        break;
      default:
        console.log('Unhandled action:', action);
    }
  };

  const generateRuleBasedResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    // Greetings
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon)/)) {
      return {
        text: "Hello! I'm here to help you with your shopping. What can I assist you with today?",
        actions: [
          { type: 'navigate', payload: '/products', text: 'Browse Products' },
          { type: 'help', text: 'How can I help?' }
        ]
      };
    }

    // Product search
    if (lowerMessage.includes('find') || lowerMessage.includes('looking for') || lowerMessage.includes('search')) {
      return {
        text: "I can help you find products! What type of product are you looking for? For example, 'electronics', 'clothing', or 'headphones'.",
        actions: getQuickActions().filter(a => a.action === 'search')
      };
    }

    // Navigation help
    if (lowerMessage.includes('how do i') || lowerMessage.includes('where is') || lowerMessage.includes('navigate')) {
      return {
        text: "I can help you navigate! Use the menu at the top to browse products, view your cart, or access your profile. The search bar helps you find specific items quickly.",
        actions: [
          { type: 'navigate', payload: '/products', text: 'Go to Products' },
          { type: 'navigate', payload: '/cart', text: 'View Cart' }
        ]
      };
    }

    // Order tracking
    if (lowerMessage.includes('order') || lowerMessage.includes('track') || lowerMessage.includes('delivery')) {
      return {
        text: "To track your order, you can visit your profile page and view your order history. If you need help with a specific order, please have your order number ready.",
        actions: [
          { type: 'navigate', payload: '/profile', text: 'View Orders' },
          { type: 'support', text: 'Contact Support' }
        ]
      };
    }

    // Returns policy
    if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return {
        text: "We offer a 30-day return policy for most items. Products must be in their original condition. To start a return, visit your order history and click 'Return Item' next to the order.",
        actions: [
          { type: 'navigate', payload: '/profile', text: 'View Orders' },
          { type: 'open_url', payload: '/returns', text: 'Return Policy' }
        ]
      };
    }

    // Shipping info
    if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      return {
        text: "We offer standard shipping (5-7 business days) and express shipping (2-3 business days). Free shipping is available for orders over $50. International shipping is also available.",
        actions: [
          { type: 'navigate', payload: '/products', text: 'Shop Now' },
          { type: 'support', text: 'More Questions?' }
        ]
      };
    }

    // Cart help
    if (lowerMessage.includes('cart') || lowerMessage.includes('checkout')) {
      return {
        text: "Your cart shows all items you've added. You can adjust quantities, remove items, and apply promo codes. When ready, click 'Proceed to Checkout' to complete your purchase.",
        actions: [
          { type: 'navigate', payload: '/cart', text: 'View Cart' },
          { type: 'checkout', text: 'Checkout Now' }
        ]
      };
    }

    // Payment methods
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return {
        text: "We accept all major credit cards, debit cards, PayPal, and Apple Pay. All payments are processed securely using SSL encryption.",
        actions: [
          { type: 'navigate', payload: '/cart', text: 'Go to Checkout' },
          { type: 'support', text: 'Payment Questions' }
        ]
      };
    }

    // Default response
    return {
      text: "I'm here to help! I can assist you with finding products, tracking orders, shipping information, returns, or navigating the website. What would you like help with?",
      actions: getQuickActions()
    };
  };

  const clearMessages = () => {
    setMessages([
      {
        id: 'welcome',
        text: "Hi! I'm your AI shopping assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };

  const updateContext = (newContext) => {
    setContext(prev => ({ ...prev, ...newContext }));
  };

  return {
    messages,
    isLoading,
    isTyping,
    sendMessage,
    clearMessages,
    updateContext,
    getQuickActions,
    messagesEndRef
  };
};

export default useAIChat;