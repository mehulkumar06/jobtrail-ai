const mongoose = require('mongoose');

const DeletedApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gmailMessageId: {
    type: String,
    required: true
  },
  deletedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for fast lookup during sync
DeletedApplicationSchema.index({ userId: 1, gmailMessageId: 1 }, { unique: true });

module.exports = mongoose.model('DeletedApplication', DeletedApplicationSchema);