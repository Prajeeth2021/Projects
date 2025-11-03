import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Pagination,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search,
  FilterList,
  ExpandMore,
  Sort,
  Clear
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import ProductCard from './ProductCard';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [page, setPage] = useState(1);
  const productsPerPage = 12;

  // Mock categories - in real app, these would come from API
  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys'];

  // Fetch products from API
  const { data: productsData, isLoading, error, refetch } = useQuery({
    queryKey: ['products', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      params.append('minPrice', filters.minPrice);
      params.append('maxPrice', filters.maxPrice);
      params.append('sort', `${filters.sortBy}:${filters.sortOrder}`);
      params.append('page', page);
      params.append('limit', productsPerPage);

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    }
  });

  useEffect(() => {
    const search = searchParams.get('q');
    if (search !== filters.search) {
      setFilters(prev => ({ ...prev, search: search || '' }));
      setPage(1);
    }
  }, [searchParams]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: 0,
      maxPrice: 1000,
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setPage(1);
    setSearchParams({});
  };

  const handleAddToCart = (product, quantity) => {
    // This will be implemented when we add cart functionality
    console.log(`Added ${quantity} of ${product.name} to cart`);
    // TODO: Implement cart API call
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(filters.search ? { q: filters.search } : {});
  };

  const totalPages = productsData ? Math.ceil(productsData.total / productsPerPage) : 1;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Our Products
      </Typography>

      {/* Search Bar */}
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            endAdornment: filters.search && (
              <Button size="small" onClick={() => handleFilterChange('search', '')}>
                <Clear />
              </Button>
            )
          }}
          sx={{
            maxWidth: 600,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3
            }
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Filters
              </Typography>
              <Button
                size="small"
                onClick={clearFilters}
                startIcon={<Clear />}
              >
                Clear
              </Button>
            </Box>

            {/* Category Filter */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Category</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>

            {/* Price Range Filter */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Price Range</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ px: 2 }}>
                  <Typography gutterBottom>
                    ${filters.minPrice} - ${filters.maxPrice}
                  </Typography>
                  <Slider
                    value={[filters.minPrice, filters.maxPrice]}
                    onChange={(e, newValue) => {
                      handleFilterChange('minPrice', newValue[0]);
                      handleFilterChange('maxPrice', newValue[1]);
                    }}
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000}
                    step={10}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Sort Options */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Sort By</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sort Field</InputLabel>
                      <Select
                        value={filters.sortBy}
                        label="Sort Field"
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      >
                        <MenuItem value="name">Name</MenuItem>
                        <MenuItem value="price">Price</MenuItem>
                        <MenuItem value="rating">Rating</MenuItem>
                        <MenuItem value="createdAt">Newest</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Order</InputLabel>
                      <Select
                        value={filters.sortOrder}
                        label="Order"
                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      >
                        <MenuItem value="asc">A-Z / Low to High</MenuItem>
                        <MenuItem value="desc">Z-A / High to Low</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Grid>

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error loading products: {error.message}
            </Alert>
          ) : (
            <>
              {/* Active Filters Display */}
              {(filters.category || filters.search) && (
                <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {filters.search && (
                    <Chip
                      label={`Search: ${filters.search}`}
                      onDelete={() => handleFilterChange('search', '')}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {filters.category && (
                    <Chip
                      label={`Category: ${filters.category}`}
                      onDelete={() => handleFilterChange('category', '')}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              )}

              {/* Products Count */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing {productsData?.products?.length || 0} of {productsData?.total || 0} products
              </Typography>

              {/* Products Grid */}
              <Grid container spacing={3}>
                {productsData?.products?.map((product) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}

              {/* No Products Found */}
              {productsData?.products?.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No products found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Try adjusting your filters or search terms
                  </Typography>
                  <Button variant="outlined" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductList;