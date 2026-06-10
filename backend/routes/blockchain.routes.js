const express = require('express');
const router = express.Router();
const { verifyRecord, requestConsent, grantConsent, revokeConsent, getAuditTrail, releasePayment } = require('../controllers/blockchain.controller');
const verifyJWT = require('../middleware/auth.middleware');

router.use(verifyJWT);

router.get('/health-record/:cid', verifyRecord);
router.post('/consent/request', requestConsent);
router.post('/consent/grant', grantConsent);
router.post('/consent/revoke', revokeConsent);
router.get('/audit/:patientId', getAuditTrail);
router.post('/payment/release', releasePayment);

module.exports = router;
