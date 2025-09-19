'use strict';

const validator = require('validator');
const customSearch = require('../custom-search');
const helpers = require('./helpers');
const pagination = require('../pagination');

const customSearchController = module.exports;

/**
 * Render custom search page
 * GET /custom-search
 */
customSearchController.render = async function (req, res, next) {
	try {
		const page = Math.max(1, parseInt(req.query.page, 10)) || 1;
		const query = validator.escape(String(req.query.q || '')).trim();
		const table = validator.escape(String(req.query.table || '')).trim();
		const column = validator.escape(String(req.query.column || '')).trim();
		const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
		
		let searchData = null;
		
		// If search parameters are provided, perform search
		if (query && table && column) {
			const offset = (page - 1) * limit;
			
			searchData = await customSearch.search({
				query: query,
				table: table,
				column: column,
				limit: limit,
				offset: offset,
				sortBy: 'id',
				sortDirection: 'ASC'
			});
			
			// Create pagination
			searchData.pagination = pagination.create(page, Math.ceil(searchData.totalCount / limit), req.query);
			searchData.multiplePages = searchData.pagination.pageCount > 1;
		}
		
		const data = {
			title: 'Custom Search',
			breadcrumbs: helpers.buildBreadcrumbs([{ text: 'Custom Search' }]),
			searchQuery: query,
			searchTable: table,
			searchColumn: column,
			searchLimit: limit,
			searchData: searchData,
			showResults: !!(query && table && column)
		};
		
		res.render('custom-search', data);
	} catch (error) {
		next(error);
	}
};

/**
 * Handle search form submission
 * POST /custom-search
 */
customSearchController.search = async function (req, res, next) {
	try {
		const { query, table, column, limit } = req.body;
		
		// Validate required fields
		if (!query || !table || !column) {
			return res.status(400).json({
				error: 'Query, table, and column are required'
			});
		}
		
		// Redirect to GET with query parameters
		const params = new URLSearchParams({
			q: query,
			table: table,
			column: column,
			limit: limit || 20
		});
		
		res.redirect(`/custom-search?${params.toString()}`);
	} catch (error) {
		next(error);
	}
};

/**
 * AJAX search endpoint
 * GET /custom-search/ajax
 */
customSearchController.ajaxSearch = async function (req, res, next) {
	try {
		const query = validator.escape(String(req.query.q || '')).trim();
		const table = validator.escape(String(req.query.table || '')).trim();
		const column = validator.escape(String(req.query.column || '')).trim();
		const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 10));
		const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
		
		if (!query || !table || column) {
			return res.status(400).json({
				error: 'Query, table, and column are required'
			});
		}
		
		const searchData = await customSearch.search({
			query: query,
			table: table,
			column: column,
			limit: limit,
			offset: offset,
			sortBy: 'id',
			sortDirection: 'ASC'
		});
		
		res.json({
			success: true,
			data: searchData
		});
	} catch (error) {
		res.status(500).json({
			error: error.message
		});
	}
};

/**
 * Get search suggestions for autocomplete
 * GET /custom-search/suggestions
 */
customSearchController.suggestions = async function (req, res, next) {
	try {
		const query = validator.escape(String(req.query.q || '')).trim();
		const table = validator.escape(String(req.query.table || '')).trim();
		const column = validator.escape(String(req.query.column || '')).trim();
		const limit = Math.max(1, Math.min(10, parseInt(req.query.limit, 10) || 5));
		
		if (!query || query.length < 2) {
			return res.json({
				suggestions: []
			});
		}
		
		if (!table || !column) {
			return res.status(400).json({
				error: 'Table and column are required'
			});
		}
		
		const suggestions = await customSearch.getSuggestions({
			query: query,
			table: table,
			column: column,
			limit: limit
		});
		
		res.json({
			suggestions: suggestions
		});
	} catch (error) {
		res.status(500).json({
			error: error.message
		});
	}
};

/**
 * Search companies by ticker
 * GET /custom-search/companies
 */
customSearchController.searchCompanies = async function (req, res, next) {
	try {
		const page = Math.max(1, parseInt(req.query.page, 10)) || 1;
		const ticker = validator.escape(String(req.query.ticker || '')).trim();
		const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
		
		if (!ticker) {
			const data = {
				title: 'Company Search',
				breadcrumbs: helpers.buildBreadcrumbs([{ text: 'Company Search' }]),
				searchTicker: '',
				searchData: null,
				showResults: false
			};
			return res.render('custom-search-companies', data);
		}
		
		const offset = (page - 1) * limit;
		
		const searchData = await customSearch.searchCompanies({
			ticker: ticker,
			limit: limit,
			offset: offset
		});
		
		// Create pagination
		searchData.pagination = pagination.create(page, Math.ceil(searchData.totalCount / limit), req.query);
		searchData.multiplePages = searchData.pagination.pageCount > 1;
		
		const data = {
			title: 'Company Search',
			breadcrumbs: helpers.buildBreadcrumbs([{ text: 'Company Search' }]),
			searchTicker: ticker,
			searchData: searchData,
			showResults: true
		};
		
		res.render('custom-search-companies', data);
	} catch (error) {
		next(error);
	}
};

/**
 * Search users by username
 * GET /custom-search/users
 */
customSearchController.searchUsers = async function (req, res, next) {
	try {
		const page = Math.max(1, parseInt(req.query.page, 10)) || 1;
		const username = validator.escape(String(req.query.username || '')).trim();
		const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
		
		if (!username) {
			const data = {
				title: 'User Search',
				breadcrumbs: helpers.buildBreadcrumbs([{ text: 'User Search' }]),
				searchUsername: '',
				searchData: null,
				showResults: false
			};
			return res.render('custom-search-users', data);
		}
		
		const offset = (page - 1) * limit;
		
		const searchData = await customSearch.searchUsers({
			username: username,
			limit: limit,
			offset: offset
		});
		
		// Create pagination
		searchData.pagination = pagination.create(page, Math.ceil(searchData.totalCount / limit), req.query);
		searchData.multiplePages = searchData.pagination.pageCount > 1;
		
		const data = {
			title: 'User Search',
			breadcrumbs: helpers.buildBreadcrumbs([{ text: 'User Search' }]),
			searchUsername: username,
			searchData: searchData,
			showResults: true
		};
		
		res.render('custom-search-users', data);
	} catch (error) {
		next(error);
	}
};

require('../promisify')(customSearchController);
