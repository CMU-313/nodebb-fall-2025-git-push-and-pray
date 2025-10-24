// @flow
'use strict';

/**
 * Flow-annotated utility functions for Anonymous Plugin
 * This demonstrates Flow's type checking capabilities with proper annotations
 */

type PostData = {
	anonymous: boolean | string | number,
	content: string,
	tid: string,
};

type UserInfo = {
	uid: number,
	username: string,
	displayname?: string,
};

type AnonymousUser = {
	uid: number,
	username: string,
	displayname: string,
};

type PostStats = {
	total: number,
	anonymous: number,
	percentage: number,
};

type PostWithFlag = {
	anonymous?: boolean,
	...
};

/**
 * Check if a post should be anonymous based on various input formats
 */
function checkAnonymousFlag(data: PostData): boolean {
	const raw = data.anonymous;
	const validValues = ['1', 1, true, 'true', 'on', 'yes'];
	return validValues.includes(raw);
}

/**
 * Mask user information for anonymous display
 */
function maskUserInfo(user: UserInfo): AnonymousUser {
	return {
		uid: user.uid,
		username: 'Anonymous',
		displayname: 'Anonymous',
	};
}

/**
 * Validate post ID format - expects string input
 */
function validatePostId(pid: string): boolean {
	if (typeof pid !== 'string') {
		return false;
	}
	return /^\d+$/.test(pid);
}

/**
 * Generate anonymous checkbox HTML
 */
function generateCheckboxHtml(id: string): string {
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
function calculateStats(posts: Array<PostWithFlag>): PostStats {
	const total = posts.length;
	const anonymous = posts.filter(post => post.anonymous === true).length;
	const percentage = total > 0 ? (anonymous / total) * 100 : 0;

	return {
		total,
		anonymous,
		percentage: Math.round(percentage * 100) / 100,
	};
}

/**
 * Example with intentional type error for Flow to catch
 * This function demonstrates how Flow catches type mismatches
 */
function demonstrateTypeError(): boolean {
	// This will cause a Flow error: validatePostId expects string, we pass number
	// $FlowExpectedError
	const result = validatePostId(123);
	return result;
}

/**
 * Example of proper type usage
 */
function demonstrateCorrectTypes(): boolean {
	const result = validatePostId('123'); // Correct: passing string
	return result;
}

module.exports = {
	checkAnonymousFlag,
	maskUserInfo,
	validatePostId,
	generateCheckboxHtml,
	calculateStats,
	demonstrateTypeError,
	demonstrateCorrectTypes,
};