'use strict';

const router = require('express').Router();
const controllers = require('../controllers');
const { setupApiRoute } = require('./helpers');

module.exports = function (middleware) {
	const middlewares = [middleware.autoLocale];

	setupApiRoute(router, 'get', '/search', middlewares, controllers.searchBar.search);
	setupApiRoute(router, 'get', '/search/suggestions', middlewares, controllers.searchBar.getSuggestions);
	setupApiRoute(router, 'post', '/search/advanced', middlewares, controllers.searchBar.advancedSearch);
	setupApiRoute(router, 'get', '/search/history', middlewares, controllers.searchBar.getSearchHistory);
	setupApiRoute(router, 'delete', '/search/history', middlewares, controllers.searchBar.clearSearchHistory);

	return router;
};
