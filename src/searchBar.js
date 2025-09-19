'use strict';

const coreSearch = require('./search'); // NodeBB core search entrypoint

async function createSearchFilters(queryData = {}) {
  if (typeof queryData === 'string') {
    queryData = { query: queryData };
  }

  return {
    query: String(queryData.query || '').trim(),
    searchIn: queryData.searchIn || 'titlesposts',
    page: parseInt(queryData.page, 10) || 1,
    itemsPerPage: parseInt(queryData.itemsPerPage, 10) || 10,
    uid: queryData.uid || 0,
  };
}

async function searchPosts(filters) {
  const start = process.hrtime();
  const results = await coreSearch.search(filters);

  const elapsed = process.hrtime(start);
  const searchTime = (elapsed[0] + elapsed[1] / 1e9).toFixed(2);

  return {
    ...results,
    filters,
    searchTime,
  };
}

async function getSearchSuggestions(query) {
  if (!query || query.length < 2) {
    return { suggestions: [] };
  }

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
