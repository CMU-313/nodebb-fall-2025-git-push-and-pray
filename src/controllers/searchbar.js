'use strict';

const search = require('../search');
const privileges = require('../privileges');
const utils = require('../utils');

module.exports = async function (req, res) {
	let results = null;
	let error = null;
	const query = req.query.q;
	
	// Get user privileges for search options
	const privs = await utils.promiseParallel({
		'search:users': privileges.global.can('search:users', req.uid),
		'search:content': privileges.global.can('search:content', req.uid),
		'search:tags': privileges.global.can('search:tags', req.uid),
	});
	
	if (query) {
		try {
			results = await search.search({
				query,
				searchIn: 'posts',
				sortBy: 'relevance',
				uid: req.uid || 0,
			});
		} catch (err) {
			error = err.message || 'Search failed.';
		}
	}
	
	res.render('searchbar', { 
		query, 
		results, 
		error, 
		privileges: privs,
		user: req.user || {},
	});
};
