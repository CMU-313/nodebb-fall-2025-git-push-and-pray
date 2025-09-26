// // library.js - Main plugin file
// 'use strict';

// const plugin = {};

// // Temporary storage for anonymous post tracking
// plugin._anonymousPosts = {};

// // NodeBB modules
// const Topics = require.main.require('./src/topics');
// const Posts = require.main.require('./src/posts');
// const User = require.main.require('./src/user');
// const db = require.main.require('./src/database');

// // ===== HOOK: Filter post creation =====
// plugin.filterPostCreate = async function(hookData) {
//     const { data } = hookData;
    
//     console.log('=== FILTER POST CREATE ===');
//     console.log('Post data:', JSON.stringify(data, null, 2));
    
//     // Check if post should be anonymous
//     if (data.anonymous === '1' || data.anonymous === 1 || data.anonymous === true) {
//         console.log('=== CREATING ANONYMOUS POST ===');
        
//         // Store the original user ID for moderation purposes
//         data.originalUid = data.uid;
//         data.anonymous = 1;
        
//         // Store in temporary storage using a unique key
//         // Since we don't have the PID yet, we'll use the UUID
//         const postKey = data.uuid || `temp_${Date.now()}_${Math.random()}`;
//         plugin._anonymousPosts[postKey] = {
//             originalUid: data.uid,
//             anonymous: true,
//             timestamp: Date.now()
//         };
        
//         // Store the key in the data so we can find it later
//         data._anonymousKey = postKey;
        
//         console.log('Anonymous post processed:', {
//             originalUid: data.originalUid,
//             anonymous: data.anonymous,
//             anonymousKey: postKey
//         });
//     }
    
//     return hookData;
// };

// // ===== HOOK: After post is saved =====
// plugin.actionPostSave = async function(hookData) {
//     const { post } = hookData;
    
//     console.log('=== ACTION POST SAVE ===');
//     console.log('Saved post:', JSON.stringify(post, null, 2));
    
//     const postPid = post.pid;
    
//     // Method 1: Check if we have the anonymous key in the post data
//     if (post._anonymousKey && plugin._anonymousPosts[post._anonymousKey]) {
//         console.log('=== FOUND ANONYMOUS POST VIA KEY ===');
        
//         try {
//             await db.setObjectField(`post:${postPid}`, 'anonymous', 1);
//             await db.setObjectField(`post:${postPid}`, 'originalUid', plugin._anonymousPosts[post._anonymousKey].originalUid);
            
//             console.log(`Anonymous flag saved for post ${postPid}`);
            
//             // Clean up temporary storage
//             delete plugin._anonymousPosts[post._anonymousKey];
            
//         } catch (error) {
//             console.error('Error saving anonymous flag:', error);
//         }
        
//         return hookData;
//     }
    
//     // Method 2: Search through temporary storage for recent anonymous posts
//     const currentTime = Date.now();
//     for (const [key, value] of Object.entries(plugin._anonymousPosts)) {
//         // If this anonymous post was created in the last 10 seconds, assume it's this one
//         if (currentTime - value.timestamp < 10000) {
//             console.log('=== FOUND RECENT ANONYMOUS POST ===');
            
//             try {
//                 await db.setObjectField(`post:${postPid}`, 'anonymous', 1);
//                 await db.setObjectField(`post:${postPid}`, 'originalUid', value.originalUid);
                
//                 console.log(`Anonymous flag saved for post ${postPid} (via timestamp)`);
                
//                 // Clean up temporary storage
//                 delete plugin._anonymousPosts[key];
                
//                 break;
//             } catch (error) {
//                 console.error('Error saving anonymous flag:', error);
//             }
//         }
//     }
    
//     // Method 3: Direct check (fallback)
//     if (post.anonymous === 1 || post.anonymous === '1' || post.anonymous === true) {
//         console.log('=== SAVING ANONYMOUS FLAG TO DATABASE (DIRECT) ===');
        
//         try {
//             await db.setObjectField(`post:${postPid}`, 'anonymous', 1);
//             if (post.originalUid) {
//                 await db.setObjectField(`post:${postPid}`, 'originalUid', post.originalUid);
//             }
            
//             console.log(`Anonymous flag saved for post ${postPid} (direct)`);
//         } catch (error) {
//             console.error('Error saving anonymous flag:', error);
//         }
//     }
    
//     return hookData;
// };

// // ===== HOOK: Filter post data before saving =====
// plugin.filterPostData = async function(hookData) {
//     const { postData } = hookData;
    
//     console.log('=== FILTER POST DATA ===');
//     console.log('Post data before save:', JSON.stringify(postData, null, 2));
    
//     // Ensure anonymous flag persists to database
//     if (postData.anonymous === '1' || postData.anonymous === 1 || postData.anonymous === true) {
//         console.log('=== PRESERVING ANONYMOUS FLAG IN POST DATA ===');
//         postData.anonymous = 1;
        
//         if (!postData.originalUid && postData.uid) {
//             postData.originalUid = postData.uid;
//         }
//     }
    
//     return hookData;
// };
// plugin.filterTopicCreate = async function(hookData) {
//     const { topic } = hookData;
    
//     console.log('=== FILTER TOPIC CREATE ===');
//     console.log('Topic data:', JSON.stringify(topic, null, 2));
    
//     if (topic.anonymous === '1' || topic.anonymous === 1 || topic.anonymous === true) {
//         console.log('=== CREATING ANONYMOUS TOPIC ===');
        
//         topic.originalUid = topic.uid;
//         topic.anonymous = true;
        
//         console.log('Anonymous topic processed:', {
//             originalUid: topic.originalUid,
//             anonymous: topic.anonymous
//         });
//     }
    
//     return hookData;
// };

// // ===== HOOK: Filter WebSocket post data =====
// plugin.filterPostsGetPostsData = async function(hookData) {
//     const { posts } = hookData;
    
//     console.log('=== FILTER POSTS GET POSTS DATA (WebSocket) ===');
//     console.log('Processing WebSocket posts:', posts?.length || 0);
    
//     if (Array.isArray(posts)) {
//         for (const post of posts) {
//             await plugin.makePostAnonymousIfNeeded(post);
//         }
//     }
    
//     return hookData;
// };

// // ===== HOOK: Filter socket events =====
// plugin.filterSocketPostsGetPostsData = async function(hookData) {
//     console.log('=== FILTER SOCKET POSTS GET POSTS DATA ===');
    
//     if (hookData.posts && Array.isArray(hookData.posts)) {
//         for (const post of hookData.posts) {
//             await plugin.makePostAnonymousIfNeeded(post);
//         }
//     }
    
//     return hookData;
// };
// plugin.filterPostGetPostData = async function(hookData) {
//     const { posts } = hookData;
    
//     console.log('=== FILTER POST GET POST DATA (WebSocket) ===');
    
//     if (Array.isArray(posts)) {
//         for (const post of posts) {
//             await plugin.makePostAnonymousIfNeeded(post);
//         }
//     } else if (posts && posts.pid) {
//         await plugin.makePostAnonymousIfNeeded(posts);
//     }
    
//     return hookData;
// };

// // Helper function to make a post anonymous
// plugin.makePostAnonymousIfNeeded = async function(post) {
//     if (!post || !post.pid) return;
    
//     try {
//         const isAnonymous = await db.getObjectField(`post:${post.pid}`, 'anonymous');
        
//         if (isAnonymous === '1' || isAnonymous === 1) {
//             console.log(`=== Making post ${post.pid} anonymous for display ===`);
            
//             // Store original data
//             post.originalUid = post.uid;
//             post.anonymous = true;
            
//             // Override user display information
//             post.user = post.user || {};
//             post.user.username = 'Anonymous';
//             post.user.displayname = 'Anonymous';
//             post.user.userslug = 'anonymous';
//             post.user.fullname = 'Anonymous';
            
//             // Set anonymous avatar
//             post.user.picture = null;
//             post.user['icon:text'] = 'A';
//             post.user['icon:bgColor'] = '#666666';
            
//             // Remove identifiable information
//             delete post.user.signature;
//             delete post.user.aboutme;
//             delete post.user.status;
//             delete post.user.lastonline;
//         }
//     } catch (error) {
//         console.error(`Error making post ${post.pid} anonymous:`, error);
//     }
// };
// plugin.filterPostsGet = async function(posts) {
//     console.log('=== FILTER POSTS GET ===');
//     console.log('Processing', posts.length, 'posts');
    
//     // Process each post to check if it should be anonymous
//     for (let i = 0; i < posts.length; i++) {
//         const post = posts[i];
        
//         // Check if this post is marked as anonymous in the database
//         try {
//             const isAnonymous = await db.getObjectField(`post:${post.pid}`, 'anonymous');
            
//             if (isAnonymous === '1' || isAnonymous === 1 || isAnonymous === true) {
//                 console.log(`=== POST ${post.pid}: Making anonymous ===`);
                
//                 // Store original user data for moderation
//                 post.originalUid = post.uid;
//                 post.anonymous = true;
                
//                 // Override user display information
//                 post.user = post.user || {};
//                 post.user.username = 'Anonymous';
//                 post.user.displayname = 'Anonymous';
//                 post.user.userslug = 'anonymous';
//                 post.user.fullname = 'Anonymous';
                
//                 // Set anonymous avatar
//                 post.user.picture = null;
//                 post.user['icon:text'] = 'A';
//                 post.user['icon:bgColor'] = '#666666';
                
//                 // Remove identifiable information
//                 delete post.user.signature;
//                 delete post.user.aboutme;
                
//                 console.log('Post made anonymous:', post.pid);
//             }
//         } catch (error) {
//             console.error(`Error checking anonymous status for post ${post.pid}:`, error);
//         }
//     }
    
//     return posts;
// };

// // ===== HOOK: Modify topics for display =====
// plugin.filterTopicsGet = async function(hookData) {
//     const { topics } = hookData;
    
//     console.log('=== FILTER TOPICS GET ===');
//     console.log('Processing', topics.length, 'topics');
    
//     topics.forEach((topic, index) => {
//         if (topic.anonymous) {
//             console.log(`=== TOPIC ${index}: Making anonymous ===`);
            
//             // Override user display information
//             topic.user = topic.user || {};
//             topic.user.username = 'Anonymous';
//             topic.user.displayname = 'Anonymous';
//             topic.user.userslug = 'anonymous';
//             topic.user.fullname = 'Anonymous';
            
//             // Set anonymous avatar
//             topic.user.picture = null;
//             topic.user['icon:text'] = 'A';
//             topic.user['icon:bgColor'] = '#666666';
            
//             console.log('Topic made anonymous:', topic.tid);
//         }
//     });
    
//     return hookData;
// };

// // ===== HOOK: Add checkbox to composer =====
// plugin.filterComposerBuild = async function(hookData) {
//     const { templateData } = hookData;
    
//     console.log('=== FILTER COMPOSER BUILD ===');
    
//     // Add anonymous checkbox HTML to composer
//     if (!templateData.anonymousCheckbox) {
//         templateData.anonymousCheckbox = `
//             <div class="form-group">
//                 <div class="form-check">
//                     <input type="checkbox" class="form-check-input js-anonymous-checkbox" id="anonymous-post">
//                     <label class="form-check-label" for="anonymous-post">
//                         Post anonymously
//                     </label>
//                 </div>
//             </div>
//         `;
//     }
    
//     return hookData;
// };

// // ===== API: Handle form submissions =====
// plugin.apiMiddleware = function(req, res, next) {
//     console.log('=== API MIDDLEWARE ===');
//     console.log('Method:', req.method);
//     console.log('URL:', req.url);
//     console.log('Body:', JSON.stringify(req.body, null, 2));
    
//     // Check for anonymous flag in POST requests to topics/posts
//     if (req.method === 'POST' && (req.url.includes('/compose') || req.url.includes('/topics') || req.url.includes('/posts'))) {
//         if (req.body.anonymous === '1' || req.body.anonymous === 1) {
//             console.log('=== ANONYMOUS FLAG DETECTED ===');
//             req.body.anonymous = true;
//         }
//     }
    
//     next();
// };

// // ===== INITIALIZATION =====
// plugin.init = async function(params, callback) {
//     console.log('=== ANONYMOUS PLUGIN INITIALIZING ===');
    
//     const { router, middleware } = params;
    
//     // Add API middleware for handling form submissions
//     router.use('/api', plugin.apiMiddleware);
    
//     // Add custom API route to check if post is anonymous
//     router.get('/api/post/:pid/anonymous', async (req, res) => {
//         try {
//             const pid = req.params.pid;
//             const isAnonymous = await db.getObjectField(`post:${pid}`, 'anonymous');
            
//             res.json({ 
//                 anonymous: isAnonymous === '1' || isAnonymous === 1,
//                 pid: pid
//             });
//         } catch (error) {
//             console.error('Error checking anonymous status:', error);
//             res.status(500).json({ error: 'Failed to check anonymous status' });
//         }
//     });
    
//     // Setup database if needed
//     await plugin.setupDatabase();
    
//     console.log('=== ANONYMOUS PLUGIN INITIALIZED ===');
//     callback();
// };

// // ===== DATABASE SETUP =====
// plugin.setupDatabase = async function() {
//     console.log('=== SETTING UP DATABASE ===');
    
//     try {
//         // For different database types, we might need different approaches
//         // NodeBB handles schema-less data well, so we mainly need to ensure
//         // our fields are properly stored and retrieved
        
//         console.log('Database setup completed');
//     } catch (error) {
//         console.error('Database setup error:', error);
//     }
// };

// // ===== UTILITY: Check if post should be anonymous =====
// plugin.shouldBeAnonymous = function(data) {
//     return data.anonymous === '1' || data.anonymous === 1 || data.anonymous === true;
// };

// // ===== DEBUGGING =====
// plugin.debug = function(message, data) {
//     console.log(`=== ANONYMOUS PLUGIN DEBUG: ${message} ===`);
//     if (data) {
//         console.log(JSON.stringify(data, null, 2));
//     }
// };

// module.exports = plugin;

// library.js
'use strict';

const db = require.main.require('./src/database');

const FIELD = 'anonymous';
const LOG   = '=== ANON ===';

const plugin = {};

/**
 * Creation: read the checkbox flag and stash it on the post being created.
 */
plugin.filterPostCreate = async function (hookData) {
  const raw =
    hookData?.data?.[FIELD] ??
    hookData?.data?.req?.body?.[FIELD];

  const isAnon = ['1', 1, true, 'true', 'on', 'yes'].includes(raw);

  console.log(`${LOG} FILTER POST CREATE :: raw=${raw} isAnon=${isAnon} tid=${hookData?.data?.tid}`);

  if (isAnon) {
    hookData.post = hookData.post || {};
    hookData.post[FIELD] = 1;  // will be persisted after save
  }
  return hookData;
};

/**
 * After save: persist the flag on post:<pid> so future reads include it.
 */
plugin.actionPostSave = async function ({ post }) {
  if (!post?.pid) return;
  const val = post[FIELD] ? 1 : 0;
  if (val) {
    await db.setObjectField(`post:${post.pid}`, FIELD, 1);
  }
  console.log(`${LOG} ACTION POST SAVE :: pid=${post.pid} saved ${FIELD}=${val}`);
};

/**
 * Make NodeBB always fetch our custom field with posts (no custom routes, no extra DB gets).
 * NOTE: In NodeBB v3, this hook receives an Array<string> of fields.
 */
// Always return an object with .fields for v3+
plugin.addAnonField = async function (data) {
    const FIELD = 'anonymous';
  
    // Some chains may pass an array; normalize to object
    if (Array.isArray(data)) {
      if (!data.includes(FIELD)) data.push(FIELD);
      console.log('=== ANON === FILTER POST GET FIELDS (array) ::', data);
      return { fields: data };              // <-- normalize to { fields: [...] }
    }
  
    // Normal path: data is { fields: [...] }
    data = data || {};
    data.fields = Array.isArray(data.fields) ? data.fields : [];
    if (!data.fields.includes(FIELD)) data.fields.push(FIELD);
    console.log('=== ANON === FILTER POST GET FIELDS (obj) ::', data.fields);
    return data;                            // <-- must be { fields: [...] }
};
  

/**
 * Mask an array of posts (topic lists, infinite scroll, etc.).
 * Only change display name fields. Leave avatar and everything else intact.
 */
plugin.filterPostsGet = async function (posts) {
  if (!Array.isArray(posts) || !posts.length) return posts;

  let masked = 0;
  for (const p of posts) {
    if (isFlagged(p)) {
      maskDisplay(p);
      masked++;
    }
  }
  if (masked) {
    console.log(`${LOG} FILTER POSTS GET :: masked ${masked}/${posts.length}`);
  }
  return posts;
};

/**
 * Socket path that returns multiple posts under `hookData.posts`.
 * (Covers WebSocket-driven fetches used by the composer/infinite scroll)
 */
plugin.filterPostGetPostData = async function (hookData) {
  const { posts } = hookData || {};
  if (Array.isArray(posts)) {
    let masked = 0;
    for (const p of posts) {
      if (isFlagged(p)) {
        maskDisplay(p);
        masked++;
      }
    }
    if (masked) {
      console.log(`${LOG} FILTER POST GET POST DATA :: masked ${masked}/${posts.length}`);
    }
  } else if (posts && posts.pid && isFlagged(posts)) {
    maskDisplay(posts);
    console.log(`${LOG} FILTER POST GET POST DATA :: masked pid=${posts.pid}`);
  }
  return hookData;
};

/**
 * Single post (REST) fetches.
 */
plugin.filterPostGet = async function (data) {
  const p = data?.post;
  if (p && isFlagged(p)) {
    maskDisplay(p);
    console.log(`${LOG} FILTER POST GET :: masked pid=${p.pid}`);
  }
  return data;
};

/**
 * Topics list logging unchanged (optional).
 */
plugin.filterTopicsGet = async function (hookData) {
  const { topics } = hookData || {};
  console.log('=== FILTER TOPICS GET ===');
  console.log('Processing', Array.isArray(topics) ? topics.length : 0, 'topics');
  return hookData;
};

/**
 * Composer checkbox injection (as you already had).
 */
plugin.filterComposerBuild = async function (hookData) {
  const { templateData } = hookData;
  if (!templateData.anonymousCheckbox) {
    templateData.anonymousCheckbox = `
      <div class="form-group">
        <div class="form-check">
          <input type="checkbox" class="form-check-input js-anonymous-checkbox" id="anonymous-post">
          <label class="form-check-label" for="anonymous-post">Post anonymously</label>
        </div>
      </div>
    `;
  }
  console.log('=== FILTER COMPOSER BUILD ===');
  return hookData;
};

/** Helpers */

function isFlagged(p) {
  // We rely on filter:post.getFields to have added p.anonymous to fetched fields
  return p?.[FIELD] === 1 || p?.[FIELD] === '1' || p?.[FIELD] === true;
}

function maskDisplay(p) {
  // top-level (used by some themes/templates)
  if ('username' in p) p.username = 'Anonymous';
  if ('userslug'  in p) p.userslug = undefined; // removes profile link

  // canonical nested user object
  if (p.user) {
    p.user.username    = 'Anonymous';
    p.user.displayname = 'Anonymous';
    p.user.fullname    = 'Anonymous';
    p.user.userslug    = undefined;            // removes profile link
  }

  p.isAnonymousDisplay = true; // handy for template debugging
}

module.exports = plugin;
