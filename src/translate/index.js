
/* eslint-disable strict */

const translatorApi = module.exports;

// Use environment variable or default to localhost
const TRANSLATOR_API_URL = process.env.TRANSLATOR_API_URL || 'http://127.0.0.1:5000';

translatorApi.translate = async function (postData) {
	try {
		const response = await fetch(`${TRANSLATOR_API_URL}/?content=${encodeURIComponent(postData.content)}`);
		const data = await response.json();
		return [data.is_english, data.translated_content || ''];
	} catch (error) {
		console.error('Translation API error:', error);
		// Fallback to treating as English if API fails
		return [true, ''];
	}
};
