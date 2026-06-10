const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

async function createAppointment(req, res, next) {
  try {
    const { doctorId, datetime, symptoms } = req.body;
    if (!doctorId || !datetime) {
      return res.status(400).json({ success: false, message: 'doctorId and datetime are required' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const appointment = await Appointment.create({
      doctorId,
      patientId: req.body.patientId || req.user.id,
      datetime: new Date(datetime),
      symptoms,
      fee: doctor.consultationFee,
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
}

async function getAppointments(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === 'patient') {
      filter.patientId = req.user.id;
    } else if (req.user.role === 'doctor') {
      filter.doctorId = req.user.id;
    }

    if (req.query.status) filter.status = req.query.status;

    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'specialization')
      .populate('patientId', 'userId')
      .sort({ datetime: -1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    next(err);
  }
}

async function updateAppointment(req, res, next) {
  try {
    const { datetime, symptoms } = req.body;
    const updates = {};
    if (datetime) updates.datetime = new Date(datetime);
    if (symptoms) updates.symptoms = symptoms;

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
}

async function completeAppointment(req, res, next) {
  try {
    const { diagnosis, notes } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', diagnosis, notes },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
}

module.exports = { createAppointment, getAppointments, updateAppointment, updateStatus, completeAppointment };
