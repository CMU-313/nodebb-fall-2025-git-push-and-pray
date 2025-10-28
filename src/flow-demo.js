// @flow
'use strict';

/**
 * Flow-annotated utility functions for Anonymous Plugin
 * This demonstrates Flow's type checking capabilities
 */

/**
 * Check if a post should be anonymous based on various input formats
 */
function checkAnonymousFlag(data) {
	const raw = data.anonymous;
	const validValues = ['1', 1, true, 'true', 'on', 'yes'];
	return validValues.includes(raw);
}

/**
 * Mask user information for anonymous display
 */
function maskUserInfo(user) {
	return {
		uid: user.uid,
		username: 'Anonymous',
		displayname: 'Anonymous',
	};
}

/**
 * Validate post ID format
 */
function validatePostId(pid) {
	if (typeof pid !== 'string') {
		return false;
	}
	return /^\d+$/.test(pid);
}

/**
 * Generate anonymous checkbox HTML
 */
function generateCheckboxHtml(id) {
	if (!id || typeof id !== 'string') {
		throw new Error('ID must be a non-empty string');
	}

	return `
		<div class="form-group anonymous-checkbox-wrapper">
			<div class="form-check">
				<input type="checkbox" class="form-check-input js-anonymous-checkbox" id="${id}">
				<label class="form-check-label" for="${id}">
					<i class="fa fa-user-secret"></i> Post anonymously
				</label>
			</div>
		</div>
	`;
}

/**
 * Calculate anonymous post statistics
 */
function calculateStats(posts) {
	const total = posts.length;
	const anonymous = posts.filter(post => post.anonymous === true).length;
	const percentage = total > 0 ? (anonymous / total) * 100 : 0;

	return {
		total,
		anonymous,
		percentage: Math.round(percentage * 100) / 100,
	};
}

// Example with intentional type error for Flow to catch
function demonstrateTypeError() {
	// Flow should catch this error when we pass wrong types
	const result = validatePostId(123); // Should be string, not number
	return result;
}

module.exports = {
	checkAnonymousFlag,
	maskUserInfo,
	validatePostId,
	generateCheckboxHtml,
	calculateStats,
	demonstrateTypeError,
};