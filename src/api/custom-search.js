'use strict';

const validator = require('validator');
const customSearch = require('../custom-search');
const helpers = require('./helpers');

const customSearchAPI = module.exports;

/**
 * Generic search endpoint
 * POST /api/v3/custom-search
 */
customSearchAPI.search = async function (req, res) {
	try {
		const data = {
			query: req.body.query,
			table: req.body.table,
			column: req.body.column,
			limit: req.body.limit,
			offset: req.body.offset,
			sortBy: req.body.sortBy,
			sortDirection: req.body.sortDirection
		};
		
		const results = await customSearch.search(data);
		
		helpers.formatApiResponse(200, res, results);
	} catch (error) {
		helpers.formatApiResponse(400, res, {
			error: error.message
		});
	}
};

/**
 * Search companies by ticker
 * GET /api/v3/custom-search/companies?ticker=AAPL&limit=10&offset=0
 */
customSearchAPI.searchCompanies = async function (req, res) {
	try {
		const data = {
			ticker: req.query.ticker,
			limit: parseInt(req.query.limit, 10),
			offset: parseInt(req.query.offset, 10)
		};
		
		const results = await customSearch.searchCompanies(data);
		
		helpers.formatApiResponse(200, res, results);
	} catch (error) {
		helpers.formatApiResponse(400, res, {
			error: error.message
		});
	}
};

/**
 * Search users by username
 * GET /api/v3/custom-search/users?username=john&limit=10&offset=0
 */
customSearchAPI.searchUsers = async function (req, res) {
	try {
		const data = {
			username: req.query.username,
			limit: parseInt(req.query.limit, 10),
			offset: parseInt(req.query.offset, 10)
		};
		
		const results = await customSearch.searchUsers(data);
		
		helpers.formatApiResponse(200, res, results);
	} catch (error) {
		helpers.formatApiResponse(400, res, {
			error: error.message
		});
	}
};

/**
 * Search posts by content
 * GET /api/v3/custom-search/posts?content=javascript&limit=10&offset=0
 */
customSearchAPI.searchPosts = async function (req, res) {
	try {
		const data = {
			content: req.query.content,
			limit: parseInt(req.query.limit, 10),
			offset: parseInt(req.query.offset, 10)
		};
		
		const results = await customSearch.searchPosts(data);
		
		helpers.formatApiResponse(200, res, results);
	} catch (error) {
		helpers.formatApiResponse(400, res, {
			error: error.message
		});
	}
};

/**
 * Get search suggestions
 * GET /api/v3/custom-search/suggestions?query=aa&table=company_daily_stock_price&column=ticker&limit=5
 */
customSearchAPI.getSuggestions = async function (req, res) {
	try {
		const data = {
			query: req.query.query,
			table: req.query.table,
			column: req.query.column,
			limit: parseInt(req.query.limit, 10)
		};
		
		const suggestions = await customSearch.getSuggestions(data);
		
		helpers.formatApiResponse(200, res, {
			suggestions: suggestions
		});
	} catch (error) {
		helpers.formatApiResponse(400, res, {
			error: error.message
		});
	}
};

/**
 * Advanced search with multiple criteria
 * POST /api/v3/custom-search/advanced
 */
customSearchAPI.advancedSearch = async function (req, res) {
	try {
		const {
			queries,
			table,
			columns,
			limit = 20,
			offset = 0,
			sortBy = 'id',
			sortDirection = 'ASC'
		} = req.body;
		
		// Validate input
		if (!Array.isArray(queries) || queries.length === 0) {
			throw new Error('Queries array is required');
		}
		if (!Array.isArray(columns) || columns.length === 0) {
			throw new Error('Columns array is required');
		}
		if (!table) {
			throw new Error('Table name is required');
		}
		
		// Execute multiple searches and combine results
		const searchPromises = queries.map((query, index) => {
			const column = columns[index] || columns[0];
			return customSearch.search({
				query: query,
				table: table,
				column: column,
				limit: Math.ceil(limit / queries.length),
				offset: Math.floor(offset / queries.length),
				sortBy: sortBy,
				sortDirection: sortDirection
			});
		});
		
		const results = await Promise.all(searchPromises);
		
		// Combine and deduplicate results
		const combinedResults = combineSearchResults(results);
		
		helpers.formatApiResponse(200, res, {
			results: combinedResults.data,
			totalCount: combinedResults.totalCount,
			hasMore: combinedResults.hasMore,
			searchTime: results[0].searchTime,
			queries: queries,
			table: table,
			columns: columns
		});
	} catch (error) {
		helpers.formatApiResponse(400, res, {
			error: error.message
		});
	}
};

/**
 * Combine multiple search results and remove duplicates
 * @param {Array} results - Array of search result objects
 * @returns {Object} Combined search results
 */
function combineSearchResults(results) {
	const seen = new Set();
	const combinedData = [];
	let totalCount = 0;
	
	results.forEach(result => {
		totalCount += result.totalCount;
		result.results.forEach(item => {
			// Create a unique key for deduplication
			const key = JSON.stringify(item);
			if (!seen.has(key)) {
				seen.add(key);
				combinedData.push(item);
			}
		});
	});
	
	return {
		data: combinedData,
		totalCount: totalCount,
		hasMore: combinedData.length < totalCount
	};
}

require('../promisify')(customSearchAPI);
