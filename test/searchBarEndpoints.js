'use strict';

const assert = require('assert');
const request = require('supertest');

const baseUrl = 'http://localhost:4567'; // NodeBB must already be running

describe('Search Bar API', function () {
  this.timeout(5000);

  it('Basic Search should return results structure', async function () {
    const response = await request(baseUrl)
      .get('/api/search')
      .query({
        term: 'javascript',
        in: 'titlesposts',
        page: 1,
        itemsPerPage: 5,
      })
      .expect(200);

    assert.strictEqual(response.body.success, true);
    assert.ok(response.body.data, 'Response should contain data object');
    assert.strictEqual(response.body.data.query, 'demo');
    assert.strictEqual(response.body.data.searchIn, 'titlesposts');
    assert.ok(response.body.data.pagination, 'Should have pagination');
    assert.ok(typeof response.body.data.searchTime === 'string');
  });

  it('Advanced Search should apply filters', async function () {
    const searchData = {
      query: 'nodejs tutorial',
      searchIn: 'posts',
      categories: ['1'],
      hasTags: ['javascript'],
      timeRange: 30,
      timeFilter: 'newer',
      sortBy: 'timestamp',
      sortDirection: 'desc',
      page: 1,
      itemsPerPage: 10,
    };

    const response = await request(baseUrl)
      .post('/api/search/advanced')
      .send(searchData)
      .expect(200);

    assert.strictEqual(response.body.success, true);
    assert.ok(response.body.data.filters, 'Response should contain filters');
    assert.ok(
      response.body.data.filters.hasTags.includes('javascript'),
      'Should filter by tag'
    );
  });

  it('Search Suggestions should return list', async function () {
    const response = await request(baseUrl)
      .get('/api/search/suggestions')
      .query({ q: 'java' })
      .expect(200);

    assert.strictEqual(response.body.success, true);
    assert.ok(response.body.data.suggestions, 'Should contain suggestions');
    assert.strictEqual(response.body.data.query, 'java');
  });

  it('Quick Search should respect limit', async function () {
    const response = await request(baseUrl)
      .get('/api/search/quick')
      .query({ q: 'javascript', limit: 5 })
      .expect(200);

    assert.strictEqual(response.body.success, true);
    assert.strictEqual(response.body.data.limit, 5);
    assert.ok(Array.isArray(response.body.data.results));
  });

  it('Search History GET should return history (guest = empty)', async function () {
    const response = await request(baseUrl)
      .get('/api/search/history')
      .query({ limit: 10 })
      .expect(200);

    assert.strictEqual(response.body.success, true);
    assert.ok(Array.isArray(response.body.data.history));
  });

  it('Error Handling should return 403 for invalid type', async function () {
	const response = await request(baseUrl)
	  .get('/api/search')
	  .query({ term: 'test', in: 'invalid_type' })
	  .expect(403);
  
	assert.strictEqual(response.body.success, false, 'Should not succeed');
	assert.strictEqual(response.body.code, 'INSUFFICIENT_PRIVILEGES');
  });
  

  it('Response Time should be reported', async function () {
    const startTime = Date.now();

    const response = await request(baseUrl)
      .get('/api/search')
      .query({ term: 'test', in: 'titlesposts' })
      .expect(200);

    const responseTime = Date.now() - startTime;
    const reportedTime = parseFloat(response.body.data.searchTime);

    assert.ok(responseTime < 2000, 'Response should be under 2s');
    assert.ok(!isNaN(reportedTime), 'Reported time should be a number');
  });
});
