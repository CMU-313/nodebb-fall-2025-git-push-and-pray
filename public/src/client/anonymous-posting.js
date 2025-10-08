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
						composer: composer
					});
				});
			}
		});

		// Listen for post submission to include anonymous flag
		hooks.on('filter:composer.submit', function (data) {
			const composer = data.composer;
			const isAnonymous = composer.attr('data-anonymous') === 'true';
			
			if (isAnonymous) {
				data.anonymous = true;
			}
			
			return data;
		});
	};

	return AnonymousPosting;
});