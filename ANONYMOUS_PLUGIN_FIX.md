# NodeBB Anonymous Posting Plugin - Troubleshooting Guide

## Issue Identified

The anonymous posting plugin wasn't working due to a critical bug in the code that disabled the plugin in production environments.

## Fixes Applied

1. **Fixed Test Environment Check**: The plugin was incorrectly disabled when `TEST_ENV='production'`
2. **Improved Checkbox Detection**: Better handling of different theme layouts
3. **Enhanced Theme Compatibility**: Works with more NodeBB themes
4. **Added Better Debugging**: More console output to help troubleshoot

## Quick Fix Steps

### Option 1: Automated Fix (Recommended)
Run this script on your server:
```bash
cd /path/to/your/nodebb
./fix-anonymous-plugin.sh
```

### Option 2: Manual Fix
1. **Apply the code fixes** (already done in your repo)
2. **Rebuild and restart NodeBB**:
   ```bash
   docker compose -f docker-compose-redis.yml down
   docker compose -f docker-compose-redis.yml build --no-cache
   docker compose -f docker-compose-redis.yml up -d
   ```

3. **Activate the plugin via Admin Panel**:
   - Go to `http://your-server:4567/admin/extend/plugins`
   - Find "Anonymous Posts" plugin
   - Click "Activate"
   - Restart NodeBB

4. **OR activate via command line**:
   ```bash
   # Execute inside the Docker container
   docker compose -f docker-compose-redis.yml exec nodebb ./nodebb activate nodebb-plugin-anonymous-checkbox
   docker compose -f docker-compose-redis.yml restart
   ```

## Testing the Fix

After activation:

1. **Create a new post or topic**
2. **Look for the anonymous checkbox** - you should see:
   - A checkbox labeled "Post anonymously" with a user-secret icon
   - It might appear in different locations depending on your theme

3. **Test posting anonymously**:
   - Check the anonymous checkbox
   - Submit your post
   - The post should appear with "Anonymous" as the author
   - User profile picture should be hidden

## Debugging

If it still doesn't work, check:

1. **Plugin is active**:
   ```bash
   docker compose -f docker-compose-redis.yml exec nodebb ./nodebb plugins
   ```

2. **Check logs for plugin loading**:
   ```bash
   docker compose -f docker-compose-redis.yml logs | grep "ANON"
   ```

3. **Browser console** (F12):
   - Look for messages starting with "=== ANONYMOUS PLUGIN"
   - Check for any JavaScript errors

4. **Theme compatibility**: Some themes might not display the checkbox in the expected location

## Common Issues

1. **Checkbox not visible**: Check different post/topic creation pages
2. **Posts not anonymous**: Ensure plugin is activated and NodeBB restarted
3. **JavaScript errors**: Check browser console for conflicts
4. **Theme conflicts**: Try switching to default theme temporarily

## Support

If you continue having issues:
1. Check the browser console for errors
2. Verify the plugin is in the active plugins list
3. Ensure NodeBB was restarted after activation
4. Try creating posts in different areas (new topics, replies, etc.)