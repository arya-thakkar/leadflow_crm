const mongoose = require('mongoose');

const VALID_STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

const statusHistorySchema = new mongoose.Schema({
  fromStatus: { type: String },
  toStatus: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
}, { _id: false });

const leadSchema = new mongoose.Schema({
  sheetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sheet',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true,
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: {
      values: VALID_STATUSES,
      message: 'Status must be one of: New, Contacted, Qualified, Converted, Lost',
    },
    default: 'New',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  statusHistory: [statusHistorySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound indexes for performance
leadSchema.index({ sheetId: 1, createdAt: -1 });
leadSchema.index({ sheetId: 1, status: 1 });
leadSchema.index({
  sheetId: 1,
  name: 'text',
  email: 'text',
  company: 'text',
});

// Pre-save: record status history on change
leadSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    const prev = this._previousStatus || null;
    this.statusHistory.push({ fromStatus: prev, toStatus: this.status });
  }
  if (this.isNew && this.status) {
    this.statusHistory.push({ fromStatus: null, toStatus: this.status });
  }
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
module.exports.VALID_STATUSES = VALID_STATUSES;
