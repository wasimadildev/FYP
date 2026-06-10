const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    datetime: {
      type: Date,
      required: [true, 'Appointment date/time is required'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    symptoms: {
      type: String,
    },
    diagnosis: {
      type: String,
    },
    notes: {
      type: String,
    },
    txHash: {
      type: String,
    },
    fee: {
      type: Number,
    },
    videoRoomSid: {
      type: String,
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, datetime: -1 });
appointmentSchema.index({ patientId: 1, datetime: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
