'use strict';

const assert = require('assert');
const sinon = require('sinon');

const searchBarModel = require('../../src/searchBar'); 
const coreSearch = require('../../src/search');
const db = require('../../src/database');
const user = require('../../src/user');
const categories = require('../../src/categories');


process.env.NODE_ENV = 'test';
const winston = require('winston');
if (winston.transports && winston.transports.Console) {
  winston.remove(winston.transports.Console);
}


describe('SearchBarModel', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('createSearchFilters', function () {
    it('should return default filters when no input is provided', async function () {
      const filters = await searchBarModel.createSearchFilters({});
      assert.strictEqual(filters.query, '');
      assert.strictEqual(filters.searchIn, 'titlesposts');
      assert.strictEqual(filters.matchWords, 'all');
      assert.strictEqual(filters.sortBy, 'relevance');
      assert.strictEqual(filters.sortDirection, 'desc');
      assert.strictEqual(filters.page, 1);
      assert.strictEqual(filters.itemsPerPage, 10);
    });

    it('should sanitize and fix invalid values', async function () {
      const filters = await searchBarModel.createSearchFilters({
        query: '<script>alert(1)</script>',
        searchIn: 'notvalid',
        matchWords: 'wrong',
        sortBy: 'nonsense',
        sortDirection: 'invalid',
        timeFilter: 'bad',
        repliesFilter: 'weird',
      });

      assert.strictEqual(filters.searchIn, 'titlesposts');
      assert.strictEqual(filters.matchWords, 'all');
      assert.strictEqual(filters.sortBy, 'relevance');
      assert.strictEqual(filters.sortDirection, 'desc');
      assert.strictEqual(filters.timeFilter, '');
      assert.strictEqual(filters.repliesFilter, '');
      assert.ok(!filters.query.includes('<script>'), 'Query should be escaped');
    });
  });

  describe('searchPosts', function () {
    it('should call coreSearch.search and wrap results', async function () {
      const fakeResults = { posts: [], totalCount: 0 };
      const searchStub = sinon.stub(coreSearch, 'search').resolves(fakeResults);

      const filters = { query: 'test', searchIn: 'posts', uid: 0 };
      const results = await searchBarModel.searchPosts(filters);

      assert(searchStub.calledOnce, 'coreSearch.search should be called');
      assert.strictEqual(results.posts.length, 0);
      assert.strictEqual(results.filters, filters);
      assert.ok(results.searchTime, 'Search time should be set');
    });
  });

  describe('getSearchSuggestions', function () {
    it('should return empty suggestions for short queries', async function () {
      const result = await searchBarModel.getSearchSuggestions('a');
      assert.deepStrictEqual(result, { suggestions: [] });
    });

    it('should return suggestions from db, user, and categories', async function () {
      sinon.stub(db, 'getSortedSetRevRange').resolves(['javascript', 'java']);
      sinon.stub(db, 'getSortedSetRevRangeWithScores').resolves([
        { value: 'nodejs', score: 10 },
        { value: 'java', score: 5 },
      ]);
      sinon.stub(user, 'search').resolves({ users: [{ uid: 1, username: 'alice' }] });
      sinon.stub(categories, 'search').resolves({ categories: [{ cid: 1, name: 'General' }] });

      const result = await searchBarModel.getSearchSuggestions('ja');

      assert.ok(result.recent.includes('java'), 'Recent should include "java"');
      assert.ok(result.popular.includes('java'), 'Popular should include "java"');
      assert.strictEqual(result.users[0].username, 'alice');
      assert.strictEqual(result.categories[0].name, 'General');
    });

    it('should handle errors gracefully', async function () {
      sinon.stub(db, 'getSortedSetRevRange').rejects(new Error('DB fail'));

      const result = await searchBarModel.getSearchSuggestions('test');
      assert.ok(result, 'Should still return an object');
      assert.deepStrictEqual(Object.keys(result), ['recent', 'popular', 'users', 'categories']);
    });
  });
});
