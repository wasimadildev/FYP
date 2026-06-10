const express = require('express');
const router = express.Router();
const { createRecord, getRecords, getRecord, updateRecord, deleteRecord, shareRecord, getAccessLog } = require('../controllers/records.controller');
const verifyJWT = require('../middleware/auth.middleware');
const restrictTo = require('../middleware/rbac.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/', verifyJWT, upload.single('file'), createRecord);
router.get('/', verifyJWT, getRecords);
router.get('/:id', verifyJWT, getRecord);
router.put('/:id', verifyJWT, updateRecord);
router.delete('/:id', verifyJWT, deleteRecord);
router.post('/:id/share', verifyJWT, restrictTo('patient', 'doctor'), shareRecord);
router.get('/:id/access-log', verifyJWT, getAccessLog);

module.exports = router;
