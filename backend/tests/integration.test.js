const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const HealthRecord = require('../models/HealthRecord');
const Appointment = require('../models/Appointment');

let patientToken;
let patientId;
let doctorToken;
let doctorId;
let recordId;
let appointmentId;

beforeAll(async () => {
  await User.deleteMany({});
  await Patient.deleteMany({});
  await Doctor.deleteMany({});
  await HealthRecord.deleteMany({});
  await Appointment.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await Patient.deleteMany({});
  await Doctor.deleteMany({});
  await HealthRecord.deleteMany({});
  await Appointment.deleteMany({});
  await mongoose.connection.close();
});

describe('Full Patient Flow', () => {
  it('should register a patient', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'patient@flow.com',
        password: 'password123',
        role: 'patient',
        firstName: 'Flow',
        lastName: 'Patient',
      });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    patientToken = res.body.token;
  });

  it('should register a doctor', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'doctor@flow.com',
        password: 'password123',
        role: 'doctor',
        firstName: 'Flow',
        lastName: 'Doctor',
        specialization: 'Cardiology',
        licenseNumber: 'LIC999',
      });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    doctorToken = res.body.token;
  });

  it('should login as patient', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'patient@flow.com', password: 'password123' });
    expect(res.status).toBe(200);
    patientToken = res.body.token;
  });

  it('should get patient profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    const patientDoc = await Patient.findOne({ userId: res.body.user._id });
    patientId = patientDoc._id.toString();
  });

  it('should upload a health record', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${patientToken}`)
      .field('patientId', patientId)
      .field('fileType', 'lab-report')
      .field('description', 'Integration test record')
      .attach('file', Buffer.from('test content'), 'test.pdf');
    expect(res.status).toBe(201);
    recordId = res.body.data._id;
  });

  it('should get doctor list and find the doctor', async () => {
    const res = await request(app)
      .get('/api/doctors')
      .set('Authorization', `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    doctorId = res.body.data[0]._id;
  });

  it('should book an appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId,
        patientId,
        datetime: new Date(Date.now() + 86400000).toISOString(),
        symptoms: 'Chest pain',
      });
    expect(res.status).toBe(201);
    appointmentId = res.body.data._id;
  });

  it('should chat with AI', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ message: 'What should I expect during a cardiology checkup?' });
    expect(res.status).toBe(200);
    expect(res.body.data.reply).toBeDefined();
  });

  it('should list patient appointments', async () => {
    const res = await request(app)
      .get(`/api/patients/${patientId}/appointments`)
      .set('Authorization', `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should list patient records', async () => {
    const res = await request(app)
      .get(`/api/patients/${patientId}/records`)
      .set('Authorization', `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
