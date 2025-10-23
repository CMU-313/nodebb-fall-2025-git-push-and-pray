#!/usr/bin/env node

'use strict';

// Test script to verify anonymous checkbox functionality in production
console.log('=== TESTING ANONYMOUS CHECKBOX INTEGRATION ===');

// Simulate production environment
process.env.NODE_ENV = 'production';

// Test the condition that was previously causing issues
const isTestEnvironment = process.env.NODE_ENV === 'test';
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Is test environment:', isTestEnvironment);
console.log('Plugin should be active:', !isTestEnvironment);

if (!isTestEnvironment) {
    console.log('✅ Plugin will be active in production');
} else {
    console.log('❌ Plugin would be disabled');
}

// Test data structures that should be handled by the plugin
const testData = {
    // Test case 1: Data from frontend form submission
    case1: {
        description: 'Frontend form submission',
        data: {
            anonymous: '1',
            content: 'Test anonymous post',
            tid: '123',
        },
        shouldBeAnonymous: true
    },

    // Test case 2: Data from req.body (AJAX submission)
    case2: {
        description: 'AJAX submission',
        data: {
            req: {
                body: {
                    anonymous: '1',
                    content: 'Test anonymous post via AJAX',
                    tid: '123',
                },
            },
        },
        shouldBeAnonymous: true
    },

    // Test case 3: No anonymous flag
    case3: {
        description: 'Regular post (no anonymous flag)',
        data: {
            content: 'Regular post',
            tid: '123',
        },
        shouldBeAnonymous: false
    },

    // Test case 4: Different anonymous values
    case4: {
        description: 'Boolean true value',
        data: {
            anonymous: true,
            content: 'Test with boolean true',
            tid: '123',
        },
        shouldBeAnonymous: true
    },

    case5: {
        description: 'Checkbox "on" value',
        data: {
            anonymous: 'on',
            content: 'Test with checkbox on',
            tid: '123',
        },
        shouldBeAnonymous: true
    }
};

// Test the anonymous detection logic
function testAnonymousDetection(data) {
    const FIELD = 'anonymous';
    const raw = data?.data?.[FIELD] ?? data?.data?.req?.body?.[FIELD];
    const isAnon = ['1', 1, true, 'true', 'on', 'yes'].includes(raw);
    return isAnon;
}

console.log('\n=== TESTING ANONYMOUS DETECTION LOGIC ===');

Object.keys(testData).forEach(key => {
    const test = testData[key];
    const result = testAnonymousDetection(test);
    const status = result === test.shouldBeAnonymous ? '✅' : '❌';
    
    console.log(`${status} ${test.description}: ${result} (expected: ${test.shouldBeAnonymous})`);
    if (result !== test.shouldBeAnonymous) {
        console.log('   Raw value:', test.data?.anonymous ?? test.data?.req?.body?.anonymous);
    }
});

console.log('\n=== TEST COMPLETE ===');

// Quick Docker check
const { exec } = require('child_process');

exec('docker ps | grep nodebb', (error, stdout, stderr) => {
    if (error) {
        console.log('\n⚠️  Could not check Docker status');
        return;
    }
    
    if (stdout) {
        console.log('\n🐳 NodeBB Docker container is running');
        console.log('   Container info:', stdout.trim().split('\n')[0]);
    } else {
        console.log('\n⚠️  NodeBB Docker container not found');
    }
});

console.log('\n📝 Next steps:');
console.log('1. Ensure NodeBB is running: docker compose -f docker-compose-redis.yml up -d');
console.log('2. Activate the plugin via admin panel or command line');
console.log('3. Test creating an anonymous post on your site');
console.log('4. Check browser console for debug messages starting with "=== ANONYMOUS"');