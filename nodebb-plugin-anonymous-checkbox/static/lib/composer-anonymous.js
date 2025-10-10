/* global $, require, console */
'use strict';

console.log('=== ANONYMOUS PLUGIN JS FILE LOADED ===');

// Checkbox discovery for dynamically-loaded composer
$(document).ready(function() {
  console.log('=== ANONYMOUS PLUGIN JQUERY READY ===');

  function initCheckbox() {
    const $checkbox = $('.js-anonymous-checkbox');
    if ($checkbox.length > 0 && !$checkbox.data('anon-initialized')) {
      console.log('=== INITIALIZING CHECKBOX ===');
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
      addAnonymousCheckbox($composer);
      initComposerCheckbox($composer);
    });

    // Ensure the flag is sent (primary path)
    hooks.on('action:composer.submit', function (data) {
      const $active = $('.composer:not(.hidden)');
      const isChecked = $active.find('.js-anonymous-checkbox').is(':checked');
      console.log('=== COMPOSER SUBMIT HOOK === checked=', isChecked);
      if (isChecked && data.composerData) {
        data.composerData.anonymous = '1';
        if (data.postData) data.postData.anonymous = '1';
      }
    });

    // Backup path
    hooks.on('filter:composer.submit', function (data) {
      const $active = $('.composer:not(.hidden)');
      const isChecked = $active.find('.js-anonymous-checkbox').is(':checked');
      if (isChecked) {
        if (data.postData) data.postData.anonymous = '1';
        if (data.topicData) data.topicData.anonymous = '1';
      }
      return data;
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

// Handle checkbox click to toggle anonymous state
$(document).on('change', '[component="composer"] .js-anonymous-checkbox', function () {
  const $checkbox = $(this);
  const $composer = $checkbox.closest('[component="composer"]');
  const $form = $composer.find('form');

  if ($checkbox.is(':checked')) {
    // Add hidden input for anonymous
    $form.find('input[name="anonymous"]').remove();
    $form.append('<input type="hidden" name="anonymous" value="1">');
    $form.attr('data-anonymous', '1');
  } else {
    // Remove anonymous hidden input
    $form.find('input[name="anonymous"]').remove();
    $form.removeAttr('data-anonymous');
  }
});

// Fallback: ensure flag is in form submits too
$(document).on('submit', '[component="composer"] form', function () {
  const $form = $(this);
  const $composer = $form.closest('[component="composer"]');
  const isChecked = $composer.find('.js-anonymous-checkbox').is(':checked');

  if (isChecked) {
    // Ensure hidden input exists for anonymous
    $form.find('input[name="anonymous"]').remove();
    $form.append('<input type="hidden" name="anonymous" value="1">');
    $form.attr('data-anonymous', '1');
  } else {
    // Ensure anonymous flag is not submitted
    $form.find('input[name="anonymous"]').remove();
    $form.removeAttr('data-anonymous');
  }
});
