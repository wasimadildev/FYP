const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Patient = require('../models/Patient');
const HealthRecord = require('../models/HealthRecord');
const jwt = require('jsonwebtoken');

let patientUser;
let patient;
let authToken;
let recordId;

beforeAll(async () => {
  await User.deleteMany({});
  await Patient.deleteMany({});
  await HealthRecord.deleteMany({});

  patientUser = await User.create({
    email: 'patient@test.com',
    password: 'password123',
    role: 'patient',
    firstName: 'Patient',
    lastName: 'Test',
  });

  patient = await Patient.create({ userId: patientUser._id });

  authToken = jwt.sign(
    { userId: patientUser._id, role: 'patient' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await User.deleteMany({});
  await Patient.deleteMany({});
  await HealthRecord.deleteMany({});
  await mongoose.connection.close();
});

describe('Records Routes', () => {
  describe('POST /api/records', () => {
    it('should create a record and return 201', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .field('patientId', patient._id.toString())
        .field('fileType', 'lab-report')
        .field('description', 'Blood test results')
        .attach('file', Buffer.from('test file content'), 'test.pdf');
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      recordId = res.body.data._id;
    });
  });

  describe('GET /api/records', () => {
    it('should list records and return 200', async () => {
      const res = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/records/:id', () => {
    it('should get a single record and return 200', async () => {
      const res = await request(app)
        .get(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(recordId);
    });
  });

  describe('DELETE /api/records/:id', () => {
    it('should soft-delete a record and return 200', async () => {
      const res = await request(app)
        .delete(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/records/:id/share', () => {
    it('should share a record and return 200', async () => {
      const doctorUser = await User.create({
        email: 'doctor@test.com',
        password: 'password123',
        role: 'doctor',
        firstName: 'Doctor',
        lastName: 'Test',
      });
      const Doctor = require('../models/Doctor');
      const doctor = await Doctor.create({ userId: doctorUser._id, specialization: 'Cardiology', licenseNumber: 'LIC123' });

      const res = await request(app)
        .post(`/api/records/${recordId}/share`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ doctorId: doctor._id.toString() });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
