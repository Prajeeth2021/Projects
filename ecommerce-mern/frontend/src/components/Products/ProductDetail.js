import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Breadcrumbs,
  Link,
  IconButton,
  Chip,
  Rating,
  TextField,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  AddShoppingCart,
  Favorite,
  FavoriteBorder,
  Share,
  Star,
  Remove,
  Add
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      return response.json();
    },
    enabled: !!id
  });

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    console.log(`Adding ${quantity} of ${product.name} to cart`);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  const increaseQuantity = () => {
    setQuantity(prev => Math.min(product.countInStock, prev + 1));
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error.message}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component="button" variant="body1" onClick={() => navigate('/')}>
          Home
        </Link>
        <Link component="button" variant="body1" onClick={() => navigate('/products')}>
          Products
        </Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/products')}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Grid container spacing={4}>
        {/* Product Image */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 2
            }}
          >
            <Box
              component="img"
              src={product.imageUrl || `https://picsum.photos/seed/${product._id}/600/600.jpg`}
              alt={product.name}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: 600,
                objectFit: 'cover'
              }}
            />

            {/* Stock Badge */}
            <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
              {product.countInStock === 0 ? (
                <Chip label="Out of Stock" color="error" />
              ) : product.countInStock <= 5 ? (
                <Chip label={`Only ${product.countInStock} left`} color="warning" />
              ) : (
                <Chip label="In Stock" color="success" />
              )}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
              <IconButton
                onClick={toggleFavorite}
                sx={{
                  backgroundColor: 'white',
                  '&:hover': { backgroundColor: 'grey.100' }
                }}
              >
                {isFavorite ? (
                  <Favorite sx={{ color: 'red' }} />
                ) : (
                  <FavoriteBorder />
                )}
              </IconButton>
              <IconButton
                onClick={handleShare}
                sx={{
                  backgroundColor: 'white',
                  '&:hover': { backgroundColor: 'grey.100' }
                }}
              >
                <Share />
              </IconButton>
            </Box>
          </Paper>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            {product.name}
          </Typography>

          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating
              value={product.rating || 0}
              precision={0.1}
              size="large"
              readOnly
            />
            <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
              ({product.numReviews || 0} reviews)
            </Typography>
          </Box>

          {/* Price */}
          <Typography variant="h4" color="primary.main" fontWeight="bold" sx={{ mb: 2 }}>
            ${product.price.toFixed(2)}
          </Typography>

          {/* Category */}
          {product.category && (
            <Box sx={{ mb: 2 }}>
              <Chip label={product.category} variant="outlined" />
            </Box>
          )}

          {/* Description */}
          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            {product.description}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Quantity and Add to Cart */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quantity
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 1 }}>
                <IconButton
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  size="small"
                >
                  <Remove />
                </IconButton>
                <TextField
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.min(Math.max(1, val), product.countInStock));
                  }}
                  inputProps={{
                    min: 1,
                    max: product.countInStock,
                    style: { textAlign: 'center', width: '60px' }
                  }}
                  variant="outlined"
                  size="small"
                />
                <IconButton
                  onClick={increaseQuantity}
                  disabled={quantity >= product.countInStock}
                  size="small"
                >
                  <Add />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {product.countInStock} available
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<AddShoppingCart />}
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
              sx={{ py: 1.5 }}
            >
              {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </Box>

          {/* Product Features */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Product Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                <strong>Product ID:</strong> {product._id}
              </Typography>
              <Typography variant="body2">
                <strong>Category:</strong> {product.category || 'Uncategorized'}
              </Typography>
              <Typography variant="body2">
                <strong>Stock:</strong> {product.countInStock} units
              </Typography>
              <Typography variant="body2">
                <strong>Added:</strong> {new Date(product.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
          Customer Reviews
        </Typography>

        {/* TODO: Add reviews functionality */}
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Reviews feature coming soon!
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProductDetail;