import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  Divider
} from '@mui/material';
import {
  Person,
  ShoppingBag,
  History,
  Settings
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                {user?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="h6" gutterBottom fontWeight="bold">
            Account Options
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ShoppingBag />}
              sx={{ justifyContent: 'flex-start', p: 2 }}
            >
              View Cart
            </Button>

            <Button
              variant="outlined"
              startIcon={<History />}
              sx={{ justifyContent: 'flex-start', p: 2 }}
            >
              Order History
            </Button>

            <Button
              variant="outlined"
              startIcon={<Settings />}
              sx={{ justifyContent: 'flex-start', p: 2 }}
            >
              Account Settings
            </Button>

            <Button
              variant="text"
              color="error"
              onClick={logout}
              sx={{ justifyContent: 'flex-start', p: 2 }}
            >
              Logout
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;