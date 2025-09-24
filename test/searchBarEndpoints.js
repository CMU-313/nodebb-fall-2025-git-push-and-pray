'use strict';

const assert = require('assert');
const request = require('supertest');

const baseUrl = 'http://localhost:4567';

describe('Search Bar RBAC', function () {
	this.timeout(5000);

	it('Guest can search in titlesposts (allowed)', async function () {
		const res = await request(baseUrl)
			.get('/api/search')
			.query({ query: 'demo', searchIn: 'titlesposts' })
			.expect(200);

		assert.strictEqual(res.body.success, true);
		assert.ok(Array.isArray(res.body.data.posts));
	});

	it('Guest cannot search in users (should be 403)', async function () {
		const res = await request(baseUrl)
			.get('/api/search')
			.query({ query: 'demo', searchIn: 'users' })
			.expect(403);

		assert.strictEqual(res.body.success, false);
		assert.match(res.body.error, /Insufficient privileges/);
	});

	it('Authenticated user can search categories (always allowed)', async function () {
		// simulate uid=1 (needs NodeBB test user logged in with a cookie or token)
		const agent = request.agent(baseUrl);

		const res = await agent
			.get('/api/search')
			.set('x-user-uid', '1') // adjust depending on your auth middleware
			.query({ query: 'demo', searchIn: 'categories' })
			.expect(200);

		assert.strictEqual(res.body.success, true);
		assert.ok(res.body.data.filters.searchIn === 'categories');
	});

	it('Authenticated user without privilege cannot search tags', async function () {
		// If privileges.global.can('search:tags') is false for uid, should fail
		const res = await request(baseUrl)
			.get('/api/search')
			.set('x-user-uid', '2')
			.query({ query: 'demo', searchIn: 'tags' })
			.expect(403);

		assert.strictEqual(res.body.success, false);
	});

});
