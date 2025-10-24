#!/usr/bin/env node

'use strict';

// Script to activate the anonymous posting plugin
const path = require('path');

async function activatePlugin() {
	try {
		console.log('Activating nodebb-plugin-anonymous-checkbox...');
        
		// Set up NodeBB environment
		process.env.NODE_ENV = process.env.NODE_ENV || 'production';
        
		// Initialize NodeBB
		const nconf = require('nconf');
		nconf.file({ file: path.join(__dirname, '.docker/config/config.json') });
		nconf.defaults({
			base_dir: __dirname,
			themes_path: path.join(__dirname, 'node_modules'),
			upload_path: 'public/uploads',
			views_dir: path.join(__dirname, 'build/public/templates'),
		});
        
		// Initialize database
		const db = require('./src/database');
		await db.init();
        
		const plugins = require('./src/plugins');
        
		// Check if plugin is already active
		const isActive = await plugins.isActive('nodebb-plugin-anonymous-checkbox');
		if (isActive) {
			console.log('✅ Plugin is already active');
			process.exit(0);
		}
        
		// Check if plugin is installed
		const isInstalled = await plugins.isInstalled('nodebb-plugin-anonymous-checkbox');
		if (!isInstalled) {
			console.log('❌ Plugin is not installed');
			process.exit(1);
		}
        
		// Activate the plugin
		console.log('Activating plugin...');
		const result = await plugins.toggleActive('nodebb-plugin-anonymous-checkbox');
        
		if (result.active) {
			console.log('✅ Plugin activated successfully!');
			console.log('🔄 NodeBB restart required for changes to take effect');
			console.log('   Run: docker compose -f docker-compose-redis.yml restart');
		} else {
			console.log('❌ Failed to activate plugin');
		}
        
		await db.close();
		process.exit(0);
        
	} catch (error) {
		console.error('❌ Error activating plugin:', error.message);
		console.error(error.stack);
		process.exit(1);
	}
}

// Run the activation
activatePlugin();