'use strict';

const searchBarModel = require('../searchBar');
const privileges = require('../privileges');
const utils = require('../utils');
const db = require('../database');

const searchBarController = {};
module.exports = searchBarController;

const VALID = ['titles', 'posts', 'titlesposts', 'users', 'categories', 'tags', 'bookmarks'];
const GUEST_OK = ['titles', 'posts', 'titlesposts', 'categories'];

async function normalize(searchIn, uid, privs) {
	searchIn = VALID.includes(searchIn) ? searchIn : 'titlesposts';

	if (!uid) return { searchIn, allowed: GUEST_OK.includes(searchIn) };

	const allowed =
	  searchIn === 'users' ? privs['search:users'] :
	  	searchIn === 'tags' ? privs['search:tags'] :
	  		searchIn === 'categories' || ['titles', 'titlesposts', 'posts', 'bookmarks'].includes(searchIn);

	return { searchIn, allowed };
}

async function runSearch(res, searchData) {
	const filters = await searchBarModel.createSearchFilters(searchData);
	const raw = await searchBarModel.searchPosts(filters);

	const seen = new Set();
	const posts = (raw.posts || [])
		.filter(p => !seen.has(p.pid) && seen.add(p.pid))
		.map(p => ({
			pid: p.pid,
			tid: p.tid,
			title: p.topic?.title || p.title || null,
			content: p.content?.replace(/<[^>]+>/g, '') || null,
			username: p.user?.username || null,
			category: p.category?.name || null,
			timestamp: p.timestamp || null,
			url: p.pid ? `/post/${p.pid}` : `/topic/${p.tid}`,
		}));

	res.json({
		success: true,
		data: {
			posts,
			matchCount: posts.length,
			pageCount: Math.max(1, Math.ceil(posts.length / filters.itemsPerPage)),
			searchTime: raw.searchTime,
			filters,
		},
	});
}

async function handleSearch(req, res, source = 'query') {
	try {
		const privs = await utils.promiseParallel({
			'search:users': privileges.global.can('search:users', req.uid),
			'search:content': privileges.global.can('search:content', req.uid),
			'search:tags': privileges.global.can('search:tags', req.uid),
		});

		const { searchIn, allowed } = await normalize(req[source].searchIn || 'titlesposts', req.uid, privs);
		if (!allowed) return res.status(403).json({ success: false, error: 'Insufficient privileges' });

		const searchData = { ...req[source], searchIn, uid: req.uid || 0 };
		return await runSearch(res, searchData);
	} catch (err) {
		console.error('Search error:', err);
		res.status(500).json({ success: false, error: 'Search failed', message: err.message });
	}
}

// Routes
searchBarController.search = (req, res) => handleSearch(req, res, 'query');
searchBarController.advancedSearch = (req, res) => handleSearch(req, res, 'body');

searchBarController.getSuggestions = async (req, res) => {
	try {
		const q = req.query.q || req.query.query || '';
		const suggestions = await searchBarModel.getSearchSuggestions(q, req.uid || 0);
		res.json({ success: true, data: { suggestions, query: q } });
	} catch (err) {
		res.status(500).json({ success: false, error: 'Failed to get suggestions', message: err.message });
	}
};

searchBarController.getSearchHistory = async (req, res) => {
	try {
		if (!req.uid) return res.json({ success: true, data: [] });
		const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
		const history = await db.getSortedSetRevRange(`user:${req.uid}:searches`, 0, limit - 1);
		res.json({ success: true, data: history });
	} catch (err) {
		res.status(500).json({ success: false, error: 'Failed to get history', message: err.message });
	}
};

searchBarController.clearSearchHistory = async (req, res) => {
	try {
		if (req.uid) await db.delete(`user:${req.uid}:searches`);
		res.json({ success: true, data: { message: 'Search history cleared' } });
	} catch (err) {
		res.status(500).json({ success: false, error: 'Failed to clear history', message: err.message });
	}
};
