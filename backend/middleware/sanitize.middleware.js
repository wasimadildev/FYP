const { body, validationResult } = require('express-validator');

const sanitizeEmail = body('email').isEmail().normalizeEmail().withMessage('Valid email is required');
const sanitizePassword = body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters');
const sanitizeRole = body('role').isIn(['patient', 'doctor', 'ai-engineer', 'administrator']).withMessage('Invalid role');
const sanitizeFirstName = body('firstName').trim().notEmpty().withMessage('First name is required');
const sanitizeLastName = body('lastName').trim().notEmpty().withMessage('Last name is required');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = {
  sanitizeEmail,
  sanitizePassword,
  sanitizeRole,
  sanitizeFirstName,
  sanitizeLastName,
  validate,
};
