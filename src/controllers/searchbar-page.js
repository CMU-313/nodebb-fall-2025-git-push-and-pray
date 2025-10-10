'use strict';

const privileges = require('../privileges');
const utils = require('../utils');

module.exports = async function (req, res) {
	// Get user privileges for search options
	const privs = await utils.promiseParallel({
		'search:users': privileges.global.can('search:users', req.uid),
		'search:content': privileges.global.can('search:content', req.uid),
		'search:tags': privileges.global.can('search:tags', req.uid),
	});
	
	const query = req.query.q || req.query.term || '';
	
	res.render('searchbar', { 
		query: query,
		privileges: privs,
		user: req.user || {},
		title: '[[global:search]]',
	});
};