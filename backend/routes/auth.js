const express = require('express');
const router = express.Router();
const passport = require('passport');
const isAuthenticated = require('../middleware/isAuthenticated');


// Step 1: Redirect user to Google login
router.get('/google', passport.authenticate('google', {
  scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/gmail.readonly'
  ],
  accessType: 'offline',
  prompt: 'consent'
}));

// Step 2: Google redirects back here after login
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/`
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) console.error('Logout error:', err);
    res.redirect(process.env.FRONTEND_URL);
  });
});

// Get current logged-in user
router.get('/me', isAuthenticated, (req, res) => {
  try {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      lastSyncedAt: req.user.lastSyncedAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;