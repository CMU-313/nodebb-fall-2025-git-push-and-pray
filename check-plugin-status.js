#!/usr/bin/env node

'use strict';

// Check anonymous plugin status
const path = require('path');
const fs = require('fs');

console.log('=== NodeBB Anonymous Plugin Diagnostic ===\n');

// Check if plugin exists
const pluginPath = path.join(__dirname, 'nodebb-plugin-anonymous-checkbox');
console.log('1. Plugin Directory Check:');
if (fs.existsSync(pluginPath)) {
    console.log('✅ Plugin directory exists:', pluginPath);
    
    // Check plugin.json
    const pluginJsonPath = path.join(pluginPath, 'plugin.json');
    if (fs.existsSync(pluginJsonPath)) {
        console.log('✅ plugin.json exists');
        try {
            const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
            console.log('   Plugin ID:', pluginJson.id);
            console.log('   Plugin Name:', pluginJson.name);
            console.log('   Version:', pluginJson.version);
        } catch (e) {
            console.log('❌ Error reading plugin.json:', e.message);
        }
    } else {
        console.log('❌ plugin.json missing');
    }
    
    // Check library.js
    const libraryPath = path.join(pluginPath, 'library.js');
    if (fs.existsSync(libraryPath)) {
        console.log('✅ library.js exists');
    } else {
        console.log('❌ library.js missing');
    }
} else {
    console.log('❌ Plugin directory does not exist');
}

// Check package.json includes the plugin
console.log('\n2. Package.json Check:');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.dependencies && packageJson.dependencies['nodebb-plugin-anonymous-checkbox']) {
            console.log('✅ Plugin listed in package.json dependencies');
            console.log('   Version:', packageJson.dependencies['nodebb-plugin-anonymous-checkbox']);
        } else {
            console.log('❌ Plugin NOT listed in package.json dependencies');
        }
    } catch (e) {
        console.log('❌ Error reading package.json:', e.message);
    }
} else {
    console.log('❌ package.json not found');
}

// Check if NodeBB config exists
console.log('\n3. NodeBB Configuration Check:');
const configPaths = [
    path.join(__dirname, 'config.json'),
    path.join(__dirname, '.docker/config/config.json')
];

let configFound = false;
for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
        console.log('✅ Config found at:', configPath);
        configFound = true;
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            console.log('   Database:', config.database || 'not specified');
            console.log('   URL:', config.url || 'not specified');
            
            // Check if plugins are defined in config
            if (config['plugins:active']) {
                console.log('   Active plugins in config:', config['plugins:active']);
                if (config['plugins:active'].includes('nodebb-plugin-anonymous-checkbox')) {
                    console.log('   ✅ Anonymous plugin is active in config');
                } else {
                    console.log('   ❌ Anonymous plugin is NOT active in config');
                }
            } else {
                console.log('   No plugins:active setting in config (normal)');
            }
        } catch (e) {
            console.log('❌ Error reading config:', e.message);
        }
        break;
    }
}

if (!configFound) {
    console.log('❌ No NodeBB config found in expected locations');
}

// Check node_modules
console.log('\n4. Node Modules Check:');
const nodeModulesPluginPath = path.join(__dirname, 'node_modules/nodebb-plugin-anonymous-checkbox');
if (fs.existsSync(nodeModulesPluginPath)) {
    console.log('✅ Plugin installed in node_modules');
} else {
    console.log('❌ Plugin NOT installed in node_modules');
}

console.log('\n=== Diagnostic Complete ===');
console.log('\nNext steps:');
console.log('1. If plugin is not activated, you need to activate it via NodeBB admin panel');
console.log('2. Go to http://your-server:4567/admin/extend/plugins');
console.log('3. Find "Anonymous Posts" plugin and click Activate');
console.log('4. OR use command line: ./nodebb activate nodebb-plugin-anonymous-checkbox');