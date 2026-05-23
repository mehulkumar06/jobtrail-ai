const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { syncUserEmails } = require('../services/syncService');
const DeletedApplication = require('../models/DeletedApplication');

// GET /applications — fetch all applications for logged in user
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;

    // Base filter — only this user's applications
    const filter = { userId: req.user._id };

    // Optional status filter
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Optional source filter (inbox / sent)
if (req.query.source && req.query.source !== 'All') {
  filter.source = req.query.source;
}

    // Optional search filter on company and role
    if (search) {
      filter.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } }
      ];
    }

    const applications = await Application.find(filter)
      .sort({ dateApplied: -1 }); // Newest first

    res.json(applications);

  } catch (err) {
    console.error('Error fetching applications:', err.message);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// POST /applications/sync — manual sync triggered by frontend button
router.post('/sync', async (req, res) => {
  try {
    console.log(`Manual sync triggered by ${req.user.email}`);
    const result = await syncUserEmails(req.user);
    res.json({
      message: 'Sync complete',
      ...result
    });
  } catch (err) {
    console.error('Sync error:', err.message);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// GET /applications/stats — summary counts for dashboard cards
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    const [total, applied, interview, offer, rejected] = await Promise.all([
      Application.countDocuments({ userId }),
      Application.countDocuments({ userId, status: 'Applied' }),
      Application.countDocuments({ userId, status: 'Interview' }),
      Application.countDocuments({ userId, status: 'Offer' }),
      Application.countDocuments({ userId, status: 'Rejected' })
    ]);

    res.json({ total, applied, interview, offer, rejected });

  } catch (err) {
    console.error('Error fetching stats:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Save gmailMessageId to deleted list so it's never re-synced
    await DeletedApplication.findOneAndUpdate(
      { userId: req.user._id, gmailMessageId: application.gmailMessageId },
      { userId: req.user._id, gmailMessageId: application.gmailMessageId, deletedAt: new Date() },
      { upsert: true }
    );

    console.log(`Blacklisted gmailMessageId: ${application.gmailMessageId} for user ${req.user.email}`);

    res.json({ message: 'Application deleted', id: req.params.id });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

module.exports = router;