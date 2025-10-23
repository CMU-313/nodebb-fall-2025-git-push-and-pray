/* global $, require, console */
'use strict';

console.log('=== ANONYMOUS PLUGIN JS FILE LOADED ===');

// Checkbox discovery for dynamically-loaded composer
$(document).ready(function() {
  console.log('=== ANONYMOUS PLUGIN JQUERY READY ===');

  function initCheckbox() {
	// Check for theme checkbox first
	const $themeCheckbox = $('[component="composer/anonymous"]');
	if ($themeCheckbox.length > 0 && !$themeCheckbox.data('anon-initialized')) {
	  console.log('=== INITIALIZING THEME CHECKBOX ===');
	  $themeCheckbox.data('anon-initialized', true);
	  const $composer = $themeCheckbox.closest('[component="composer"]');
	  initThemeCheckbox($composer);
	  return;
	}
	
	// Fall back to plugin checkbox
	const $checkbox = $('.js-anonymous-checkbox');
	if ($checkbox.length > 0 && !$checkbox.data('anon-initialized')) {
	  console.log('=== INITIALIZING PLUGIN CHECKBOX ===');
	  $checkbox.data('anon-initialized', true);

	  $checkbox.on('change', function() {
	    const $composer = $(this).closest('[component="composer"]');
	    if (this.checked) {
	      $composer.addClass('anonymous-mode');
	      showAnonymousPreview($composer);
	    } else {
	      $composer.removeClass('anonymous-mode');
	      hideAnonymousPreview($composer);
	    }
	    console.log('=== CHECKBOX CHANGED ===', this.checked);
	  });
	}
  }

  const checkboxInterval = setInterval(initCheckbox, 1000);
  setTimeout(() => clearInterval(checkboxInterval), 30000);
  initCheckbox();
});

if (typeof require === 'function') {
  console.log('=== SETTING UP NODEBB HOOKS ===');
  require(['hooks'], function (hooks) {
	console.log('=== HOOKS MODULE LOADED ===');

	// Composer loaded: ensure checkbox exists & is wired
	hooks.on('action:composer.loaded', function (data) {
	  console.log('=== COMPOSER LOADED HOOK ===', data);
	  const uuid = data.post_uuid;
	  const $composer = $(`[component="composer"][data-uuid="${uuid}"]`);
	  // Use theme's checkbox if available, otherwise add our own
	  if ($composer.find('[component="composer/anonymous"]').length > 0) {
	    initThemeCheckbox($composer);
	  } else {
	    addAnonymousCheckbox($composer);
	    initComposerCheckbox($composer);
	  }
	});

	// Listen for composer enhancement (used by the compose.js module)
	hooks.on('action:composer.enhance', function (data) {
	  console.log('=== COMPOSER ENHANCE HOOK ===', data);
	  const $composer = data.container;
	  if ($composer.find('[component="composer/anonymous"]').length > 0) {
	    initThemeCheckbox($composer);
	  } else {
	    addAnonymousCheckbox($composer);
	    initComposerCheckbox($composer);
	  }
	});

	// Ensure the flag is sent (primary path)
	hooks.on('action:composer.submit', function (data) {
	  const $active = $('.composer:not(.hidden)');
	  const themeCheckbox = $active.find('[component="composer/anonymous"]');
	  const pluginCheckbox = $active.find('.js-anonymous-checkbox');
	  const isChecked = themeCheckbox.length > 0 ? themeCheckbox.is(':checked') : pluginCheckbox.is(':checked');
	  
	  console.log('=== COMPOSER SUBMIT HOOK === checked=', isChecked);
	  
	  // Store the anonymous state for immediate application
	  storeAnonymousState();
	  
	  if (isChecked && data.composerData) {
	    data.composerData.anonymous = '1';
	    if (data.postData) data.postData.anonymous = '1';
	  }
	});

	// Backup path - ensure anonymous flag is included in submission data
	hooks.on('filter:composer.submit', function (data) {
	  const $active = $('.composer:not(.hidden)');
	  const themeCheckbox = $active.find('[component="composer/anonymous"]');
	  const pluginCheckbox = $active.find('.js-anonymous-checkbox');
	  const isChecked = themeCheckbox.length > 0 ? themeCheckbox.is(':checked') : pluginCheckbox.is(':checked');
	  
	  if (isChecked) {
	    if (data.postData) data.postData.anonymous = '1';
	    if (data.topicData) data.topicData.anonymous = '1';
	    if (data.composerData) data.composerData.anonymous = '1';
	    // Also set it directly on data for compatibility
	    data.anonymous = '1';
	  }
	  return data;
	});

	// Hook into new post events to mask display immediately
	hooks.on('action:topic.reply', function (data) {
	  // Check if the reply was anonymous and apply masking
	  if (data && data.post && isPostMarkedAnonymous(data.post)) {
	    console.log('=== APPLYING IMMEDIATE ANONYMOUS MASKING TO REPLY ===');
	    applyClientSideAnonymousMasking(data.post);
	  }
	});

	hooks.on('action:topic.post', function (data) {
	  // Check if the new topic was anonymous and apply masking
	  if (data && data.post && isPostMarkedAnonymous(data.post)) {
	    console.log('=== APPLYING IMMEDIATE ANONYMOUS MASKING TO NEW TOPIC ===');
	    applyClientSideAnonymousMasking(data.post);
	  }
	});
	
	// Additional hook for when posts are actually displayed
	hooks.on('action:posts.loaded', function (data) {
	  if (data && data.posts) {
	    data.posts.forEach(function(post) {
	      if (isPostMarkedAnonymous(post)) {
	        console.log('=== POSTS LOADED: APPLYING ANONYMOUS MASKING ===', post.pid);
	        applyClientSideAnonymousMasking(post);
	      }
	    });
	  }
	});
	
	// Hook for when composer is submitted successfully 
	hooks.on('action:composer.submitted', function (data) {
	  if (window.lastPostAnonymous && data.post) {
	    console.log('=== COMPOSER SUBMITTED: POST WAS ANONYMOUS ===', data.post.pid);
	    data.post.anonymous = 1;
	    applyClientSideAnonymousMasking(data.post);
	    window.lastPostAnonymous = false; // Reset
	  }
	});

	// NOTE: removed any posts/topic loaded handlers that queried /api/post/:pid/anonymous
  });
} else {
  console.log('=== REQUIRE NOT AVAILABLE - USING FALLBACK ===');
}

// Add checkbox markup to the composer
function addAnonymousCheckbox($composer) {
  if ($composer.length === 0) return;
  if ($composer.find('.js-anonymous-checkbox').length > 0) return;

  const id = `anonymous-post-${Date.now()}`;
  const checkboxHtml = `
	<div class="form-group anonymous-checkbox-wrapper">
	  <div class="form-check">
	    <input type="checkbox" class="form-check-input js-anonymous-checkbox" id="${id}">
	    <label class="form-check-label" for="${id}">
	      <i class="fa fa-user-secret"></i> Post anonymously
	    </label>
	  </div>
	</div>
  `;

  const $submitArea = $composer.find('[component="composer/submit-wrapper"], .composer-submit, .btn-toolbar').last();
  if ($submitArea.length > 0) {
	$submitArea.before(checkboxHtml);
  } else {
	$composer.find('.composer-container, .composer').first().append(checkboxHtml);
  }
}

function initComposerCheckbox($composer) {
  const $checkbox = $composer.find('.js-anonymous-checkbox');
  if ($checkbox.length === 0) return;

  $checkbox.off('change.anonymous').on('change.anonymous', function () {
	const isChecked = this.checked;
	if (isChecked) {
	  $composer.addClass('anonymous-mode');
	  showAnonymousPreview($composer);
	} else {
	  $composer.removeClass('anonymous-mode');
	  hideAnonymousPreview($composer);
	}
	console.log('=== CHECKBOX STATE CHANGED ===', isChecked);
  });
}

// Initialize the theme's built-in anonymous checkbox
function initThemeCheckbox($composer) {
  const $checkbox = $composer.find('[component="composer/anonymous"]');
  if ($checkbox.length === 0) return;

  console.log('=== INITIALIZING THEME CHECKBOX ===');
  
  $checkbox.off('change.anonymous').on('change.anonymous', function () {
	const isChecked = this.checked;
	if (isChecked) {
	  $composer.addClass('anonymous-mode');
	  showAnonymousPreview($composer);
	} else {
	  $composer.removeClass('anonymous-mode');
	  hideAnonymousPreview($composer);
	}
	
	// Store the anonymous state on the composer container for compatibility
	$composer.attr('data-anonymous', isChecked);
	
	console.log('=== THEME CHECKBOX STATE CHANGED ===', isChecked);
  });
}

function showAnonymousPreview($composer) {
  if ($composer.find('.anonymous-preview').length) return;
  $composer.find('.write').prepend(`
	<div class="anonymous-preview alert alert-info">
	  <i class="fa fa-info-circle"></i>
	  This post will appear as "Anonymous"
	</div>
  `);
}
function hideAnonymousPreview($composer) {
  $composer.find('.anonymous-preview').remove();
}

// Fallback: ensure flag is in form submits too
$(document).on('submit', '[component="composer"] form', function () {
  const $form = $(this);
  const $composer = $form.closest('[component="composer"]');
  const themeCheckbox = $composer.find('[component="composer/anonymous"]');
  const pluginCheckbox = $composer.find('.js-anonymous-checkbox');
  const isChecked = themeCheckbox.length > 0 ? themeCheckbox.is(':checked') : pluginCheckbox.is(':checked');
  
  if (isChecked) {
	$form.find('input[name="anonymous"]').remove();
	$form.append('<input type="hidden" name="anonymous" value="1">');
	$form.attr('data-anonymous', '1');
	console.log('=== FORM SUBMIT: ADDED ANONYMOUS FLAG ===');
  }
});

// Helper functions for anonymous masking
function isPostMarkedAnonymous(post) {
  return post && (post.anonymous === 1 || post.anonymous === '1' || post.anonymous === true);
}

function applyClientSideAnonymousMasking(post) {
  if (!post) return;
  
  // Apply the same masking logic that the server uses
  if (post.user) {
	post.user.displayname = 'Anonymous';
	post.user.username = 'Anonymous';
	post.user.fullname = 'Anonymous';
	post.user.userslug = undefined;
	post.user.picture = undefined;
  }
  
  // Top-level fallbacks
  if ('username' in post) post.username = 'Anonymous';
  if ('userslug' in post) post.userslug = undefined;
  if ('picture' in post) post.picture = undefined;
  
  // Mark for UI purposes
  post.isAnonymousDisplay = true;
  
  console.log('Applied client-side anonymous masking to post:', post.pid);
}

// Store the anonymous checkbox state to check later
function storeAnonymousState() {
  const $activeComposer = $('.composer:not(.hidden)');
  const themeCheckbox = $activeComposer.find('[component="composer/anonymous"]');
  const pluginCheckbox = $activeComposer.find('.js-anonymous-checkbox');
  const isChecked = themeCheckbox.length > 0 ? themeCheckbox.is(':checked') : pluginCheckbox.is(':checked');
  
  // Store in session storage or global variable for quick access
  window.lastPostAnonymous = isChecked;
  console.log('Stored anonymous state:', isChecked);
}

// Check anonymous state before submitting
$(document).on('change', '.js-anonymous-checkbox, [component="composer/anonymous"]', function() {
  storeAnonymousState();
});
