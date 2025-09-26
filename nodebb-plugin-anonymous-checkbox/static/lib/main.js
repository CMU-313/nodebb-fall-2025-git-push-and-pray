/* global $, app, socket, require */
'use strict';

// Main anonymous plugin initialization
$(document).ready(function() {
    console.log('=== Anonymous Plugin Main.js Loaded ===');
    
    // Initialize any global anonymous features
    initAnonymousFeatures();
    
    // Set up socket listeners for real-time updates
    if (typeof socket !== 'undefined') {
        setupSocketListeners();
    }
});

function initAnonymousFeatures() {
    console.log('=== Initializing Anonymous Features ===');
    
    // Add anonymous indicators to existing posts
    markAnonymousPosts();
    
    // Set up any additional UI enhancements
    setupAnonymousUI();
}

function markAnonymousPosts() {
    // Find posts that should be marked as anonymous
    $('[component="post"]').each(function() {
        const $post = $(this);
        const postData = $post.data();
        
        // Check if post is anonymous (this would come from your backend data)
        if (postData.anonymous || $post.find('[data-anonymous="true"]').length > 0) {
            $post.addClass('anonymous-post');
            console.log('Marked post as anonymous:', $post.attr('data-pid'));
        }
    });
}

function setupAnonymousUI() {
    // Add any additional UI features for anonymous posts
    console.log('Setting up anonymous UI features');
    
    // Example: Add tooltip to anonymous posts
    $('.anonymous-post').attr('title', 'This post was made anonymously');
}

function setupSocketListeners() {
    console.log('=== Setting up Socket Listeners ===');
    
    // Listen for new posts
    socket.on('event:new_post', function(data) {
        console.log('New post received:', data);
        
        if (data.post && data.post.anonymous) {
            console.log('New anonymous post detected');
            // Handle new anonymous post display
            setTimeout(markAnonymousPosts, 100);
        }
    });
    
    // Listen for new topics
    socket.on('event:new_topic', function(data) {
        console.log('New topic received:', data);
        
        if (data.topic && data.topic.anonymous) {
            console.log('New anonymous topic detected');
            // Handle new anonymous topic display
            setTimeout(markAnonymousPosts, 100);
        }
    });
}

// Export functions for use in other parts of the plugin
if (typeof window !== 'undefined') {
    window.AnonymousPlugin = {
        markAnonymousPosts: markAnonymousPosts,
        setupAnonymousUI: setupAnonymousUI
    };
}