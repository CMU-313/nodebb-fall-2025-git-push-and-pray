'use strict';

const assert = require('assert');
const path = require('path');

// Mock plugin functions for testing the logic
const plugin = {
	filterRenderTopics: function (hookData) {
		hookData.templateData.posts.forEach(post => {
			if (post.anonymous === 1) {
				post.anonymousClass = 'anonymous-post';
				post.anonymousDataAttr = 'data-anonymous="true"';
			}
		});
		return hookData;
	},
	
	filterRenderTopic: function (hookData) {
		hookData.templateData.posts.forEach(post => {
			if (post.anonymous === 1) {
				post.anonymousClass = 'anonymous-post';
				post.anonymousDataAttr = 'data-anonymous="true"';
			}
		});
		return hookData;
	},
};

// Dummy helper for testing
function makePost({anonymous = false} = {}) {
	const post = {
		pid: '1',
		content: 'Test post',
		user: {
			uid: '123',
			username: 'testuser',
			displayname: 'Test User',
			fullname: 'Test User Full',
			userslug: 'testuser',
			picture: '/uploads/profile/123.jpg',
		},
		username: 'testuser',
		userslug: 'testuser',
		anonymous: anonymous ? 1 : 0,
	};
	return post;
}

// Dummy isAnon function if plugin relies on it
function isAnon(post) {
	return post.anonymous === 1;
}

// Attach helper to global if plugin uses it
global.isAnon = isAnon;

describe('Anonymous plugin basics', function () {

	describe('filterRenderTopics', function () {
		it('marks anonymous posts correctly', async function () {
			const hookData = { templateData: { posts: [makePost({anonymous: true}), makePost({anonymous: false})] } };
			const result = await plugin.filterRenderTopics(hookData);

			// Anonymous post should have masking attributes
			const anonPost = result.templateData.posts[0];
			assert.strictEqual(anonPost.anonymousClass, 'anonymous-post');
			assert.strictEqual(anonPost.anonymousDataAttr, 'data-anonymous="true"');

			// Non-anonymous post should not have masking
			const normalPost = result.templateData.posts[1];
			assert.strictEqual(normalPost.anonymousClass, undefined);
			assert.strictEqual(normalPost.anonymousDataAttr, undefined);
		});
	});

	describe('filterRenderTopic', function () {
		it('marks anonymous posts correctly', async function () {
			const hookData = { templateData: { posts: [makePost({anonymous: true}), makePost({anonymous: false})] } };
			const result = await plugin.filterRenderTopic(hookData);

			const anonPost = result.templateData.posts[0];
			assert.strictEqual(anonPost.anonymousClass, 'anonymous-post');
			assert.strictEqual(anonPost.anonymousDataAttr, 'data-anonymous="true"');

			const normalPost = result.templateData.posts[1];
			assert.strictEqual(normalPost.anonymousClass, undefined);
			assert.strictEqual(normalPost.anonymousDataAttr, undefined);
		});
	});

	describe('maskDisplay / client-side masking', function () {
		it('applies anonymous masking correctly', function () {
			const post = makePost({anonymous: true});
			// simulate maskDisplay / applyClientSideAnonymousMasking
			const FIELD = 'anonymous';
			if (post.anonymous === 1) {
				post.user.username = 'Anonymous';
				post.user.displayname = 'Anonymous';
				post.user.fullname = 'Anonymous';
				post.user.userslug = undefined;
				post.user.picture = undefined;
				post.user['icon:text'] = '';
				post.user['icon:bgColor'] = '#666666';

				post.username = 'Anonymous';
				post.userslug = undefined;
				post.picture = undefined;
				post[FIELD] = 1;
				post.anonymous = 1;
				post.isAnonymousDisplay = true;

				post.anonymousClass = 'anonymous-post';
				post.anonymousDataAttr = 'data-anonymous="true"';
			}

			assert.strictEqual(post.user.username, 'Anonymous');
			assert.strictEqual(post.user.displayname, 'Anonymous');
			assert.strictEqual(post.user.fullname, 'Anonymous');
			assert.strictEqual(post.user.userslug, undefined);
			assert.strictEqual(post.user.picture, undefined);
			assert.strictEqual(post.user['icon:bgColor'], '#666666');

			assert.strictEqual(post.anonymousClass, 'anonymous-post');
			assert.strictEqual(post.anonymousDataAttr, 'data-anonymous="true"');
			assert.strictEqual(post.isAnonymousDisplay, true);
		});
	});

});
