# 🤖 AI Commerce E-commerce Application

A full-stack e-commerce web application with an AI-powered chatbot assistant that provides product recommendations, navigation guidance, and customer support.

## Features

### 🛍️ E-commerce Functionality
- Modern React frontend with responsive design
- Product browsing, search, and filtering
- Shopping cart management
- User authentication and profiles
- Order management system
- Product catalog with categories and tags

### 🤖 AI Chatbot Assistant
- Context-aware AI chatbot widget
- Product recommendations
- Navigation guidance
- Customer support automation
- Rule-based fallback responses
- Conversation history management

### 🎨 Frontend Features
- React 18 with modern hooks
- Material-UI design system
- React Query for data management
- React Router for navigation
- Responsive mobile-first design
- Real-time cart updates

### 🔧 Backend Features
- Express.js RESTful API
- MongoDB with Mongoose ODM
- JWT authentication
- Advanced product search
- Cart and order management
- Chatbot API endpoints

## Project Structure

```
ecommerce-mern/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   └── chatRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── config/
│   │   └── db.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout/
    │   │   ├── Products/
    │   │   ├── Cart/
    │   │   ├── Auth/
    │   │   └── Chatbot/
    │   ├── hooks/
    │   ├── context/
    │   └── services/
    └── public/
```

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ai-commerce
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend development server**
   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify token

### Products
- `GET /api/products` - Get all products (with filtering/sorting)
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured/list` - Get featured products
- `GET /api/products/categories/list` - Get all categories
- `GET /api/products/search/query` - Search products

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove/:itemId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

### Orders
- `POST /api/orders/create` - Create new order
- `GET /api/orders/user/:userId` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/number/:orderNumber` - Get order by number

### Chatbot
- `POST /api/chat/message` - Send message to AI assistant
- `POST /api/chat/context` - Update chat context
- `GET /api/chat/suggestions` - Get quick action suggestions
- `POST /api/chat/feedback` - Submit feedback

## Testing

### Manual Testing Plan

1. **Basic E-commerce Flow**
   - Navigate to homepage
   - Browse products by category
   - Search for specific items
   - Add products to cart
   - Proceed to checkout
   - Complete purchase process

2. **Chatbot Integration**
   - Open chatbot widget (bottom-right corner)
   - Ask for product recommendations
   - Request navigation help
   - Add items to cart via chatbot
   - Get customer support answers
   - Test error handling and fallbacks

3. **User Authentication**
   - Register new account
   - Login with existing credentials
   - Access profile page
   - View order history
   - Logout and verify session ended

4. **Cross-Device Compatibility**
   - Test on mobile devices
   - Verify responsive design
   - Test touch interactions
   - Verify chatbot functionality on mobile

5. **Error Handling**
   - Network connectivity issues
   - Invalid form submissions
   - Cart manipulation errors
   - Authentication failures

## Development Notes

### AI Chatbot Features
- **Context Awareness**: Chatbot knows current page and cart contents
- **Smart Suggestions**: Provides relevant quick actions based on user context
- **Fallback Responses**: Rule-based responses when AI service is unavailable
- **Conversation History**: Maintains context across multiple interactions

### Product Management
- **Advanced Search**: Full-text search across name, description, and tags
- **Dynamic Filtering**: Filter by category, price range, and features
- **Sorting Options**: Sort by price, rating, name, and newest
- **Pagination**: Efficient handling of large product catalogs

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Protected routes with middleware

## Future Enhancements

- **Real AI Integration**: Connect to OpenAI/Anthropic APIs
- **Payment Processing**: Integrate Stripe/PayPal
- **Email Notifications**: Order confirmations and updates
- **Admin Dashboard**: Product and order management
- **Review System**: Customer reviews and ratings
- **Wishlist Feature**: Save products for later
- **Real-time Inventory**: Stock level updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.