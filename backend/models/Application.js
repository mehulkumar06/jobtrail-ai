const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gmailMessageId: {
    type: String,
    required: true,
    unique: true
  },
  company: {
    type: String,
    required: true
  },
  role: {
    type: String
  },
  dateApplied: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Rejected', 'Interview', 'Offer', 'Unknown'],
    default: 'Applied'
  },
  emailSnippet: {
    type: String
  },
  gmailLink: {
    type: String
  },
  source: {
  type: String,
  enum: ['inbox', 'sent'],
  default: 'inbox'
},
  aiConfidence: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for fast deduplication lookups
ApplicationSchema.index({ userId: 1, gmailMessageId: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);