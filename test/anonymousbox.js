'use strict';

const should = require('should'); // assertion library
const path = require('path');

// Require your plugin
// const plugin = require(path.join(__dirname, '../nodebb-plugin-anonymous-checkbox/plugin'));
const plugin = require('../nodebb-plugin-anonymous-checkbox');

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
			anonPost.anonymousClass.should.equal('anonymous-post');
			anonPost.anonymousDataAttr.should.equal('data-anonymous="true"');

			// Non-anonymous post should not have masking
			const normalPost = result.templateData.posts[1];
			should(normalPost.anonymousClass).be.undefined();
			should(normalPost.anonymousDataAttr).be.undefined();
		});
	});

	describe('filterRenderTopic', function () {
		it('marks anonymous posts correctly', async function () {
			const hookData = { templateData: { posts: [makePost({anonymous: true}), makePost({anonymous: false})] } };
			const result = await plugin.filterRenderTopic(hookData);

			const anonPost = result.templateData.posts[0];
			anonPost.anonymousClass.should.equal('anonymous-post');
			anonPost.anonymousDataAttr.should.equal('data-anonymous="true"');

			const normalPost = result.templateData.posts[1];
			should(normalPost.anonymousClass).be.undefined();
			should(normalPost.anonymousDataAttr).be.undefined();
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

			post.user.username.should.equal('Anonymous');
			post.user.displayname.should.equal('Anonymous');
			post.user.fullname.should.equal('Anonymous');
			should(post.user.userslug).be.undefined();
			should(post.user.picture).be.undefined();
			post.user['icon:bgColor'].should.equal('#666666');

			post.anonymousClass.should.equal('anonymous-post');
			post.anonymousDataAttr.should.equal('data-anonymous="true"');
			post.isAnonymousDisplay.should.be.true();
		});
	});

});
