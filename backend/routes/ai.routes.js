const express = require('express');
const router = express.Router();
const { chat, summarizeRecords, findSpecialist, analyzeVitals } = require('../controllers/ai.controller');
const verifyJWT = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimit.middleware');

router.use(verifyJWT);
router.use(aiLimiter);

router.post('/chat', chat);
router.post('/summarize', summarizeRecords);
router.post('/find-specialist', findSpecialist);
router.post('/analyze-vitals', analyzeVitals);

module.exports = router;
