const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema(
  {
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthRecord',
      required: true,
    },
    accessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accessType: {
      type: String,
      enum: ['view', 'download', 'share', 'delete'],
      required: [true, 'Access type is required'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    blockchainTxHash: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  { timestamps: true }
);

accessLogSchema.index({ recordId: 1, timestamp: -1 });
accessLogSchema.index({ accessedBy: 1, timestamp: -1 });

module.exports = mongoose.model('AccessLog', accessLogSchema);
