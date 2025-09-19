'use strict';

const searchBarModel = require('../searchBar');
const privileges = require('../privileges');
const utils = require('../utils');
const db = require('../database');

const searchBarController = {};
module.exports = searchBarController;

/**
 * Normalize searchIn and check privileges
 */
async function normalizeAndCheck(searchIn, uid, userPrivileges) {
  const valid = ['titles', 'posts', 'titlesposts', 'users', 'categories', 'tags', 'bookmarks'];
  if (!valid.includes(searchIn)) searchIn = 'titlesposts';

  const isGuest = !uid || uid === 0;

  if (isGuest) {
    const guestAllowed = ['titles', 'posts', 'titlesposts', 'bookmarks', 'categories'];
    return { searchIn, allowed: guestAllowed.includes(searchIn) };
  }

  const allowed =
    (searchIn === 'users' && userPrivileges['search:users']) ||
    (searchIn === 'tags' && userPrivileges['search:tags']) ||
    searchIn === 'categories' ||
    ['titles', 'titlesposts', 'posts', 'bookmarks'].includes(searchIn);

  return { searchIn, allowed };
}

async function runSearch(req, res, searchIn, searchData) {
  const filters = await searchBarModel.createSearchFilters(searchData);
  const results = await searchBarModel.searchPosts(filters);

  if (filters.query?.length > 2) {
    await recordSearch(filters);
  }

  return res.json({ success: true, data: results });
}

searchBarController.search = async function (req, res) {
  try {
    const userPrivileges = await utils.promiseParallel({
      'search:users': privileges.global.can('search:users', req.uid),
      'search:content': privileges.global.can('search:content', req.uid),
      'search:tags': privileges.global.can('search:tags', req.uid),
    });

    const { searchIn, allowed } = await normalizeAndCheck(req.query.searchIn || 'titlesposts', req.uid, userPrivileges);
    if (!allowed) return res.status(403).json({ success: false, error: 'Insufficient privileges' });

    const searchData = { ...req.query, searchIn, uid: req.uid || 0 };
    return await runSearch(req, res, searchIn, searchData);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ success: false, error: 'Search failed', message: err.message });
  }
};

searchBarController.advancedSearch = async function (req, res) {
  try {
    const userPrivileges = await utils.promiseParallel({
      'search:users': privileges.global.can('search:users', req.uid),
      'search:content': privileges.global.can('search:content', req.uid),
      'search:tags': privileges.global.can('search:tags', req.uid),
    });

    const { searchIn, allowed } = await normalizeAndCheck(req.body.searchIn || 'titlesposts', req.uid, userPrivileges);
    if (!allowed) return res.status(403).json({ success: false, error: 'Insufficient privileges' });

    const searchData = { ...req.body, searchIn, uid: req.uid || 0 };
    return await runSearch(req, res, searchIn, searchData);
  } catch (err) {
    console.error('Advanced search error:', err);
    res.status(500).json({ success: false, error: 'Advanced search failed', message: err.message });
  }
};

searchBarController.getSuggestions = async function (req, res) {
  try {
    const query = req.query.q || req.query.query || '';
    const suggestions = await searchBarModel.getSearchSuggestions(query, req.uid || 0);
    res.json({ success: true, data: { suggestions, query } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get suggestions', message: err.message });
  }
};

searchBarController.getSearchHistory = async function (req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    if (!req.uid) return res.json({ success: true, data: [] });

    const history = await db.getSortedSetRevRange(`user:${req.uid}:searches`, 0, limit - 1);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get history', message: err.message });
  }
};

searchBarController.clearSearchHistory = async function (req, res) {
  try {
    if (!req.uid) return res.json({ success: true, data: [] });
    await db.delete(`user:${req.uid}:searches`);
    res.json({ success: true, data: { message: 'Search history cleared' } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to clear history', message: err.message });
  }
};

async function recordSearch(filters) {
  const { query, uid } = filters;
  if (!query || query.length < 3) return;

  const cleaned = query.trim().toLowerCase().slice(0, 255);
  await db.sortedSetIncrBy('searches:all', 1, cleaned);

  const day = new Date();
  day.setHours(0, 0, 0, 0);
  await db.sortedSetIncrBy(`searches:${day.getTime()}`, 1, cleaned);

  if (uid) {
    await db.sortedSetAdd(`user:${uid}:searches`, Date.now(), cleaned);
    await db.sortedSetRemoveRangeByRank(`user:${uid}:searches`, 0, -101);
  }
}
