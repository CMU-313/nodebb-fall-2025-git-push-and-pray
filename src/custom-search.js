'use strict';

const validator = require('validator');
const winston = require('winston');
const db = require('./database');
const utils = require('./utils');

const customSearch = module.exports;

/**
 * Custom search function based on SQL LIKE pattern matching
 * @param {Object} data - Search parameters
 * @param {string} data.query - Search term
 * @param {string} data.table - Database table to search in
 * @param {string} data.column - Column to search in
 * @param {number} data.limit - Maximum number of results (default: 20)
 * @param {number} data.offset - Number of results to skip (default: 0)
 * @param {string} data.sortBy - Column to sort by (default: 'id')
 * @param {string} data.sortDirection - Sort direction 'ASC' or 'DESC' (default: 'ASC')
 * @returns {Promise<Object>} Search results with metadata
 */
customSearch.search = async function (data) {
	const start = process.hrtime();
	
	// Validate and sanitize input
	const searchData = validateSearchData(data);
	
	try {
		let results;
		const databaseType = require('nconf').get('database');
		
		if (databaseType === 'postgres') {
			results = await searchPostgreSQL(searchData);
		} else if (databaseType === 'mongo') {
			results = await searchMongoDB(searchData);
		} else {
			throw new Error('Unsupported database type: ' + databaseType);
		}
		
		const searchTime = (process.elapsedTimeSince(start) / 1000).toFixed(2);
		
		return {
			results: results.data,
			totalCount: results.totalCount,
			hasMore: results.hasMore,
			searchTime: searchTime,
			query: searchData.query,
			table: searchData.table,
			column: searchData.column
		};
	} catch (error) {
		winston.error('Custom search error:', error);
		throw error;
	}
};

/**
 * Validate and sanitize search input data
 * @param {Object} data - Raw search data
 * @returns {Object} Validated and sanitized search data
 */
function validateSearchData(data) {
	if (!data || typeof data !== 'object') {
		throw new Error('Search data must be an object');
	}
	
	const searchData = {
		query: validator.escape(String(data.query || '')).trim(),
		table: validator.escape(String(data.table || '')).trim(),
		column: validator.escape(String(data.column || '')).trim(),
		limit: Math.max(1, Math.min(100, parseInt(data.limit, 10) || 20)),
		offset: Math.max(0, parseInt(data.offset, 10) || 0),
		sortBy: validator.escape(String(data.sortBy || 'id')).trim(),
		sortDirection: ['ASC', 'DESC'].includes(String(data.sortDirection || 'ASC').toUpperCase()) 
			? String(data.sortDirection).toUpperCase() 
			: 'ASC'
	};
	
	// Validate required fields
	if (!searchData.query) {
		throw new Error('Search query is required');
	}
	if (!searchData.table) {
		throw new Error('Table name is required');
	}
	if (!searchData.column) {
		throw new Error('Column name is required');
	}
	
	// Additional validation for table and column names (prevent SQL injection)
	if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(searchData.table)) {
		throw new Error('Invalid table name');
	}
	if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(searchData.column)) {
		throw new Error('Invalid column name');
	}
	if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(searchData.sortBy)) {
		throw new Error('Invalid sort column name');
	}
	
	return searchData;
}

/**
 * Execute search query on PostgreSQL database
 * @param {Object} searchData - Validated search data
 * @returns {Promise<Object>} Search results
 */
async function searchPostgreSQL(searchData) {
	const { query, table, column, limit, offset, sortBy, sortDirection } = searchData;
	
	// Build the SQL query based on your original logic
	const searchQuery = `
		SELECT * 
		FROM "${table}"
		WHERE LOWER("${column}") LIKE LOWER($1)
		ORDER BY "${sortBy}" ${sortDirection}
		LIMIT $2 OFFSET $3
	`;
	
	const countQuery = `
		SELECT COUNT(*) as total
		FROM "${table}"
		WHERE LOWER("${column}") LIKE LOWER($1)
	`;
	
	// Use % wildcards for LIKE pattern matching
	const searchPattern = `%${query}%`;
	
	try {
		const [results, countResult] = await Promise.all([
			db.query(searchQuery, [searchPattern, limit, offset]),
			db.query(countQuery, [searchPattern])
		]);
		
		const totalCount = parseInt(countResult.rows[0].total, 10);
		const hasMore = (offset + results.rows.length) < totalCount;
		
		return {
			data: results.rows,
			totalCount: totalCount,
			hasMore: hasMore
		};
	} catch (error) {
		winston.error('PostgreSQL search error:', error);
		throw new Error('Database search failed: ' + error.message);
	}
}

/**
 * Execute search query on MongoDB database
 * @param {Object} searchData - Validated search data
 * @returns {Promise<Object>} Search results
 */
async function searchMongoDB(searchData) {
	const { query, table, column, limit, offset, sortBy, sortDirection } = searchData;
	
	try {
		const collection = db.client.collection(table);
		
		// Create case-insensitive regex pattern for MongoDB
		const searchPattern = new RegExp(query, 'i');
		const searchFilter = {
			[column]: { $regex: searchPattern }
		};
		
		const sortDirectionMongo = sortDirection === 'DESC' ? -1 : 1;
		const sortOptions = {
			[sortBy]: sortDirectionMongo
		};
		
		const [results, totalCount] = await Promise.all([
			collection.find(searchFilter)
				.sort(sortOptions)
				.skip(offset)
				.limit(limit)
				.toArray(),
			collection.countDocuments(searchFilter)
		]);
		
		const hasMore = (offset + results.length) < totalCount;
		
		return {
			data: results,
			totalCount: totalCount,
			hasMore: hasMore
		};
	} catch (error) {
		winston.error('MongoDB search error:', error);
		throw new Error('Database search failed: ' + error.message);
	}
}

/**
 * Search for companies by ticker symbol (example implementation)
 * @param {Object} data - Search parameters
 * @param {string} data.ticker - Ticker symbol to search for
 * @param {number} data.limit - Maximum number of results
 * @param {number} data.offset - Number of results to skip
 * @returns {Promise<Object>} Company search results
 */
customSearch.searchCompanies = async function (data) {
	const searchData = {
		query: data.ticker || '',
		table: 'company_daily_stock_price',
		column: 'ticker',
		limit: data.limit || 20,
		offset: data.offset || 0,
		sortBy: 'ticker',
		sortDirection: 'ASC'
	};
	
	return await customSearch.search(searchData);
};

/**
 * Search for users by username (NodeBB specific)
 * @param {Object} data - Search parameters
 * @param {string} data.username - Username to search for
 * @param {number} data.limit - Maximum number of results
 * @param {number} data.offset - Number of results to skip
 * @returns {Promise<Object>} User search results
 */
customSearch.searchUsers = async function (data) {
	const searchData = {
		query: data.username || '',
		table: 'objects',
		column: 'data', // NodeBB stores user data in JSON format
		limit: data.limit || 20,
		offset: data.offset || 0,
		sortBy: 'data',
		sortDirection: 'ASC'
	};
	
	return await customSearch.search(searchData);
};

/**
 * Search for posts by content (NodeBB specific)
 * @param {Object} data - Search parameters
 * @param {string} data.content - Content to search for
 * @param {number} data.limit - Maximum number of results
 * @param {number} data.offset - Number of results to skip
 * @returns {Promise<Object>} Post search results
 */
customSearch.searchPosts = async function (data) {
	const searchData = {
		query: data.content || '',
		table: 'objects',
		column: 'data', // NodeBB stores post data in JSON format
		limit: data.limit || 20,
		offset: data.offset || 0,
		sortBy: 'data',
		sortDirection: 'DESC'
	};
	
	return await customSearch.search(searchData);
};

/**
 * Get search suggestions based on partial input
 * @param {Object} data - Search parameters
 * @param {string} data.query - Partial search term
 * @param {string} data.table - Database table to search in
 * @param {string} data.column - Column to search in
 * @param {number} data.limit - Maximum number of suggestions
 * @returns {Promise<Array>} Array of search suggestions
 */
customSearch.getSuggestions = async function (data) {
	const searchData = {
		query: data.query || '',
		table: data.table || '',
		column: data.column || '',
		limit: Math.min(10, data.limit || 5),
		offset: 0,
		sortBy: data.column || 'id',
		sortDirection: 'ASC'
	};
	
	if (!searchData.query || searchData.query.length < 2) {
		return [];
	}
	
	try {
		const results = await customSearch.search(searchData);
		return results.results.map(item => {
			// Extract the searchable field value for suggestions
			if (typeof item === 'object' && item[searchData.column]) {
				return item[searchData.column];
			}
			return item;
		});
	} catch (error) {
		winston.error('Search suggestions error:', error);
		return [];
	}
};

require('../promisify')(customSearch);
