const cron = require('node-cron');
const { syncUserEmails } = require('../services/syncService');
const User = require('../models/User');

const startEmailPoller = () => {
  // Runs every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('\n[Cron] Running scheduled email sync...');

    try {
      // Fetch all users from MongoDB
      const users = await User.find({});

      if (users.length === 0) {
        console.log('[Cron] No users found to sync.');
        return;
      }

      console.log(`[Cron] Syncing ${users.length} user(s)...`);

      // Sync each user independently
      for (const user of users) {
        try {
          const result = await syncUserEmails(user);
          console.log(`[Cron] ${user.email}: ${result.synced} synced, ${result.skipped} skipped`);
        } catch (userErr) {
          // One user failing should NOT stop others
          console.error(`[Cron] Failed for ${user.email}:`, userErr.message);
        }
      }

      console.log('[Cron] Scheduled sync complete.\n');

    } catch (err) {
      console.error('[Cron] Error fetching users:', err.message);
    }
  });

  console.log('Email poller started — running every 15 minutes');
};

module.exports = { startEmailPoller };