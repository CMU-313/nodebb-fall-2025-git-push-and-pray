'use strict';

const search = require('../search');

module.exports = async function (req, res) {
	let results = null;
	let error = null;
	const query = req.query.q;
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
	res.render('searchbar', { query, results, error });
};
