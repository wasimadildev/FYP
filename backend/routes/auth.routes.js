const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, getMe } = require('../controllers/auth.controller');
const verifyJWT = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const { sanitizeEmail, sanitizePassword, sanitizeRole, sanitizeFirstName, sanitizeLastName, validate } = require('../middleware/sanitize.middleware');

router.post('/register', authLimiter, sanitizeEmail, sanitizePassword, sanitizeRole, sanitizeFirstName, sanitizeLastName, validate, register);
router.post('/login', authLimiter, sanitizeEmail, sanitizePassword, validate, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/me', verifyJWT, getMe);

module.exports = router;
