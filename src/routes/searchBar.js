'use strict';

const router = require('express').Router();
const controllers = require('../controllers');
const { setupApiRoute } = require('./helpers');

module.exports = function (middleware) {
	const middlewares = [middleware.autoLocale];

	setupApiRoute(router, 'get', '/searchbar/query', middlewares, controllers.searchBar.search);
	setupApiRoute(router, 'get', '/searchbar/suggestions', middlewares, controllers.searchBar.getSuggestions);
	setupApiRoute(router, 'post', '/searchbar/advanced', middlewares, controllers.searchBar.advancedSearch);
	setupApiRoute(router, 'get', '/searchbar/history', middlewares, controllers.searchBar.getSearchHistory);
	setupApiRoute(router, 'delete', '/searchbar/history', middlewares, controllers.searchBar.clearSearchHistory);

	return router;
};
