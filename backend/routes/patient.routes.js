const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const HealthRecord = require('../models/HealthRecord');
const Vitals = require('../models/Vitals');
const Appointment = require('../models/Appointment');
const verifyJWT = require('../middleware/auth.middleware');
const restrictTo = require('../middleware/rbac.middleware');

router.get('/', verifyJWT, restrictTo('admin', 'doctor'), async (req, res, next) => {
  try {
    const patients = await Patient.find().populate('userId', 'firstName lastName email phone isVerified');
    res.json({ success: true, count: patients.length, data: patients });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', verifyJWT, async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('userId', 'firstName lastName email phone isVerified role');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', verifyJWT, async (req, res, next) => {
  try {
    const allowedFields = ['dateOfBirth', 'gender', 'bloodGroup', 'allergies', 'emergencyContact', 'address', 'insuranceProvider', 'insuranceId'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    const patient = await Patient.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/records', verifyJWT, async (req, res, next) => {
  try {
    const records = await HealthRecord.find({ patientId: req.params.id, isActive: true })
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/vitals', verifyJWT, async (req, res, next) => {
  try {
    const vitals = await Vitals.find({ patientId: req.params.id })
      .populate('recordedBy', 'firstName lastName')
      .sort({ recordedAt: -1 });
    res.json({ success: true, count: vitals.length, data: vitals });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/appointments', verifyJWT, async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patientId: req.params.id })
      .populate('doctorId', 'specialization')
      .sort({ datetime: -1 });
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
