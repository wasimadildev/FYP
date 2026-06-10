const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Medication name is required'],
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
    },
    frequency: {
      type: String,
    },
    route: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    refillsRemaining: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    reminders: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

medicationSchema.index({ patientId: 1, isActive: -1 });

module.exports = mongoose.model('Medication', medicationSchema);
