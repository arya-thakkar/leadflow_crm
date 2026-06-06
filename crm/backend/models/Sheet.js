const mongoose = require('mongoose');

const sheetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sheetName: {
    type: String,
    required: [true, 'Sheet name is required'],
    trim: true,
    maxlength: [100, 'Sheet name cannot exceed 100 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for fast lookups
sheetSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Sheet', sheetSchema);
