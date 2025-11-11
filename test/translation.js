'use strict';

const assert = require('assert');
const nconf = require('nconf');

const db = require('./mocks/databasemock');
const topics = require('../src/topics');
const posts = require('../src/posts');
const categories = require('../src/categories');
const user = require('../src/user');
const groups = require('../src/groups');
const privileges = require('../src/privileges');

describe('Translation Feature', () => {
	let adminUid;
	let regularUid;
	let category;

	before(async () => {
		// Create test users
		adminUid = await user.create({ username: 'admin', password: '123456' });
		await groups.join('administrators', adminUid);
		regularUid = await user.create({ username: 'regular', password: '123456' });

		// Create test category
		category = await categories.create({
			name: 'Test Category',
			description: 'Test category for translation',
		});
		await privileges.categories.give(['groups:topics:create', 'groups:topics:read'], category.cid, 'registered-users');
	});

	describe('Non-English Posts', () => {
		it('should detect and translate Chinese posts', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'Chinese Test',
				content: '这是一条中文消息',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.content, '这是一条中文消息');
			assert.strictEqual(postData.isEnglish, false);
			assert.strictEqual(postData.translatedContent, 'This is a Chinese message');
		});

		it('should detect and translate French posts', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'French Test',
				content: 'Ceci est un message en français',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.content, 'Ceci est un message en français');
			assert.strictEqual(postData.isEnglish, false);
			assert.strictEqual(postData.translatedContent, 'This is a French message');
		});

		it('should detect and translate Spanish posts', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'Spanish Test',
				content: 'Esta es un mensaje en español',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.content, 'Esta es un mensaje en español');
			assert.strictEqual(postData.isEnglish, false);
			assert.strictEqual(postData.translatedContent, 'This is a Spanish message');
		});

		it('should detect and translate Japanese posts', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'Japanese Test',
				content: 'これは日本語のメッセージです',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.content, 'これは日本語のメッセージです');
			assert.strictEqual(postData.isEnglish, false);
			assert.strictEqual(postData.translatedContent, 'This is a Japanese message');
		});

		it('should detect and translate Korean posts', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'Korean Test',
				content: '이것은 한국어 메시지입니다',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.content, '이것은 한국어 메시지입니다');
			assert.strictEqual(postData.isEnglish, false);
			assert.strictEqual(postData.translatedContent, 'This is a Korean message');
		});

		it('should detect and translate German posts', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'German Test',
				content: 'Dies ist eine Nachricht auf Deutsch',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.content, 'Dies ist eine Nachricht auf Deutsch');
			assert.strictEqual(postData.isEnglish, false);
			assert.strictEqual(postData.translatedContent, 'This is a German message');
		});

		it('should detect and translate Arabic posts', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'Arabic Test',
				content: 'هذه رسالة باللغة العربية',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.content, 'هذه رسالة باللغة العربية');
			assert.strictEqual(postData.isEnglish, false);
			assert.strictEqual(postData.translatedContent, 'This is an Arabic message');
		});
	});

	describe('English Posts', () => {
		it('should recognize English posts and not translate', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'English Test',
				content: 'This is an English message',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.content, 'This is an English message');
			assert.strictEqual(postData.isEnglish, true);
			assert.strictEqual(postData.translatedContent, 'This is an English message');
		});

		it('should handle English conversational posts', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'English Conversation',
				content: 'What time is the meeting tomorrow?',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.content, 'What time is the meeting tomorrow?');
			assert.strictEqual(postData.isEnglish, true);
			assert.strictEqual(postData.translatedContent, 'What time is the meeting tomorrow?');
		});

		it('should handle English technical posts', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'Technical Discussion',
				content: 'NodeBB is such a flexible platform.',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.content, 'NodeBB is such a flexible platform.');
			assert.strictEqual(postData.isEnglish, true);
			assert.strictEqual(postData.translatedContent, 'NodeBB is such a flexible platform.');
		});
	});

	describe('Eval Set - Non-English', () => {
		it('should translate German eval post', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'German Eval',
				content: 'Hier ist dein erstes Beispiel.',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.isEnglish, false);
			assert.strictEqual(postData.translatedContent, 'This is your first example.');
		});

		it('should translate French greeting', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'French Greeting',
				content: 'Bonjour tout le monde',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.isEnglish, false);
			assert.strictEqual(postData.translatedContent, 'Hello everyone');
		});

		it('should translate Spanish question', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'Spanish Question',
				content: '¿Dónde está la biblioteca?',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.isEnglish, false);
			assert.strictEqual(postData.translatedContent, 'Where is the library?');
		});

		it('should translate Russian programming post', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'Russian Programming',
				content: 'Я люблю изучать программирование.',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.isEnglish, false);
			assert.strictEqual(postData.translatedContent, 'I love studying programming.');
		});
	});

	describe('Eval Set - English', () => {
		it('should recognize English project post', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'Project Update',
				content: 'This project is going really well.',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.isEnglish, true);
			assert.strictEqual(postData.translatedContent, 'This project is going really well.');
		});

		it('should recognize English debugging request', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'Debug Help',
				content: 'I need help debugging this function.',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.isEnglish, true);
			assert.strictEqual(postData.translatedContent, 'I need help debugging this function.');
		});

		it('should recognize English GitHub post', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'GitHub Update',
				content: 'I just pushed a fix to GitHub.',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.isEnglish, true);
			assert.strictEqual(postData.translatedContent, 'I just pushed a fix to GitHub.');
		});
	});

	describe('Malformed Posts', () => {
		it('should handle unintelligible text', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'Random Text',
				content: 'asdjlk 23l;kjf',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.isEnglish, false);
			assert.strictEqual(postData.translatedContent, '[Unintelligible text]');
		});

		it('should handle punctuation-only posts', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'Punctuation',
				content: '???!!!',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.isEnglish, false);
			assert.strictEqual(postData.translatedContent, '[Unintelligible text]');
		});

		it('should handle gibberish posts', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'Gibberish',
				content: 'bla bla blahhhh??',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			assert.strictEqual(postData.isEnglish, false);
			assert.strictEqual(postData.translatedContent, '[Unintelligible text]');
		});
	});

	describe('Post Retrieval', () => {
		it('should include translation fields in post summaries', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'Summary Test',
				content: 'Ciao, piacere di conoscerti!',
			});

			const summary = await posts.getPostSummaryByPids([result.postData.pid], regularUid, {});
			assert(summary.length > 0);
			assert(summary[0].hasOwnProperty('isEnglish'));
			assert(summary[0].hasOwnProperty('translatedContent'));
			assert.strictEqual(summary[0].isEnglish, false);
			assert.strictEqual(summary[0].translatedContent, 'Hi, nice to meet you!');
		});
	});

	describe('API Fallback', () => {
		it('should handle unknown content gracefully', async () => {
			const result = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'Unknown Content',
				content: 'Some completely new content that is not in the hardcoded list',
			});

			const postData = await posts.getPostFields(result.postData.pid, ['content', 'isEnglish', 'translatedContent']);
			// Should default to English if translation API fails or doesn't recognize
			assert.strictEqual(postData.isEnglish, true);
			assert.strictEqual(postData.content, 'Some completely new content that is not in the hardcoded list');
		});
	});
});
