'use strict';

const db = require('../database');
const posts = require('../posts');
const topics = require('../topics');
const categories = require('../categories');
const user = require('../user');

const searchbarController = {};
module.exports = searchbarController;

/**
 * GET /api/searchbar
 * A super lightweight searchbar for posts only
 * - Guests: always allowed
 * - Users: same, but includes more metadata
 */
searchbarController.search = async function (req, res) {
	const startTime = Date.now();
	try {
		// const uid = req.uid || 0;
		const term = (req.query.term || '').toLowerCase().trim();
		const page = Math.max(1, parseInt(req.query.page, 10)) || 1;
		const itemsPerPage = parseInt(req.query.itemsPerPage, 10) || 10;

		if (!term || term.length < 2) {
			return res.json({
				success: true,
				posts: [],
				matchCount: 0,
				pageCount: 0,
				searchTime: 0,
			});
		}

		// All post ids
		const allPids = await db.getSortedSetRange('posts:pid', 0, -1);
		if (!allPids || !allPids.length) {
			return res.json({
				success: true,
				posts: [],
				matchCount: 0,
				pageCount: 0,
				searchTime: 0,
			});
		}

		// Grab lightweight fields
		const postData = await posts.getPostsFields(allPids, [
			'pid', 'content', 'tid', 'cid', 'uid', 'deleted', 'timestamp', 'upvotes',
		]);

		// Filter by content containing term
		const matched = postData.filter(p => p && p.content && p.content.toLowerCase().includes(term));
		if (!matched.length) {
			return res.json({
				success: true,
				posts: [],
				matchCount: 0,
				pageCount: 0,
				searchTime: Date.now() - startTime,
			});
		}

		// Pagination
		const start = (page - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		const slice = matched.slice(start, end);

		// Hydrate topic, category, and user fields
		const [topicsData, catsData, usersData] = await Promise.all([
			topics.getTopicsFields(slice.map(p => p.tid), ['title']),
			categories.getCategoriesFields(slice.map(p => p.cid), ['name']),
			user.getUsersFields(slice.map(p => p.uid), ['username']),
		]);

		const results = slice.map((p, i) => ({
			pid: p.pid || null,
			tid: p.tid || null,
			title: topicsData[i]?.title || null,
			content: /* istanbul ignore next */ p.content ? p.content.replace(/<[^>]+>/g, '') : null,
			sourceContent: /* istanbul ignore next */ p.content || null,
			username: usersData[i]?.username || null,
			category: catsData[i]?.name || null,
			timestamp: p.timestamp || null,
			deleted: p.deleted || 0,
			upvotes: p.upvotes || 0,
			url: p.pid ? `/post/${p.pid}` : (p.tid ? `/topic/${p.tid}` : null),
		  }));
		  
		
		return res.json({
			success: true,
			posts: results,
			matchCount: matched.length,
			pageCount: Math.max(1, Math.ceil(matched.length / itemsPerPage)),
			searchTime: Date.now() - startTime, // always return a number
		});
	} catch (err) {
		console.error('[searchbar error]', err);
		return res.status(500).json({
			success: false,
			error: 'Search failed',
			message: err.message,
			searchTime: Date.now() - startTime, // still return searchTime
		});
	}
};
