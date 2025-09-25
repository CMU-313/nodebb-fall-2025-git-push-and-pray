/* global $, require, console */
'use strict';

// Debug: This should show up immediately when the file loads
console.log('=== ANONYMOUS PLUGIN JS FILE LOADED ===');

// Test if jQuery is available and set up basic checkbox handling
$(document).ready(function() {
    console.log('=== ANONYMOUS PLUGIN JQUERY READY ===');
    
    // Find and initialize checkbox with polling (since composer might load dynamically)
    function initCheckbox() {
        const $checkbox = $('.js-anonymous-checkbox');
        if ($checkbox.length > 0 && !$checkbox.data('anon-initialized')) {
            console.log('=== FOUND CHECKBOX, SETTING UP HANDLERS ===');
            $checkbox.data('anon-initialized', true);
            
            $checkbox.on('change', function() {
                console.log('=== CHECKBOX CHANGED ===', this.checked);
            });
        }
    }
    
    // Poll for checkbox (in case composer loads after this script)
    const checkboxInterval = setInterval(initCheckbox, 1000);
    
    // Stop polling after 30 seconds to avoid infinite polling
    setTimeout(() => clearInterval(checkboxInterval), 30000);
    
    // Initialize immediately too
    initCheckbox();
});

// NodeBB hooks integration
if (typeof require === 'function') {
    console.log('=== REQUIRE FUNCTION AVAILABLE ===');
    
    require(['hooks'], function (hooks) {
        console.log('=== HOOKS MODULE LOADED ===');
        
        // When composer is loaded
        hooks.on('action:composer.loaded', function (data) {
            console.log('=== COMPOSER LOADED HOOK FIRED ===', data);
            
            const uuid = data.post_uuid;
            const $composer = $(`[component="composer"][data-uuid="${uuid}"]`);
            const $checkbox = $composer.find('.js-anonymous-checkbox');
            
            console.log('=== Found composer elements ===');
            console.log('- Composer:', $composer.length);
            console.log('- Checkbox:', $checkbox.length);
            console.log('- UUID:', uuid);
            
            if ($checkbox.length && !$checkbox.data('hook-initialized')) {
                $checkbox.data('hook-initialized', true);
                
                $checkbox.on('change', function() {
                    console.log('=== CHECKBOX CHANGED (via hook) ===', this.checked);
                });
            }
        });
        
        // When composer form is submitted
        hooks.on('action:composer.submit', function (payload) {
            console.log('=== COMPOSER SUBMIT HOOK FIRED ===');
            console.log('=== Original payload ===', payload);
            console.log('=== Payload keys ===', Object.keys(payload));
            console.log('=== PostData ===', payload.postData);
            console.log('=== ComposerData ===', payload.composerData);
            
            // Find the active composer and checkbox
            const $activeComposer = $('.composer:not(.hidden)');
            const $checkbox = $activeComposer.find('.js-anonymous-checkbox');
            const isChecked = $checkbox.is(':checked');
            
            console.log('=== Submit Analysis ===');
            console.log('- Active composer found:', $activeComposer.length);
            console.log('- Checkbox found:', $checkbox.length);
            console.log('- Checkbox checked:', isChecked);
            
            if (isChecked) {
                console.log('=== ADDING ANONYMOUS FLAG TO PAYLOAD ===');
                
                // Try multiple locations for the data
                if (payload.postData) {
                    payload.postData.anonymous = 1;
                    console.log('=== Added to postData ===');
                }
                
                if (payload.composerData) {
                    payload.composerData.anonymous = 1;
                    console.log('=== Added to composerData ===');
                }
                
                // Also try the original approach with safety check
                try {
                    if (!payload.data) {
                        payload.data = {};
                    }
                    payload.data.anonymous = 1;
                    console.log('=== Added to data ===');
                } catch (e) {
                    console.log('=== Could not add to data (this is OK) ===', e.message);
                }
                
                console.log('=== Updated payload ===', payload);
            }
        });
        
        // Alternative: Listen for any form submission
        hooks.on('action:composer.post', function (payload) {
            console.log('=== COMPOSER POST HOOK FIRED ===', payload);
        });
        
    });
} else {
    console.log('=== REQUIRE NOT AVAILABLE ===');
}

// Fallback: Direct form handling (in case hooks don't work)
$(document).on('submit', '[component="composer"] form', function(e) {
    console.log('=== FORM SUBMIT EVENT CAUGHT ===');
    
    const $form = $(this);
    const $composer = $form.closest('[component="composer"]');
    const $checkbox = $composer.find('.js-anonymous-checkbox');
    const isChecked = $checkbox.is(':checked');
    
    console.log('=== Form Submit Analysis ===');
    console.log('- Form:', $form.length);
    console.log('- Composer:', $composer.length);
    console.log('- Checkbox:', $checkbox.length);
    console.log('- Checked:', isChecked);
    
    if (isChecked) {
        console.log('=== ADDING HIDDEN FIELD TO FORM ===');
        
        // Remove any existing anonymous field
        $form.find('input[name="anonymous"]').remove();
        
        // Add new hidden field
        $form.append('<input type="hidden" name="anonymous" value="1">');
        
        console.log('=== Hidden field added ===');
        console.log('- Form data:', $form.serialize());
    }
});

// Another fallback: Button click handler
$(document).on('click', '[component="composer/submit"]', function() {
    console.log('=== SUBMIT BUTTON CLICKED ===');
    
    const $button = $(this);
    const $composer = $button.closest('[component="composer"]');
    const $checkbox = $composer.find('.js-anonymous-checkbox');
    const isChecked = $checkbox.is(':checked');
    
    console.log('=== Button Click Analysis ===');
    console.log('- Button:', $button.length);
    console.log('- Composer:', $composer.length);
    console.log('- Checkbox:', $checkbox.length);
    console.log('- Checked:', isChecked);
    
    if (isChecked) {
        console.log('=== ANONYMOUS POST DETECTED ===');
        
        // Try to add to any forms in this composer
        const $forms = $composer.find('form');
        $forms.each(function() {
            const $form = $(this);
            $form.find('input[name="anonymous"]').remove();
            $form.append('<input type="hidden" name="anonymous" value="1">');
            console.log('=== Added anonymous field to form ===');
        });
    }
});