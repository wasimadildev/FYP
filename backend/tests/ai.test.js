const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let authToken;

beforeAll(async () => {
  await User.deleteMany({});

  const user = await User.create({
    email: 'doctor@test.com',
    password: 'password123',
    role: 'doctor',
    firstName: 'Doctor',
    lastName: 'Test',
  });

  authToken = jwt.sign(
    { userId: user._id, role: 'doctor' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('AI Routes', () => {
  describe('POST /api/ai/chat', () => {
    it('should return 200 and a response when message is provided', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: 'What are the symptoms of diabetes?' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 when message is missing', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/ai/find-specialist', () => {
    it('should return 200 with specialties for symptoms', async () => {
      const res = await request(app)
        .post('/api/ai/find-specialist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ symptoms: 'chest pain and shortness of breath' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.specialties).toContain('Cardiology');
    });
  });
});
