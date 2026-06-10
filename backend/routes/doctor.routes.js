const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const verifyJWT = require('../middleware/auth.middleware');
const restrictTo = require('../middleware/rbac.middleware');

router.get('/', verifyJWT, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.specialization) filter.specialization = req.query.specialization;
    if (req.query.isAvailable !== undefined) filter.isAvailable = req.query.isAvailable === 'true';
    const doctors = await Doctor.find(filter).populate('userId', 'firstName lastName email phone isVerified');
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', verifyJWT, async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'firstName lastName email phone isVerified role');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', verifyJWT, restrictTo('doctor', 'admin'), async (req, res, next) => {
  try {
    const allowedFields = ['specialization', 'consultationFee', 'availableSlots', 'isAvailable', 'yearsOfExperience'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/patients', verifyJWT, restrictTo('doctor', 'admin'), async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.id })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName email phone' },
      })
      .sort({ datetime: -1 });
    const patientMap = new Map();
    for (const apt of appointments) {
      if (apt.patientId) {
        patientMap.set(apt.patientId._id.toString(), apt.patientId);
      }
    }
    const patients = Array.from(patientMap.values());
    res.json({ success: true, count: patients.length, data: patients });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/appointments', verifyJWT, async (req, res, next) => {
  try {
    const filter = { doctorId: req.params.id };
    if (req.query.status) filter.status = req.query.status;
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'userId')
      .sort({ datetime: -1 });
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
