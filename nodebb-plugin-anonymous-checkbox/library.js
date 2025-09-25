'use strict';

const posts = require.main.require('./src/posts');
const db = require.main.require('./src/database');
const winston = require.main.require('winston');

const FIELD = 'anonymous';
const DISPLAY = {
  username: 'Anonymous',
  userslug: 'anonymous',
  displayname: 'Anonymous'
};

exports.init = async () => {
  winston.info('[anon] plugin loaded');
};

function maskUser(user, post) {
  if (user) {
    // Preserve original data for permissions
    user._originalUid = user.uid;
    user._originalUsername = user.username;
    
    // Apply anonymous display
    user.username = DISPLAY.username;
    user.userslug = DISPLAY.userslug;
    user.displayname = DISPLAY.displayname;
    
    // Remove avatar and other identifying info
    user.picture = '';
    user['icon:text'] = 'A';
    user['icon:bgColor'] = '#aaa';
  }
  
  if (post) {
    post.username = DISPLAY.username;
    post.userslug = DISPLAY.userslug;
  }
}

// Persist flag immediately after create
exports.afterPostCreate = async function({ post, data }) {
  try {
    winston.info(`[anon] afterPostCreate called`);
    winston.info(`[anon] - post: ${JSON.stringify(post, null, 2)}`);
    winston.info(`[anon] - data: ${JSON.stringify(data, null, 2)}`);
    
    const pid = post && post.pid;
    
    // Check multiple places for the anonymous flag
    let isAnon = false;
    let flagLocation = 'not found';
    
    // Check data.anonymous (original location)
    if (data && data.anonymous) {
      isAnon = Number(data.anonymous) === 1;
      flagLocation = 'data.anonymous';
      winston.info(`[anon] Found anonymous flag in data.anonymous: ${data.anonymous}`);
    }
    
    // Check postData.anonymous (from frontend payload.postData)
    if (!isAnon && data && data.postData && data.postData.anonymous) {
      isAnon = Number(data.postData.anonymous) === 1;
      flagLocation = 'data.postData.anonymous';
      winston.info(`[anon] Found anonymous flag in data.postData.anonymous: ${data.postData.anonymous}`);
    }
    
    // Check composerData.anonymous (from frontend payload.composerData)
    if (!isAnon && data && data.composerData && data.composerData.anonymous) {
      isAnon = Number(data.composerData.anonymous) === 1;
      flagLocation = 'data.composerData.anonymous';
      winston.info(`[anon] Found anonymous flag in data.composerData.anonymous: ${data.composerData.anonymous}`);
    }
    
    winston.info(`[anon] - pid: ${pid}`);
    winston.info(`[anon] - isAnon: ${isAnon} (found in: ${flagLocation})`);
    
    if (pid && isAnon) {
      await posts.setPostField(pid, FIELD, 1);
      winston.info(`[anon] Successfully set anonymous flag for post ${pid}`);
    } else if (pid) {
      winston.info(`[anon] Post ${pid} is NOT anonymous`);
    }
  } catch (e) {
    winston.error('[anon] afterPostCreate error', e);
  }
};

// Single post fetch
exports.maskPost = async function(hookData) {
  try {
    const post = hookData.post;
    if (!post || !post.pid) {
      return hookData;
    }
    
    const anonFlag = await posts.getPostField(post.pid, FIELD);
    const isAnon = Number(anonFlag) === 1;
    winston.info(`[anon] maskPost pid=${post.pid} rawFlag='${anonFlag}' isAnon=${isAnon}`);
    
    if (isAnon) {
      winston.info(`[anon] MASKING post ${post.pid} - before: ${post.user?.username}`);
      maskUser(post.user, post);
      winston.info(`[anon] MASKING post ${post.pid} - after: ${post.user?.username}`);
    }
    
    return hookData;
  } catch (e) {
    winston.error('[anon] maskPost error', e);
    return hookData;
  }
};

// Multi-post fetch (topic stream)
exports.maskPosts = async function(hookData) {
  try {
    const posts = hookData.posts || [];
    if (!posts.length) {
      return hookData;
    }
    
    // Get anonymous flags for all posts
    const pids = posts.map(p => p && p.pid).filter(Boolean);
    const keys = pids.map(pid => `post:${pid}`);
    
    if (!keys.length) {
      return hookData;
    }
    
    const flags = await db.getObjectsFields(keys, [FIELD]);
    winston.info(`[anon] maskPosts checking ${pids.length} posts`);
    
    // Create PID to flag mapping
    const flagMap = {};
    pids.forEach((pid, index) => {
      const rawFlag = flags[index]?.[FIELD];
      const isAnon = Number(rawFlag) === 1;
      flagMap[pid] = isAnon;
      if (isAnon) {
        winston.info(`[anon] Post ${pid}: will be masked (rawFlag='${rawFlag}')`);
      }
    });
    
    // Apply masking
    posts.forEach(post => {
      if (post && post.pid && flagMap[post.pid]) {
        winston.info(`[anon] MASKING multi-post ${post.pid} - before: ${post.user?.username}`);
        maskUser(post.user, post);
        winston.info(`[anon] MASKING multi-post ${post.pid} - after: ${post.user?.username}`);
      }
    });
    
    return hookData;
  } catch (e) {
    winston.error('[anon] maskPosts error', e);
    return hookData;
  }
};

// Intercept the post data before it's processed by NodeBB
exports.filterPostData = async function(hookData) {
  try {
    winston.info(`[anon] filterPostData called`);
    winston.info(`[anon] - hookData keys: ${hookData ? Object.keys(hookData).join(', ') : 'no hookData'}`);
    winston.info(`[anon] - full hookData: ${JSON.stringify(hookData, null, 2)}`);
    
    const data = hookData.data;
    winston.info(`[anon] - data keys: ${data ? Object.keys(data).join(', ') : 'no data'}`);
    
    // Check for anonymous flag in the data
    const isAnon = Number(data && data.anonymous) === 1;
    winston.info(`[anon] - anonymous flag: ${data && data.anonymous} (isAnon: ${isAnon})`);
    
    if (isAnon && data.pid) {
      // Store the flag immediately 
      await posts.setPostField(data.pid, FIELD, 1);
      winston.info(`[anon] Set anonymous flag for post ${data.pid} via filter`);
      
      // Remove the anonymous field from data to prevent API errors
      delete data.anonymous;
      winston.info(`[anon] Removed anonymous field from data`);
    }
    
    return hookData;
  } catch (e) {
    winston.error('[anon] filterPostData error', e);
    return hookData;
  }
};
exports.debugPost = async function(pid) {
  try {
    const anonFlag = await posts.getPostField(pid, FIELD);
    const postData = await posts.getPostData(pid);
    winston.info(`[anon] DEBUG Post ${pid}:`);
    winston.info(`[anon] - anonymous flag: '${anonFlag}' (type: ${typeof anonFlag})`);
    winston.info(`[anon] - post data:`, JSON.stringify(postData, null, 2));
    return { anonFlag, postData };
  } catch (e) {
    winston.error(`[anon] debugPost error:`, e);
  }
};