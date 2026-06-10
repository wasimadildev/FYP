const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    bloodPressureSystolic: {
      type: Number,
    },
    bloodPressureDiastolic: {
      type: Number,
    },
    heartRate: {
      type: Number,
    },
    temperature: {
      type: Number,
    },
    oxygenSaturation: {
      type: Number,
    },
    bloodSugar: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    height: {
      type: Number,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

vitalsSchema.index({ patientId: 1, recordedAt: -1 });

module.exports = mongoose.model('Vitals', vitalsSchema);
