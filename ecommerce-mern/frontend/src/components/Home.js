import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Avatar
} from '@mui/material';
import {
  ShoppingBag,
  Psychology,
  SupportAgent,
  Star
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ShoppingBag sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Smart Shopping',
      description: 'Browse our curated collection of products with intelligent recommendations'
    },
    {
      icon: <Psychology sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'AI Assistant',
      description: 'Get personalized help from our AI chatbot for product recommendations and support'
    },
    {
      icon: <SupportAgent sx={{ fontSize: 40, color: 'success.main' }} />,
      title: '24/7 Support',
      description: 'Round-the-clock assistance for all your shopping needs'
    },
    {
      icon: <Star sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Premium Quality',
      description: 'Carefully selected products with quality guarantees'
    }
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          color: 'white',
          mb: 6
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          Welcome to AI Commerce
        </Typography>
        <Typography variant="h5" gutterBottom sx={{ mb: 4, opacity: 0.9 }}>
          Shop smarter with your AI-powered shopping assistant
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/products')}
          sx={{
            backgroundColor: 'white',
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'grey.100',
            },
            px: 4,
            py: 1.5
          }}
        >
          Start Shopping
        </Button>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom fontWeight="bold">
          Why Choose AI Commerce?
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
          Experience the future of online shopping with intelligent assistance
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'transparent',
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: 6,
          backgroundColor: 'grey.50',
          borderRadius: 4,
          mb: 4
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
          Ready to Get Started?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Join thousands of satisfied customers who shop smarter with AI assistance
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/products')}
          sx={{ mr: 2 }}
        >
          Browse Products
        </Button>
        <Button
          variant="outlined"
          size="large"
          component="a"
          href="#chatbot"
          onClick={() => {
            // This will trigger the chatbot to open when we implement it
            window.dispatchEvent(new CustomEvent('openChatbot'));
          }}
        >
          Try AI Assistant
        </Button>
      </Box>
    </Container>
  );
};

export default Home;