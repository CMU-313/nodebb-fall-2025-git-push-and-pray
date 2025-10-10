'use strict';

define('forum/anonymous-posting', ['hooks'], function (hooks) {
	const AnonymousPosting = {};

	AnonymousPosting.init = function () {
		// Listen for composer enhancement
		hooks.on('action:composer.enhance', function (data) {
			const composer = data.container;
			const anonymousCheckbox = composer.find('[component="composer/anonymous"]');
			
			if (anonymousCheckbox.length) {
				// Add change handler for the anonymous checkbox
				anonymousCheckbox.on('change', function () {
					const isAnonymous = $(this).is(':checked');
					console.log('Anonymous posting:', isAnonymous);
					
					// Store the anonymous state on the composer container
					composer.attr('data-anonymous', isAnonymous);
					
					// Fire hook for other plugins/modules to listen to
					hooks.fire('action:composer.anonymous.toggle', {
						anonymous: isAnonymous,
						composer: composer,
					});
				});
			}
		});

		// Listen for post submission to include anonymous flag
		hooks.on('filter:composer.submit', function (data) {
			const composer = data.composer;
			const anonymousCheckbox = composer.find('[component="composer/anonymous"]');
			const isAnonymous = anonymousCheckbox.length > 0 ? anonymousCheckbox.is(':checked') : false;
			
			if (isAnonymous) {
				// Set the anonymous flag in multiple places for compatibility
				data.anonymous = '1';
				if (data.postData) data.postData.anonymous = '1';
				if (data.composerData) data.composerData.anonymous = '1';
				console.log('Anonymous flag set in composer submit filter');
			}
			
			return data;
		});
	};

	return AnonymousPosting;
});