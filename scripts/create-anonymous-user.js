// This script ensures an anonymous user exists in Redis for NodeBB
const redis = require('redis');
const client = redis.createClient({
  url: 'redis://localhost:6379/0',
});

async function ensureAnonymousUser() {
  await client.connect();
  const username = 'anonymous';
  const email = 'anonymous@example.com';
  const userslug = 'anonymous';
  const now = Math.floor(Date.now() / 1000);

  // Check if username exists
  const uid = await client.get(`username:uid:${username}`);
  if (uid) {
    console.log('Anonymous user already exists with UID', uid);
    await client.quit();
    return;
  }

  // Get next UID
  const nextUid = await client.incr('nextUid');

  // Create user hash
  await client.hSet(`user:${nextUid}`, {
    username,
    email,
    joindate: now,
    userslug,
  });

  // Add to sorted sets and sets
  await client.zAdd('users:joindate', [{ score: now, value: String(nextUid) }]);
  await client.zAdd('username:sorted', [{ score: 0, value: username }]);
  await client.set(`username:uid:${username}`, nextUid);
  await client.sAdd('users:uids', nextUid);

  console.log('Anonymous user created with UID', nextUid);
  await client.quit();
}

ensureAnonymousUser().catch(err => {
  console.error('Error creating anonymous user:', err);
  process.exit(1);
});
