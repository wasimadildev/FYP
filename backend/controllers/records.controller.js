const HealthRecord = require('../models/HealthRecord');
const AccessLog = require('../models/AccessLog');
const { uploadFile, fetchFromIPFS, removeFromIPFS } = require('../services/ipfs.service');

async function createRecord(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const ipfsResult = await uploadFile(req.file.buffer, req.file.originalname, {
      name: `health-record-${Date.now()}`,
    });

    const record = await HealthRecord.create({
      patientId: req.body.patientId,
      cid: ipfsResult.cid,
      fileType: req.body.fileType || 'other',
      category: req.body.category,
      description: req.body.description,
      uploadedBy: req.user.id,
      encryptedAesKey: req.body.encryptedAesKey,
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

async function getRecords(req, res, next) {
  try {
    const filter = {};
    if (req.query.patientId) filter.patientId = req.query.patientId;
    if (req.query.fileType) filter.fileType = req.query.fileType;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const records = await HealthRecord.find(filter)
      .populate('patientId', 'userId')
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
}

async function getRecord(req, res, next) {
  try {
    const record = await HealthRecord.findById(req.params.id)
      .populate('patientId')
      .populate('uploadedBy', 'firstName lastName email');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    await AccessLog.create({
      recordId: record._id,
      accessedBy: req.user.id,
      accessType: 'view',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

async function updateRecord(req, res, next) {
  try {
    const allowedFields = ['fileType', 'category', 'description', 'isActive'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const record = await HealthRecord.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

async function deleteRecord(req, res, next) {
  try {
    const record = await HealthRecord.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    await AccessLog.create({
      recordId: record._id,
      accessedBy: req.user.id,
      accessType: 'delete',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (err) {
    next(err);
  }
}

async function shareRecord(req, res, next) {
  try {
    const { doctorId } = req.body;
    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'Doctor ID is required' });
    }

    const record = await HealthRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    await AccessLog.create({
      recordId: record._id,
      accessedBy: req.user.id,
      accessType: 'share',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Record shared successfully' });
  } catch (err) {
    next(err);
  }
}

async function getAccessLog(req, res, next) {
  try {
    const logs = await AccessLog.find({ recordId: req.params.id })
      .populate('accessedBy', 'firstName lastName email role')
      .sort({ timestamp: -1 });

    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
}

module.exports = { createRecord, getRecords, getRecord, updateRecord, deleteRecord, shareRecord, getAccessLog };
