#!/bin/bash

# NodeBB Anonymous Plugin - Complete Fix Script
# Run this on your production server

set -e

echo "======================================"
echo "NodeBB Anonymous Plugin Fix"
echo "======================================"
echo

# Ensure we're in the right directory
if [ ! -f "docker-compose-redis.yml" ]; then
    echo "❌ Error: docker-compose-redis.yml not found"
    echo "Please run this script from your NodeBB root directory"
    exit 1
fi

echo "✅ Found NodeBB configuration"

# Pull latest changes if this is a git repo
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes..."
    git pull origin main || echo "⚠️  Could not pull latest changes"
fi

# Stop current instance
echo "🛑 Stopping NodeBB..."
docker compose -f docker-compose-redis.yml down

# Rebuild with no cache to ensure our fixes are included
echo "🔨 Rebuilding NodeBB with plugin fixes..."
docker compose -f docker-compose-redis.yml build --no-cache nodebb

# Start NodeBB
echo "🚀 Starting NodeBB..."
docker compose -f docker-compose-redis.yml up -d

echo "⏳ Waiting for NodeBB to start (30 seconds)..."
sleep 30

# Check if NodeBB is running
if docker compose -f docker-compose-redis.yml ps | grep -q "nodebb.*Up"; then
    echo "✅ NodeBB is running"
    
    # Get the IP address
    SERVER_IP=$(hostname -I | awk '{print $1}')
    echo "🌐 NodeBB should be accessible at: http://${SERVER_IP}:4567"
    
    # Try to activate the plugin
    echo "🔌 Attempting to activate the anonymous plugin..."
    
    # Create a temporary activation script
    cat > /tmp/activate_plugin.js << 'EOF'
const nconf = require('nconf');
const path = require('path');

nconf.file({ file: '/opt/config/config.json' });
nconf.defaults({
    base_dir: '/usr/src/app',
    themes_path: '/usr/src/app/node_modules',
});

async function run() {
    try {
        const db = require('/usr/src/app/src/database');
        await db.init();
        
        const plugins = require('/usr/src/app/src/plugins');
        
        const isActive = await plugins.isActive('nodebb-plugin-anonymous-checkbox');
        
        if (isActive) {
            console.log('✅ Plugin is already active');
        } else {
            console.log('Activating plugin...');
            const result = await plugins.toggleActive('nodebb-plugin-anonymous-checkbox');
            if (result.active) {
                console.log('✅ Plugin activated successfully!');
            } else {
                console.log('❌ Failed to activate plugin');
            }
        }
        
        await db.close();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

run();
EOF

    # Copy script to container and run it
    docker cp /tmp/activate_plugin.js $(docker compose -f docker-compose-redis.yml ps -q nodebb):/tmp/
    
    if docker compose -f docker-compose-redis.yml exec -T nodebb node /tmp/activate_plugin.js; then
        echo "✅ Plugin activation completed"
        
        # Restart to ensure plugin is loaded
        echo "🔄 Restarting NodeBB to load the plugin..."
        docker compose -f docker-compose-redis.yml restart nodebb
        
        echo "⏳ Waiting for restart..."
        sleep 20
        
        # Clean up
        rm -f /tmp/activate_plugin.js
        
        echo
        echo "======================================"
        echo "✅ SETUP COMPLETE!"
        echo "======================================"
        echo
        echo "Your NodeBB should now have working anonymous posting!"
        echo
        echo "🌐 Access your site: http://${SERVER_IP}:4567"
        echo
        echo "📝 To test:"
        echo "  1. Go to your NodeBB site"
        echo "  2. Create a new post or topic"
        echo "  3. Look for 'Post anonymously' checkbox"
        echo "  4. Check it and submit"
        echo "  5. Post should appear as 'Anonymous'"
        echo
        echo "🔧 If checkbox is missing:"
        echo "  - Go to Admin → Extend → Plugins"
        echo "  - Find 'Anonymous Posts' and ensure it's active"
        echo "  - Check browser console for debug messages"
        echo
        echo "📋 Debug info:"
        echo "  - Plugin logs: docker compose -f docker-compose-redis.yml logs | grep ANON"
        echo "  - Container status: docker compose -f docker-compose-redis.yml ps"
        echo
    else
        echo "❌ Plugin activation failed"
        echo "Try manual activation via admin panel:"
        echo "http://${SERVER_IP}:4567/admin/extend/plugins"
    fi
    
else
    echo "❌ NodeBB failed to start"
    echo "Check logs: docker compose -f docker-compose-redis.yml logs"
    exit 1
fi