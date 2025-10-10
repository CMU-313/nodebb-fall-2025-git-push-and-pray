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
    
    // Mark anonymous posts every time posts are loaded
    $(document).on('ajaxComplete', function() {
        setTimeout(markAnonymousPosts, 100);
    });
    
    // Also mark on initial page load
    setTimeout(markAnonymousPosts, 500);
    
    // Override socket event handlers to apply immediate masking
    if (typeof window !== 'undefined' && window.socket) {
        const originalEmit = window.socket.emit;
        window.socket.emit = function(...args) {
            console.log('Socket emit:', args[0], args.length > 1 ? args[1] : '');
            return originalEmit.apply(this, args);
        };
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
        
        // Check multiple ways a post could be marked as anonymous
        const isAnonymousPost = postData.anonymous || 
                               postData.anonymous === 1 || 
                               postData.anonymous === '1' || 
                               $post.find('[data-anonymous="true"]').length > 0 || 
                               $post.attr('data-anonymous') === 'true' || 
                               $post.hasClass('anonymous-post') ||
                               // Check if the username is already "Anonymous"
                               $post.find('[component="post/username"], .username').text().trim() === 'Anonymous';
        
        if (isAnonymousPost) {
            $post.addClass('anonymous-post');
            $post.attr('data-anonymous', 'true');
            
            // Hide the actual profile image and show grey circle
            const $avatar = $post.find('.avatar, [component="user/picture"], [component="post/author"] .avatar');
            if ($avatar.length > 0) {
                $avatar.addClass('anonymous-avatar');
                $avatar.find('img').hide();
                // Clear any text content (like initials)
                $avatar.contents().each(function() {
                    if (this.nodeType === 3) { // Text node
                        this.textContent = '';
                    }
                });
                // Clear any generated initials
                $avatar.html('');
                $avatar.text('');
                
                // Force the styling
                $avatar.css({
                    'background': '#666',
                    'color': 'transparent',
                    'font-size': '0',
                    'text-indent': '-9999px'
                });
            }
            
            console.log('Marked post as anonymous:', $post.attr('data-pid'));
        }
    });
}

function isPostAnonymous(post) {
    // Check if the post has the anonymous flag
    return post.anonymous === 1 || post.anonymous === '1' || post.anonymous === true;
}

function applyAnonymousMasking(post) {
    // Apply the same masking logic that the server uses
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
    
    // Mark for UI purposes
    post.isAnonymousDisplay = true;
    
    console.log('Applied anonymous masking to post:', post.pid);
}

function updateAnonymousPostInDOM(pid) {
    // Find the post element in the DOM and update display names
    const $post = $(`[component="post"][data-pid="${pid}"]`);
    if ($post.length > 0) {
        console.log('Updating DOM for anonymous post:', pid);
        
        // Update all username/displayname references in the post
        $post.find('[component="post/username"], .username').text('Anonymous');
        $post.find('[component="post/author/displayname"], .post-author-displayname').text('Anonymous');
        $post.find('a[href*="/user/"]').each(function() {
            const $link = $(this);
            $link.attr('href', '#').text('Anonymous');
        });
        
        // Hide or replace profile pictures
        $post.find('[component="post/author/avatar"] img, .post-author-avatar img').each(function() {
            $(this).attr('src', '/assets/uploads/system/avatar-default.png').attr('alt', 'Anonymous');
        });
        
        // Add anonymous indicator class
        $post.addClass('anonymous-post');
    }
}

function markAnonymousPostsInDOM() {
    // Scan all posts in the DOM and apply anonymous styling/masking
    $('[component="post"]').each(function() {
        const $post = $(this);
        const pid = $post.attr('data-pid');
        
        // Check various ways the anonymous flag might be present
        if ($post.data('anonymous') === true || 
            $post.data('anonymous') === 1 || 
            $post.data('anonymous') === '1' ||
            $post.find('[data-anonymous="true"]').length > 0 ||
            $post.hasClass('anonymous-post')) {
            
            console.log('Found anonymous post in DOM:', pid);
            updateAnonymousPostInDOM(pid);
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
    
    // Listen for new posts and apply anonymous masking immediately
    socket.on('event:new_post', function(data) {
        console.log('New post received:', data);
        
        if (data.posts && data.posts.length > 0) {
            data.posts.forEach(function(post) {
                if (isPostAnonymous(post)) {
                    console.log('New anonymous post detected, applying immediate masking:', post.pid);
                    // Apply anonymous masking immediately on client side
                    applyAnonymousMasking(post);
                }
            });
        }
    });
    
    // Listen for new topics and apply anonymous masking immediately
    socket.on('event:new_topic', function(data) {
        console.log('New topic received:', data);
        
        if (data.posts && data.posts.length > 0) {
            data.posts.forEach(function(post) {
                if (isPostAnonymous(post)) {
                    console.log('New anonymous topic post detected, applying immediate masking:', post.pid);
                    // Apply anonymous masking immediately on client side
                    applyAnonymousMasking(post);
                }
            });
        }
    });
}

// Alternative approach: Hook into NodeBB's core hooks if available
if (typeof require === 'function') {
    require(['hooks'], function(hooks) {
        console.log('=== Setting up NodeBB hooks for anonymous posts ===');
        
        // Hook into posts being added to DOM
        hooks.on('action:posts.loading', function(data) {
            if (data && data.posts) {
                data.posts.forEach(function(post) {
                    if (isPostAnonymous(post)) {
                        console.log('Post loading hook: applying anonymous masking to:', post.pid);
                        applyAnonymousMasking(post);
                    }
                });
            }
        });
        
        // Hook into posts loaded event 
        hooks.on('action:posts.loaded', function(data) {
            if (data && data.posts) {
                data.posts.forEach(function(post) {
                    if (isPostAnonymous(post)) {
                        console.log('Post loaded hook: ensuring anonymous masking for:', post.pid);
                        applyAnonymousMasking(post);
                        // Also update DOM elements if they exist
                        updateAnonymousPostInDOM(post.pid);
                    }
                });
            }
        });
        
        // Hook into topic loaded event
        hooks.on('action:topic.loaded', function(data) {
            console.log('Topic loaded, checking for anonymous posts');
            setTimeout(function() {
                markAnonymousPostsInDOM();
            }, 100);
        });
        
        // Hook into the actual new post event from socket
        hooks.on('action:posts.new', function(data) {
            console.log('=== New post action hook ===', data);
            if (data && data.posts) {
                data.posts.forEach(function(post) {
                    if (isPostAnonymous(post) || window.lastPostAnonymous) {
                        console.log('New post action: applying anonymous masking to:', post.pid);
                        post.anonymous = 1;
                        applyAnonymousMasking(post);
                        setTimeout(function() {
                            updateAnonymousPostInDOM(post.pid);
                        }, 50);
                    }
                });
            }
        });
    });
}

// Also try to hook into the template parsing
if (typeof app !== 'undefined' && app.parseAndTranslate) {
    const originalParseAndTranslate = app.parseAndTranslate;
    app.parseAndTranslate = function(template, block, data, callback) {
        // Check if this is rendering posts and apply anonymous masking
        if ((template === 'topic' && block === 'posts') || template.includes('post')) {
            if (data && data.posts) {
                data.posts.forEach(function(post) {
                    if (isPostAnonymous(post) || window.lastPostAnonymous) {
                        console.log('Parse template: applying anonymous masking to:', post.pid);
                        post.anonymous = 1;
                        applyAnonymousMasking(post);
                    }
                });
            }
        }
        return originalParseAndTranslate.call(this, template, block, data, callback);
    };
}

// Export functions for use in other parts of the plugin
if (typeof window !== 'undefined') {
    window.AnonymousPlugin = {
        markAnonymousPosts: markAnonymousPosts,
        setupAnonymousUI: setupAnonymousUI
    };
}