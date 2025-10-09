'use strict';

// Test script to verify anonymous checkbox functionality
console.log('=== TESTING ANONYMOUS CHECKBOX INTEGRATION ===');

// Test data structures that should be handled by the plugin
const testData = {
	// Test case 1: Data from frontend form submission
	case1: {
		data: {
			anonymous: '1',
			content: 'Test anonymous post',
			tid: '123',
		},
	},

	// Test case 2: Data from req.body (AJAX submission)
	case2: {
		data: {
			req: {
				body: {
					anonymous: '1',
					content: 'Test anonymous post via AJAX',
					tid: '123',
				},
			},
		},
	},

	// Test case 3: No anonymous flag
	case3: {
		data: {
			content: 'Regular post',
			tid: '123',
		},
	},

	// Test case 4: Different anonymous values
	case4: {
		data: {
			anonymous: true,
			content: 'Test with boolean true',
			tid: '123',
		},
	},

	case5: {
		data: {
			anonymous: 'on',
			content: 'Test with checkbox "on" value',
			tid: '123',
		},
	},

	case6: {
		data: {
			anonymous: 'false',
			content: 'Test with false string (should not be anonymous)',
			tid: '123',
		},
	},
};

// Test the logic from our plugin
function testAnonymousDetection(hookData) {
	const FIELD = 'anonymous';
	const raw = hookData?.data?.[FIELD] ?? hookData?.data?.req?.body?.[FIELD];
	const isAnon = ['1', 1, true, 'true', 'on', 'yes'].includes(raw);

	console.log(`Input: ${JSON.stringify(hookData, null, 2)}`);
	console.log(`Raw value: ${raw}`);
	console.log(`Is Anonymous: ${isAnon}`);
	console.log('---');

	return isAnon;
}

// Test masking function
function testMaskingLogic(post) {
	console.log('Testing masking logic:');
	console.log('Before masking:', JSON.stringify(post, null, 2));

	// Apply masking (simulating the backend logic)
	if (post.user) {
		post.user.displayname = 'Anonymous';
		post.user.username = 'Anonymous';
		post.user.fullname = 'Anonymous';
		post.user.userslug = undefined;
		post.user.picture = undefined; // Remove profile picture
	}

	// Top-level fallbacks
	if ('username' in post) post.username = 'Anonymous';
	if ('userslug' in post) post.userslug = undefined;
	if ('picture' in post) post.picture = undefined;

	// Mark for UI purposes
	post.isAnonymousDisplay = true;
	post.anonymous = 1;

	console.log('After masking:', JSON.stringify(post, null, 2));
	console.log('---');
}

// Run detection tests
console.log('\n=== TESTING ANONYMOUS DETECTION ===');
Object.keys(testData).forEach((testCase) => {
	console.log(`Testing ${testCase}:`);
	testAnonymousDetection(testData[testCase]);
});

// Run masking tests
console.log('\n=== TESTING ANONYMOUS MASKING ===');
const testPost = {
	pid: '456',
	content: 'Test post content',
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
};

testMaskingLogic(JSON.parse(JSON.stringify(testPost))); // Deep copy for testing

console.log('\n=== TEST COMPLETE ===');
console.log('If all tests show expected results, the anonymous functionality should work correctly.');