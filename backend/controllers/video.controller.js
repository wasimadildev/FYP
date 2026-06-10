const twilioClient = require('../twilio');

async function generateToken(req, res, next) {
  try {
    const { identity, room } = req.body;
    if (!identity || !room) {
      return res.status(400).json({ success: false, message: 'identity and room are required' });
    }

    const AccessToken = twilioClient.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { identity }
    );

    const videoGrant = new VideoGrant({ room });
    token.addGrant(videoGrant);

    res.json({ success: true, token: token.toJwt(), identity, room });
  } catch (err) {
    next(err);
  }
}

async function createRoom(req, res, next) {
  try {
    const { uniqueName, maxParticipants } = req.body;

    const room = await twilioClient.video.v1.rooms.create({
      uniqueName: uniqueName || `room-${Date.now()}`,
      maxParticipants: maxParticipants || 2,
      type: 'group',
    });

    res.status(201).json({ success: true, data: { sid: room.sid, uniqueName: room.uniqueName } });
  } catch (err) {
    next(err);
  }
}

async function listRooms(req, res, next) {
  try {
    const rooms = await twilioClient.video.v1.rooms.list({
      status: 'in-progress',
      limit: 20,
    });

    const data = rooms.map((r) => ({
      sid: r.sid,
      uniqueName: r.uniqueName,
      status: r.status,
      participantCount: r.participantCount,
      dateCreated: r.dateCreated,
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateToken, createRoom, listRooms };
