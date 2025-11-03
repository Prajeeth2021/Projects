import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  IconButton,
  Rating,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  AddShoppingCart,
  Favorite,
  FavoriteBorder,
  Visibility,
  Star
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(product, selectedQuantity);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const openQuickView = () => {
    setQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setQuickViewOpen(false);
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={product.imageUrl || `https://picsum.photos/seed/${product._id}/300/200.jpg`}
            alt={product.name}
            sx={{ objectFit: 'cover' }}
          />

          {/* Action buttons that appear on hover */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
          >
            <IconButton
              size="small"
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
              size="small"
              onClick={openQuickView}
              sx={{
                backgroundColor: 'white',
                '&:hover': { backgroundColor: 'grey.100' }
              }}
            >
              <Visibility />
            </IconButton>
          </Box>

          {/* Stock indicator */}
          {product.countInStock <= 5 && product.countInStock > 0 && (
            <Chip
              label={`Only ${product.countInStock} left`}
              color="warning"
              size="small"
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8
              }}
            />
          )}

          {product.countInStock === 0 && (
            <Chip
              label="Out of Stock"
              color="error"
              size="small"
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8
              }}
            />
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant="h6"
            component={Link}
            to={`/product/${product._id}`}
            sx={{
              textDecoration: 'none',
              color: 'text.primary',
              '&:hover': { color: 'primary.main' },
              fontWeight: 'bold',
              mb: 1
            }}
          >
            {product.name}
          </Typography>

          {product.category && (
            <Chip
              label={product.category}
              size="small"
              variant="outlined"
              sx={{ alignSelf: 'flex-start', mb: 1 }}
            />
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flexGrow: 1
            }}
          >
            {product.description}
          </Typography>

          {/* Rating */}
          {product.rating && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating
                value={product.rating}
                precision={0.1}
                size="small"
                readOnly
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({product.numReviews || 0})
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              ${product.price.toFixed(2)}
            </Typography>

            <Button
              variant="contained"
              size="small"
              startIcon={<AddShoppingCart />}
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
              sx={{
                minWidth: 'auto',
                px: 2
              }}
            >
              Add
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Quick View Dialog */}
      <Dialog open={quickViewOpen} onClose={closeQuickView} maxWidth="sm" fullWidth>
        <DialogTitle>{product.name}</DialogTitle>
        <DialogContent>
          <CardMedia
            component="img"
            height="200"
            image={product.imageUrl || `https://picsum.photos/seed/${product._id}/400/200.jpg`}
            alt={product.name}
            sx={{ borderRadius: 1, mb: 2 }}
          />

          <Typography variant="body1" paragraph>
            {product.description}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ mr: 2 }}>
              ${product.price.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body2">Quantity:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                size="small"
                onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                disabled={selectedQuantity <= 1}
              >
                -
              </Button>
              <Typography sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>
                {selectedQuantity}
              </Typography>
              <Button
                size="small"
                onClick={() => setSelectedQuantity(Math.min(product.countInStock, selectedQuantity + 1))}
                disabled={selectedQuantity >= product.countInStock}
              >
                +
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeQuickView}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              handleAddToCart();
              closeQuickView();
            }}
            disabled={product.countInStock === 0}
          >
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCard;