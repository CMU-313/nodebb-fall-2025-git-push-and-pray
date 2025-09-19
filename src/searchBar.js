'use strict';

const coreSearch = require('./search'); // NodeBB core search entrypoint

async function createSearchFilters(queryData = {}) {
  if (typeof queryData === 'string') {
    queryData = { query: queryData };
  }

  return {
    query: String(queryData.query || '').trim(),
    searchIn: queryData.searchIn || 'titlesposts', // can be titles, posts, both
    page: queryData.page || 1,
    itemsPerPage: queryData.itemsPerPage || 10,
    uid: queryData.uid || 0,
  };
}

/**
 * Run a search against NodeBB's search system (dbsearch, solr, etc.)
 */
async function searchPosts(filters) {
  const start = process.hrtime();

  // delegate directly to NodeBB's core search
  const results = await coreSearch.search(filters);

  const elapsed = process.hrtime(start);
  const searchTime = (elapsed[0] + elapsed[1] / 1e9).toFixed(2);

  return {
    ...results,
    filters,
    searchTime,
  };
}

/**
 * Simple suggestion mock (wire up later if needed)
 */
async function getSearchSuggestions(query) {
  if (!query || query.length < 2) return { suggestions: [] };

  // could also call coreSearch or db to get real suggestions
  return {
    recent: [],
    popular: [],
    users: [],
    categories: [],
  };
}

module.exports = {
  createSearchFilters,
  searchPosts,
  getSearchSuggestions,
};
