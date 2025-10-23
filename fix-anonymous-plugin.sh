#!/bin/bash

echo "=== NodeBB Anonymous Plugin Setup Script ==="
echo "This script will help fix and activate the anonymous posting plugin"
echo

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "nodebb-plugin-anonymous-checkbox" ]; then
    echo "❌ Error: Please run this script from the NodeBB root directory"
    exit 1
fi

echo "✅ In correct directory"

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running or accessible"
    exit 1
fi

echo "✅ Docker is accessible"

# Stop the current NodeBB instance
echo "🛑 Stopping current NodeBB instance..."
docker compose -f docker-compose-redis.yml down

# Rebuild the Docker image to include our plugin fixes
echo "🔨 Rebuilding NodeBB with plugin fixes..."
docker compose -f docker-compose-redis.yml build --no-cache

# Start NodeBB again
echo "🚀 Starting NodeBB..."
docker compose -f docker-compose-redis.yml up -d

# Wait for NodeBB to start
echo "⏳ Waiting for NodeBB to start..."
sleep 30

# Try to activate the plugin via API
echo "🔌 Attempting to activate the anonymous plugin..."

# Check if NodeBB is responding
if curl -s http://localhost:4567 > /dev/null; then
    echo "✅ NodeBB is responding"
    
    # Create activation script that runs inside the container
    cat > temp_activate.js << 'EOF'
const nconf = require('nconf');
const path = require('path');

// Set up configuration
nconf.file({ file: '/opt/config/config.json' });
nconf.defaults({
    base_dir: '/usr/src/app',
    themes_path: '/usr/src/app/node_modules',
    upload_path: 'public/uploads',
    views_dir: '/usr/src/app/build/public/templates',
});

async function activatePlugin() {
    try {
        const db = require('/usr/src/app/src/database');
        await db.init();
        
        const plugins = require('/usr/src/app/src/plugins');
        
        console.log('Checking plugin status...');
        const isActive = await plugins.isActive('nodebb-plugin-anonymous-checkbox');
        
        if (isActive) {
            console.log('✅ Plugin is already active');
        } else {
            console.log('Activating plugin...');
            await plugins.toggleActive('nodebb-plugin-anonymous-checkbox');
            console.log('✅ Plugin activated!');
        }
        
        await db.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

activatePlugin();
EOF

    # Run the activation script inside the Docker container
    echo "📦 Running activation script in container..."
    docker compose -f docker-compose-redis.yml exec -T nodebb node temp_activate.js
    
    # Clean up
    rm temp_activate.js
    
    # Restart NodeBB to load the plugin
    echo "🔄 Restarting NodeBB to load the plugin..."
    docker compose -f docker-compose-redis.yml restart
    
    # Wait for restart
    sleep 20
    
    echo
    echo "=== Setup Complete! ==="
    echo
    echo "✅ Anonymous posting plugin should now be active"
    echo "🌐 Your NodeBB is running at: http://$(hostname -I | awk '{print $1}'):4567"
    echo
    echo "📝 To test the anonymous posting feature:"
    echo "   1. Go to your NodeBB site"
    echo "   2. Create a new post or topic"
    echo "   3. Look for the 'Post anonymously' checkbox"
    echo "   4. Check the box and submit your post"
    echo "   5. The post should appear with 'Anonymous' as the author"
    echo
    echo "🔧 If you still don't see the checkbox:"
    echo "   1. Go to http://your-server:4567/admin/extend/plugins"
    echo "   2. Find 'Anonymous Posts' plugin"
    echo "   3. Make sure it's activated (green button)"
    echo "   4. If not, click 'Activate'"
    echo
else
    echo "❌ NodeBB is not responding. Please check the logs:"
    echo "   docker compose -f docker-compose-redis.yml logs"
fi