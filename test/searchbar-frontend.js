'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

describe('Search Frontend Templates', () => {
	describe('Search Page Template', () => {
		it('should exist and contain required elements', () => {
			const templatePath = path.join(__dirname, '../vendor/nodebb-theme-harmony-2.1.15/templates/searchbar.tpl');
			assert(fs.existsSync(templatePath), 'Search template should exist');
			
			const templateContent = fs.readFileSync(templatePath, 'utf8');
			assert(templateContent.includes('search-form'), 'Template should contain search form');
			assert(templateContent.includes('search-input'), 'Template should contain search input');
			assert(templateContent.includes('search-results'), 'Template should contain search results container');
		});

		it('should include proper JavaScript functionality', () => {
			const templatePath = path.join(__dirname, '../vendor/nodebb-theme-harmony-2.1.15/templates/searchbar.tpl');
			const templateContent = fs.readFileSync(templatePath, 'utf8');
			
			assert(templateContent.includes('addEventListener'), 'Template should include event listeners');
			assert(templateContent.includes('/api/searchbar'), 'Template should call the searchbar API');
			assert(templateContent.includes('$.ajax') || templateContent.includes('fetch') || templateContent.includes('XMLHttpRequest'), 
				'Template should make HTTP requests for search');
		});

		it('should handle loading states', () => {
			const templatePath = path.join(__dirname, '../vendor/nodebb-theme-harmony-2.1.15/templates/searchbar.tpl');
			const templateContent = fs.readFileSync(templatePath, 'utf8');
			
			assert(templateContent.includes('loading') || templateContent.includes('Loading'), 
				'Template should handle loading states');
		});

		it('should include proper styling', () => {
			const scssPath = path.join(__dirname, '../vendor/nodebb-theme-harmony-2.1.15/scss/search.scss');
			assert(fs.existsSync(scssPath), 'Search SCSS file should exist');
			
			const scssContent = fs.readFileSync(scssPath, 'utf8');
			assert(scssContent.includes('search-form'), 'SCSS should include search form styles');
			assert(scssContent.includes('no-results') || scssContent.includes('results'), 'SCSS should include search results styles');
		});
	});

	describe('Sidebar Search Button', () => {
		it('should be present in sidebar template', () => {
			const sidebarPath = path.join(__dirname, '../vendor/nodebb-theme-harmony-2.1.15/templates/partials/sidebar-left.tpl');
			assert(fs.existsSync(sidebarPath), 'Sidebar template should exist');
			
			const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
			assert(sidebarContent.includes('fa-search'), 'Sidebar should contain search icon');
			assert(sidebarContent.includes('href="/searchbar"'), 'Sidebar should link to search page');
			assert(sidebarContent.includes('aria-label="Search"'), 'Search button should have proper accessibility');
		});

		it('should have proper search button structure', () => {
			const sidebarPath = path.join(__dirname, '../vendor/nodebb-theme-harmony-2.1.15/templates/partials/sidebar-left.tpl');
			const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
			
			assert(sidebarContent.includes('Persistent Search Button'), 'Should have search button comment');
			assert(sidebarContent.includes('nav-link'), 'Search button should use proper CSS classes');
			assert(sidebarContent.includes('title="Search"'), 'Search button should have proper title');
		});
	});

	describe('Search Controller', () => {
		it('should exist and export proper functions', () => {
			const controllerPath = path.join(__dirname, '../src/controllers/searchbar-page.js');
			assert(fs.existsSync(controllerPath), 'Search page controller should exist');
			
			const controller = require(controllerPath);
			assert(typeof controller.searchbar === 'function', 'Controller should export searchbar function');
		});
	});

	describe('Search Routes', () => {
		it('should be properly configured', () => {
			// Check if routes file exists and contains search route
			const routesPath = path.join(__dirname, '../src/routes/index.js');
			if (fs.existsSync(routesPath)) {
				const routesContent = fs.readFileSync(routesPath, 'utf8');
				assert(routesContent.includes('searchbar') || routesContent.includes('/searchbar'), 
					'Routes should include search functionality');
			}
		});
	});

	describe('Search Integration', () => {
		it('should have harmony theme integration', () => {
			const harmonyScssPath = path.join(__dirname, '../vendor/nodebb-theme-harmony-2.1.15/scss/harmony.scss');
			if (fs.existsSync(harmonyScssPath)) {
				const harmonyContent = fs.readFileSync(harmonyScssPath, 'utf8');
				assert(harmonyContent.includes('search'), 'Harmony theme should include search styles');
			}
		});

		it('should have plugin configuration', () => {
			const pluginPath = path.join(__dirname, '../vendor/nodebb-theme-harmony-2.1.15/plugin.json');
			if (fs.existsSync(pluginPath)) {
				const pluginContent = fs.readFileSync(pluginPath, 'utf8');
				const pluginConfig = JSON.parse(pluginContent);
				
				// Check if search template is registered
				assert(pluginConfig.templates, 'Plugin should have templates configuration');
			}
		});
	});
});