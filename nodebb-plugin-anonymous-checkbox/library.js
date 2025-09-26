'use strict';

const db = require.main.require('./src/database');

const plugin = {};
const FIELD = 'anonymous';
const LOG   = '=== ANON ===';

// ---------------------------
// 1) Capture flag on create
// ---------------------------
plugin.filterPostCreate = async function (hookData) {
  const raw =
    hookData?.data?.[FIELD] ??
    hookData?.data?.req?.body?.[FIELD];

  const isAnon = ['1', 1, true, 'true', 'on', 'yes'].includes(raw);
  console.log(`${LOG} FILTER POST CREATE :: raw=${raw} isAnon=${isAnon} tid=${hookData?.data?.tid}`);

  if (isAnon) {
    hookData.post = hookData.post || {};
    hookData.post[FIELD] = 1;
  }
  return hookData;
};

plugin.actionPostSave = async function ({ post }) {
  if (!post?.pid) return;
  const val = post[FIELD] ? 1 : 0;
  if (val) {
    await db.setObjectField(`post:${post.pid}`, FIELD, 1);
  }
  console.log(`${LOG} ACTION POST SAVE :: pid=${post.pid} saved ${FIELD}=${val}`);
};

// ---------------------------------------------------
// 2) Always fetch our field (must return { fields })
// ---------------------------------------------------
plugin.addAnonField = async function (data) {
  if (Array.isArray(data)) {
    if (!data.includes(FIELD)) data.push(FIELD);
    console.log(`${LOG} FILTER POST GET FIELDS (array) ::`, data);
    return { fields: data };
  }
  data = data || {};
  data.fields = Array.isArray(data.fields) ? data.fields : [];
  if (!data.fields.includes(FIELD)) data.fields.push(FIELD);
  console.log(`${LOG} FILTER POST GET FIELDS (obj) ::`, data.fields);
  return data;
};

// ---------------------------------------------
// 3) Display masking: single-post fetch
// ---------------------------------------------
plugin.filterPostGet = async function (data) {
  const p = data?.post;
  if (p && isAnon(p)) {
    maskDisplay(p);
    console.log(`${LOG} FILTER POST GET :: masked pid=${p.pid}`);
  }
  return data;
};

// ----------------------------------------------------
// 4) Display masking: lists (both list hooks registered)
//    - filter:topic.getPosts (topic page path)
//    - filter:post.getPosts  (generic posts list path)
// ----------------------------------------------------
plugin.maskPostsList_topic = async function (data) {
  return maskPostsList(data, 'FILTER TOPIC GET POSTS');
};
plugin.maskPostsList_post = async function (data) {
  return maskPostsList(data, 'FILTER POST GET POSTS');
};

async function maskPostsList(data, label) {
  if (!data || !Array.isArray(data.posts) || !data.posts.length) return data;
  let masked = 0;
  for (const p of data.posts) {
    if (isAnon(p)) {
      maskDisplay(p);
      masked++;
    }
  }
  if (masked) console.log(`${LOG} ${label} :: masked ${masked}/${data.posts.length}`);
  return data;
}

// --------------------------------------------------------------------
// 5) FINAL pass after Topics.addPostData rebuilt p.user
//     This hook receives the POSTS ARRAY directly and must return it.
// --------------------------------------------------------------------
plugin.maskAfterAddPostData = async function (postData) {
  if (!Array.isArray(postData) || !postData.length) return postData;
  let masked = 0;
  for (const p of postData) {
    if (p && isAnon(p)) {
      maskDisplay(p); // Harmony reads post.user.displayname & userslug
      masked++;
    }
  }
  if (masked) console.log(`${LOG} TOPICS ADDPOSTDATA :: masked ${masked}/${postData.length}`);
  return postData;
};

// ----------------------------------------------------------
// 6) Optional: add checkbox html into composer template data
// ----------------------------------------------------------
plugin.filterComposerBuild = async function (hookData) {
  const { templateData } = hookData || {};
  if (templateData && !templateData.anonymousCheckbox) {
    templateData.anonymousCheckbox = `
      <div class="form-group">
        <div class="form-check">
          <input type="checkbox" class="form-check-input js-anonymous-checkbox" id="anonymous-post">
          <label class="form-check-label" for="anonymous-post">
            <i class="fa fa-user-secret"></i> Post anonymously
          </label>
        </div>
      </div>
    `;
  }
  return hookData;
};

// -----------------
// Helpers
// -----------------
function isAnon(p) {
  return p?.[FIELD] === 1 || p?.[FIELD] === '1' || p?.[FIELD] === true;
}

// Only change DISPLAY fields; keep ownership intact.
function maskDisplay(p) {
  // Harmony renders from post.user.*
  if (p.user) {
    p.user.displayname = 'Anonymous';   // text shown in tpl
    p.user.username    = 'Anonymous';
    p.user.fullname    = 'Anonymous';
    p.user.userslug    = undefined;     // href becomes '#'
  }
  // Top-level fallbacks (for other templates/API)
  if ('username' in p) p.username = 'Anonymous';
  if ('userslug'  in p) p.userslug = undefined;

  p.isAnonymousDisplay = true;
}

module.exports = plugin;
