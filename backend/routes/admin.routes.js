const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AccessLog = require('../models/AccessLog');
const verifyJWT = require('../middleware/auth.middleware');
const restrictTo = require('../middleware/rbac.middleware');

router.use(verifyJWT, restrictTo('administrator'));

router.get('/users', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isVerified !== undefined) filter.isVerified = req.query.isVerified === 'true';
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
});

router.put('/users/:id/verify', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

router.get('/audit-logs', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.accessType) filter.accessType = req.query.accessType;
    if (req.query.userId) filter.accessedBy = req.query.userId;
    const logs = await AccessLog.find(filter)
      .populate('accessedBy', 'firstName lastName email role')
      .populate('recordId', 'fileType category')
      .sort({ timestamp: -1 })
      .limit(100);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
