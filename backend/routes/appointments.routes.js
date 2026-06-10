const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, updateAppointment, updateStatus, completeAppointment } = require('../controllers/appointments.controller');
const verifyJWT = require('../middleware/auth.middleware');

router.post('/', verifyJWT, createAppointment);
router.get('/', verifyJWT, getAppointments);
router.put('/:id', verifyJWT, updateAppointment);
router.patch('/:id/status', verifyJWT, updateStatus);
router.post('/:id/complete', verifyJWT, completeAppointment);

module.exports = router;
