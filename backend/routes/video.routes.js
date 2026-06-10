const express = require('express');
const router = express.Router();
const { generateToken, createRoom, listRooms } = require('../controllers/video.controller');
const verifyJWT = require('../middleware/auth.middleware');

router.use(verifyJWT);

router.post('/token', generateToken);
router.post('/room', createRoom);
router.get('/rooms', listRooms);

module.exports = router;
