import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  IconButton,
  TextField,
  Divider,
  Card,
  CardMedia,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Remove,
  Add,
  Delete,
  ShoppingBag,
  LocalShipping,
  Payment,
  CheckCircle
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Cart = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [promoCode, setPromoCode] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Shopping Cart', 'Shipping', 'Payment', 'Review'];

  // Mock cart data - in real app, this would come from API
  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return [
        {
          _id: '1',
          productId: {
            _id: '1',
            name: 'Wireless Headphones',
            price: 99.99,
            imageUrl: 'https://picsum.photos/seed/headphones/200/200.jpg'
          },
          quantity: 2,
          priceAtTime: 99.99
        },
        {
          _id: '2',
          productId: {
            _id: '2',
            name: 'Smart Watch',
            price: 199.99,
            imageUrl: 'https://picsum.photos/seed/watch/200/200.jpg'
          },
          quantity: 1,
          priceAtTime: 199.99
        }
      ];
    }
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      // TODO: Replace with actual API call
      console.log(`Updating item ${itemId} to quantity ${quantity}`);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId) => {
      // TODO: Replace with actual API call
      console.log(`Removing item ${itemId}`);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemMutation.mutate(itemId);
    } else {
      updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (itemId) => {
    removeItemMutation.mutate(itemId);
  };

  const calculateSubtotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => {
      return total + (item.priceAtTime * item.quantity);
    }, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 50 ? 0 : 9.99;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const handleCheckout = () => {
    // Navigate to checkout process
    setActiveStep(1);
    // TODO: Implement checkout flow
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Looks like you haven't added anything to your cart yet.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/products"
            startIcon={<ShoppingBag />}
          >
            Start Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Shopping Cart
      </Typography>

      {/* Checkout Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cart Items ({cartItems.length})
            </Typography>

            {cartItems.map((item, index) => (
              <Box key={item._id}>
                <Card sx={{ display: 'flex', mb: 2, overflow: 'visible' }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 120, height: 120, objectFit: 'cover' }}
                    image={item.productId.imageUrl || `https://picsum.photos/seed/${item.productId._id}/120/120.jpg`}
                    alt={item.productId.name}
                  />
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" component={Link} to={`/product/${item.productId._id}`} sx={{
                        textDecoration: 'none',
                        color: 'text.primary',
                        '&:hover': { color: 'primary.main' }
                      }}>
                        {item.productId.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${item.priceAtTime.toFixed(2)} each
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Remove />
                        </IconButton>
                        <Typography sx={{ minWidth: '30px', textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        >
                          <Add />
                        </IconButton>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          ${(item.priceAtTime * item.quantity).toFixed(2)}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveItem(item._id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
                {index < cartItems.length - 1 && <Divider sx={{ mb: 2 }} />}
              </Box>
            ))}

            {/* Promo Code */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Promo Code
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Button variant="outlined">
                  Apply
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">Subtotal</Typography>
              <Typography variant="body1">${calculateSubtotal().toFixed(2)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">Tax (8%)</Typography>
              <Typography variant="body1">${calculateTax().toFixed(2)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">Shipping</Typography>
              <Typography variant="body1">
                {calculateShipping() === 0 ? (
                  <Chip label="FREE" color="success" size="small" />
                ) : (
                  `$${calculateShipping().toFixed(2)}`
                )}
              </Typography>
            </Box>

            {calculateShipping() === 0 && (
              <Alert severity="success" sx={{ mb: 2 }}>
                You've qualified for free shipping!
              </Alert>
            )}

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Total
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleCheckout}
              startIcon={<Payment />}
              sx={{ mb: 2 }}
            >
              Proceed to Checkout
            </Button>

            <Button
              variant="outlined"
              size="large"
              fullWidth
              component={Link}
              to="/products"
              startIcon={<ShoppingBag />}
            >
              Continue Shopping
            </Button>

            {/* Security Badge */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                <CheckCircle sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5, color: 'success.main' }} />
                Secure checkout powered by SSL encryption
              </Typography>
            </Box>
          </Paper>

          {/* Shipping Info */}
          <Paper sx={{ p: 3, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalShipping color="action" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Shipping Information
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              • Free shipping on orders over $50
              <br />
              • Standard delivery: 5-7 business days
              <br />
              • Express delivery: 2-3 business days
              <br />
              • Easy returns within 30 days
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;