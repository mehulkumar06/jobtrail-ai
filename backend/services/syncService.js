const { fetchJobEmails, fetchSentJobEmails } = require('./gmailService');
const { extractApplicationData, extractSentApplicationData } = require('./groqService');
const Application = require('../models/Application');
const DeletedApplication = require('../models/DeletedApplication');
const User = require('../models/User');

const processEmails = async (emails, userId, extractFn, source) => {
  let synced = 0;
  let skipped = 0;

  for (const email of emails) {
    try {
      // Check if already exists
const existing = await Application.findOne({
  userId,
  gmailMessageId: email.id
});

if (existing) {
  skipped++;
  continue;
}

// Check if user previously deleted this application
const deleted = await DeletedApplication.findOne({
  userId,
  gmailMessageId: email.id
});

if (deleted) {
  console.log(`Skipping permanently deleted email: ${email.id}`);
  skipped++;
  continue;
}

      const data = await extractFn(email);

      if (!data || !data.company) {
  skipped++;
  continue;
}

// Skip low confidence extractions
if (data.confidence < 0.75) {
  console.log(`Skipping low confidence extraction: ${email.subject} (${data.confidence})`);
  skipped++;
  continue;
}

      const application = new Application({
        userId,
        gmailMessageId: email.id,
        company: data.company,
        role: data.role || 'Not specified',
        dateApplied: data.dateApplied || email.date,
        status: data.status || 'Applied',
        emailSnippet: email.snippet,
        gmailLink: `https://mail.google.com/mail/u/0/#${source === 'sent' ? 'sent' : 'inbox'}/${email.id}`,
        aiConfidence: data.confidence || 0,
        source
      });

      await application.save();
      console.log(`[${source}] Saved: ${data.company} — ${data.role}`);
      synced++;

    } catch (emailErr) {
      console.error(`Error processing ${source} email ${email.id}:`, emailErr.message);
      skipped++;
      continue;
    }
  }

  return { synced, skipped };
};

const syncUserEmails = async (user) => {
  console.log(`\n--- Starting sync for ${user.email} ---`);

  try {
    // Fetch inbox job emails
    const inboxEmails = await fetchJobEmails(user);
    const inboxResult = await processEmails(
      inboxEmails, user._id, extractApplicationData, 'inbox'
    );

    // Fetch sent job emails
    const sentEmails = await fetchSentJobEmails(user);
    const sentResult = await processEmails(
      sentEmails, user._id, extractSentApplicationData, 'sent'
    );

    const totalSynced = inboxResult.synced + sentResult.synced;
    const totalSkipped = inboxResult.skipped + sentResult.skipped;
    const totalEmails = inboxEmails.length + sentEmails.length;

    await User.findByIdAndUpdate(user._id, { lastSyncedAt: new Date() });

    console.log(`--- Sync complete: ${totalSynced} saved, ${totalSkipped} skipped ---\n`);

    return {
      synced: totalSynced,
      skipped: totalSkipped,
      total: totalEmails,
      inbox: inboxResult.synced,
      sent: sentResult.synced
    };

  } catch (err) {
    console.error('Sync error for user', user.email, ':', err.message);
    return { synced: 0, skipped: 0, total: 0, inbox: 0, sent: 0 };
  }
};

module.exports = { syncUserEmails };