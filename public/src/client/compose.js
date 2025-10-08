'use strict';


define('forum/compose', ['hooks', 'forum/anonymous-posting'], function (hooks, anonymousPosting) {
	const Compose = {};

	Compose.init = function () {
		const container = $('.composer');

		if (container.length) {
			// Initialize anonymous posting functionality
			anonymousPosting.init();
			
			hooks.fire('action:composer.enhance', {
				container: container,
			});
		}
	};

	return Compose;
});
