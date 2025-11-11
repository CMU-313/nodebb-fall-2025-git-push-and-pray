
/* eslint-disable strict */

const translatorApi = module.exports;

translatorApi.translate = async function (postData) {
	try {
		const TRANSLATOR_API = 'http://127.0.0.1:5000';
		const response = await fetch(`${TRANSLATOR_API}/?content=${encodeURIComponent(postData.content)}`);
		const data = await response.json();
		return [data.is_english, data.translated_content || ''];
	} catch (error) {
		console.error('Translation API error:', error);
		// FOR TESTING: Return non-English to always show translate button when API fails
		return [false, '[Translation service unavailable - this is a test translation]'];
	}
};
