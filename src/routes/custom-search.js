'use strict';

const express = require('express');
const router = express.Router();
const customSearchAPI = require('../api/custom-search');
const middleware = require('../middleware');

// Apply authentication middleware to all routes
router.use(middleware.authenticate);

/**
 * Generic search endpoint
 * POST /api/v3/custom-search
 * Body: { query, table, column, limit?, offset?, sortBy?, sortDirection? }
 */
router.post('/', customSearchAPI.search);

/**
 * Search companies by ticker symbol
 * GET /api/v3/custom-search/companies?ticker=AAPL&limit=10&offset=0
 */
router.get('/companies', customSearchAPI.searchCompanies);

/**
 * Search users by username
 * GET /api/v3/custom-search/users?username=john&limit=10&offset=0
 */
router.get('/users', customSearchAPI.searchUsers);

/**
 * Search posts by content
 * GET /api/v3/custom-search/posts?content=javascript&limit=10&offset=0
 */
router.get('/posts', customSearchAPI.searchPosts);

/**
 * Get search suggestions
 * GET /api/v3/custom-search/suggestions?query=aa&table=company_daily_stock_price&column=ticker&limit=5
 */
router.get('/suggestions', customSearchAPI.getSuggestions);

/**
 * Advanced search with multiple criteria
 * POST /api/v3/custom-search/advanced
 * Body: { queries: [], table, columns: [], limit?, offset?, sortBy?, sortDirection? }
 */
router.post('/advanced', customSearchAPI.advancedSearch);

module.exports = router;
