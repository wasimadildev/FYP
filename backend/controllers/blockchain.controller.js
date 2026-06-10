const blockchainService = require('../services/blockchain.service');
const HealthRecord = require('../models/HealthRecord');
const AccessLog = require('../models/AccessLog');

async function verifyRecord(req, res, next) {
  try {
    const { cid } = req.params;
    const record = await blockchainService.getHealthRecord(cid);
    res.json({ success: true, data: { cid, exists: !!record, record } });
  } catch (err) {
    next(err);
  }
}

async function requestConsent(req, res, next) {
  try {
    const { patientAddress, doctorAddress, duration } = req.body;
    if (!patientAddress || !doctorAddress) {
      return res.status(400).json({ success: false, message: 'patientAddress and doctorAddress are required' });
    }

    const txHash = await blockchainService.requestConsent(patientAddress, doctorAddress, duration || 86400);
    res.json({ success: true, data: { txHash } });
  } catch (err) {
    next(err);
  }
}

async function grantConsent(req, res, next) {
  try {
    const { doctorAddress, recordCid } = req.body;
    if (!doctorAddress || !recordCid) {
      return res.status(400).json({ success: false, message: 'doctorAddress and recordCid are required' });
    }

    const txHash = await blockchainService.grantConsent(doctorAddress, recordCid);
    res.json({ success: true, data: { txHash } });
  } catch (err) {
    next(err);
  }
}

async function revokeConsent(req, res, next) {
  try {
    const { doctorAddress } = req.body;
    if (!doctorAddress) {
      return res.status(400).json({ success: false, message: 'doctorAddress is required' });
    }

    const txHash = await blockchainService.revokeConsent(doctorAddress);
    res.json({ success: true, data: { txHash } });
  } catch (err) {
    next(err);
  }
}

async function getAuditTrail(req, res, next) {
  try {
    const { patientId } = req.params;
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'patientId is required' });
    }

    const events = await blockchainService.getAuditEvents(patientId);
    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    next(err);
  }
}

async function releasePayment(req, res, next) {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'appointmentId is required' });
    }

    const txHash = await blockchainService.releaseEscrow(appointmentId);
    res.json({ success: true, data: { txHash } });
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyRecord, requestConsent, grantConsent, revokeConsent, getAuditTrail, releasePayment };
