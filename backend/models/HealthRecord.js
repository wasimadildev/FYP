const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    cid: {
      type: String,
      required: [true, 'IPFS CID is required'],
    },
    fileType: {
      type: String,
      enum: ['lab-report', 'prescription', 'imaging', 'vital-signs', 'other'],
      default: 'other',
    },
    category: {
      type: String,
    },
    description: {
      type: String,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    blockchainTxHash: {
      type: String,
    },
    encryptedAesKey: {
      type: String,
    },
  },
  { timestamps: true }
);

healthRecordSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
